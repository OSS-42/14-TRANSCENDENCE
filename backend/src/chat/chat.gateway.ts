import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { createMessageDto } from './dto/create.message.dto';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { stringify } from 'querystring';


@WebSocketGateway({ cors: true})
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
  }

//Retourne le clientId du socket, si lutilisateur n<est pas connect/ la fonciton retourne undefined.
  getSoketIdFromUserId(id: number): string | undefined {
    return this.connectedUsers.get(id);
  }


  //-----------------test morgan-----------------
  @SubscribeMessage('allo')
  handleAllo (client: Socket) {
    // this.server.to(client.id).emit('allo')
    console.log('allo')
  }
  
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void { //voir pour changer any
    this.server.emit('messageResponse', payload); // Diffuser le message à tous les clients connectés
  }
  

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, payload: any) {
    if (await this.chatService.isRoomExist(payload.name) == null){ // la room n'existe pas
      // ici il faut rajouter du code pour ajouter le nouveau canal a la base de donnée
      // et faire les manipulations pour ajouter le chat dans la db du user, ajouter le user au db du canal etc ...            
      client.join(payload.name); 
      const userId = await this.chatService.getUserIdFromUsername(payload.username)
      this.chatService.createRoom(payload.name, userId, payload.password, payload.invit)
      client.emit('messageResponse', {
        id: payload.id,
        name: payload.username,
        text: `You create and join new room ${payload.name}!`,
      })
    } else { //la room existe
      client.emit('messageResponse', {
        // ici il va falloir verifier si l'utilisateur est deja dans le canal et envoyer un message adapté.
        // if pas deja dedans ... 
          // Si il n'est pas dedans il faut verifier si il n'est pas banni
          // ...
          // Sinon emit un message pour dire que l'utilisateur est ban
          // ...
          // Si il n'est pas dedans il faut verifier si il y a un mot de passe et si l'utilisateur le fourni
          // ...
          // Sinon emit un message pour dire que le mot de passe est mauvais
          // ...
          // Si il n'est pas dedans il faut verifier si le channel n'est pas sur invitation seuelement
          // ...
          // Sinon emit un message pour dire que le channel est sur invitation seuelement
          // ...
        id: payload.id, // un identifiant unique pour chaque message
        name: payload.username,
        text: `You join the room ${payload.name} !`,
        // else vous etes deja dans la room ...
      })
    }
  }

  
    @SubscribeMessage('privmsg')
    async privateMessage(client: Socket, payload: any) {
      const userId = await this.chatService.getUserIdFromUsername(payload.target);
      const socketId = await this.getSoketIdFromUserId(userId)
      console.log(socketId)
      console.log(client.to(socketId).emit('messageResponse', `${payload.username}: ${payload.message}`));
      console.log(this.connectedUsers);
    }
  
  //-----------------test morgan-----------------
  
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



