import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { createMessageDto } from './dto/create.message.dto';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { stringify } from 'querystring';


@WebSocketGateway({ cors: true,  namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // Map pour stocker les ID d'utilisateur associés aux IDs de socket
  // AVec cette map, on peut identifier le client.id à partir d'un Utilisateur ID.
  private connectedUsers: Map<number, string> = new Map(); 

  constructor(private chatService: ChatService, private config: ConfigService) {}
  @WebSocketServer()
  server: Server

  //Fonction qui gère les nouvelles connexion au socket
  //dès qu'il y a un nouveau client, cette fonction est appelée
  handleConnection(client: Socket): void {
    console.log(`⚡: ${client.id} user just connected!`);
    const token = client.handshake.query.token as string
      if (token) {
        try {
          const decoded = verify(token, this.config.get("JWT_SECRET"));
          console.log("voici lidentite du socket")
          console.log(decoded)
          this.connectedUsers.set( Number(decoded.sub), client.id);
          const connectedUserIds = Array.from(this.connectedUsers.keys());
          this.server.emit("updateConnectedUsers", connectedUserIds)
          //FONCTION QUI VERIFIE LES CHANNELS DONT LUTILASATEUR EST MEMBRE ET LES JOIN TOUS
        } catch (error) {
          client.disconnect();
        }
      } else {
        client.disconnect();
      }
   }
  //Fonction qui gère les déconnexions au socket
  //dès qu'un client se déconnecte du socket, cette fonction est appelée
  handleDisconnect(client: Socket): void {
    console.log(`🔥: ${client.id} user disconnected`); 
    //supprime le le client.id de la map de connectedUser lorsque ce dernier ce déconnecte!
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
    const connectedUserIds = Array.from(this.connectedUsers.keys());
    this.server.emit("updateConnectedUsers", connectedUserIds)
  }

//Retourne le clientId du socket, si lutilisateur n<est pas connect/ la fonciton retourne undefined.
  getSoketIdFromUserId(id: number): string | undefined {
    return this.connectedUsers.get(id);
  }


  //-----------------test morgan-----------------
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void { //voir pour changer any
    this.server.emit('messageResponse', {
      id: payload.id,
      name: payload.name,
      channel: 'General',
      text: payload.message
    }); // Diffuser le message à tous les clients connectés
  }
  
  //VERIFIER TOUT CE QUI A ETAIT FAIT AVEC SAM POUR VOIR SI CA FONCTIONNE
  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, payload: any) {
    if (await this.chatService.isRoomExist(payload.channelName) === null){ // le channel n'existe pas donc l'utilisateur la créé
      // Verifier si le channel a un mot de passe *est-ce que avec la fonction createPassword c'est suffisant ?*
      // Verifier si le channel est sur invitation *je crois que sam fais deja ca dans la fonction createRoom*
      // et faire les manipulations pour ajouter le chat dans la db du user          
      client.join(payload.channelName); 
      const userId = await this.chatService.getUserIdFromUsername(payload.username)
      const inviteMode = payload.invit === "+i"; //si payload.invit === '+i' alors inviteMode = true sinon false
      await this.chatService.createRoom(payload.channelName, userId, payload.password, inviteMode)
      if (payload.password !== undefined )
        await this.chatService.createPassword(payload.password, payload.channelName)
      client.emit('messageResponse', {
        id: payload.id,
        name: payload.username,
        text: `You create and join new room ${payload.channelName}`,
      })
    } 
    else { //le channel existe
      const room = await this.chatService.isRoomExist(payload.channelName) 
      const userId = await this.chatService.getUserIdFromUsername(payload.username)
      if (await this.chatService.isUserMemberOfRoom(userId, room.id) === true) { //Si l'utilisateur est deja membre du channel ERREUR : la fonction attend l'id de l'utilisateur
        client.emit('messageResponse', {
          id: payload.id,
          name: payload.username,
          text: `You already are a member of the room ${payload.channelName} `,
        })
      } 
      else if ( await this.chatService.isBanFromRoom(payload.username, payload.channelName) === true){ //Si l'utilisateur est banni du channel
        client.emit('messageResponse', {
          id: payload.id,
          name: payload.username,
          text: `You are ban from the room ${payload.name} `,
        })
      }
      else if ( await this.chatService.isRoomProtected(payload.channelName) === true 
      && await this.chatService.validatePassword(payload.password, payload.channelName) === false) { // Si l'utilisateur a rentré un mauvais mot de passe
        client.emit('messageResponse', {
          id: payload.id,
          name: payload.username,
          text: `Error when trying to join ${payload.name} : bad password`,
        })
      }
      // else if ( await this.chatService.isRoominviteOnly(payload.channelName) === true) {
      //   client.emit('messageResponse', {
      //     id: payload.id,
      //     name: payload.username,
      //     text: `Error when trying to join ${payload.name} :  you need to be invited`,
      //   })
      // }
      else { // L'utilisateur rejoint la room         
        const userId = await this.chatService.getUserIdFromUsername(payload.username)
        await this.chatService.joinRoom(room.id, userId)
        client.emit('messageResponse', {
          id: payload.id,
          name: payload.username,
          text: `You join ${payload.name}`,
        })
      }
    }
  }
  
  
  @SubscribeMessage('privmsg')
  async privateMessage(client: Socket, payload: any) {
    //Tester cette partie a l'ecole
    if (payload.target.startsWith("!")) { // le message s'adresse a un channel
      const roomName = payload.target.slice(1);
      const userId = await this.chatService.getUserIdFromUsername(payload.username)
      const roomObject = await this.chatService.isRoomExist(roomName)
      if (roomObject !== null && await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === true) { //l'utilisateur fait bien partie du channel
        this.server.to(`#${roomName}`).emit('messageResponse', {
          id: payload.id,
          name: payload.username,
          channel: roomName,
          text: payload.message
        })
        client.emit('messageResponse', {
          id: payload.id,
          name: payload.username,
          channel: roomName,
          text: payload.message
        })
      }
      else { // L'utilisateur ne fait pas parti du channel
        client.emit('messageResponse', {
          id: payload.id,
          name: payload.username,
          channel: roomName,
          text: `You are not a member of the channel ${roomName}`
        })
      }
    } 
    else { //le message s'adresse a un utilistateur 
      // il faut verifier si l'utilisateur n'est pas bloqué. Mais c'est plus frontend je penses
      const userId = await this.chatService.getUserIdFromUsername(payload.target);
      const socketId = await this.getSoketIdFromUserId(userId)
      this.server.to(socketId).emit('messageResponse', {
        id: payload.id,
        name: payload.username,
        channel: undefined,
        text: payload.message
      })
    }
    }
    

  // @SubscribeMessage('inviteRoom')
  // async inviteRoom(client: Socket, payload: any) {
  //   if (await this.chatService.isRoomExist(payload.channelName) === null){ // le channel n'existe pas
  //     client.emit('messageResponse', {
  //       id: payload.id,
  //       name: payload.username,
  //       text: `The room ${payload.channelName} don't exist`,
  //     })
  //   } 
  //   else if { //le channel existe
  //   }
  // }
  // //-----------------test morgan-----------------
  
  @SubscribeMessage('findAllMessages')
  findAllMessages(client: any, payload: any): string {
    return 'array des messages';
  }

  //peut etre faire une focntion qui joint les rooms a debut de l<application.

  @SubscribeMessage('leaveRoom')
  async leaveRoom(@MessageBody('room') room: string, @ConnectedSocket() client: Socket) {
    client.leave(room); 
    client.emit('message', `You have left room ${room}.`); 
  }

  @SubscribeMessage('destroyRoom')
  async destroyRoom(@MessageBody('room') room: string, @ConnectedSocket() client: Socket) {
    this.server.to('room-name').emit('message', 'The room ${room} has been destroyed');
    this.server.of('/').adapter.rooms.delete(room);
  }
}


   //cette ligne permet de diffuser a tout le monde, sauf celui qui emet
   //client.broadcast.emit('test', {'payload':'test'});

  //exemple pour envoyer un message a une room.
   //this.server.to('room-name').emit('message', 'Hello from the room!');



