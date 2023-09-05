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


  // //-------------------------------------------------------- TEST MORGAN --------------------------------------------------------
  
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void { //voir pour changer any
    this.server.emit('messageResponse', {
      id: payload.id,
      name: payload.name,
      channel: 'General',
      text: payload.message
    }); // Diffuser le message à tous les clients connectés
  }
  


  // JOIN
  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, payload: any) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const room = await this.chatService.isRoomExist(payload.channelName) 
    let notice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.param[1] !== undefined)
      notice = '#JOIN : bad format'
    // ------------------------ Creation d'un channel ------------------------
    else if (room === null){
      let invite : boolean = false;
      if (payload.param[0] === '+i')
        invite = true;
      await this.chatService.createRoom(payload.channelName, userId, payload.param, invite)// voir avec sam pour le param invit
      client.join(payload.channelName); 
      if (payload.param[0] !== undefined && payload.param[0] !== '+i') //Channel avec mdp
        await this.chatService.createPassword(payload.param[0], payload.channelName)
      notice = `You create and join new room ${payload.channelName}`
    }

    // ------------------------ le channel existe ------------------------
    else { 
      if (await this.chatService.isUserMemberOfRoom(userId, room.id) === true)//Si l'utilisateur est deja membre du channel ERREUR : la fonction attend l'id de l'utilisateur
        notice = `#JOIN: You already are a member of the room ${payload.channelName}`
      else if ( await this.chatService.isBanFromRoom(payload.username, payload.channelName) === true) //Si l'utilisateur est banni du channel
        notice = `#JOIN: You are ban from the room ${payload.channelName}`
      else if ( await this.chatService.isRoomProtected(payload.channelName) === true 
        && ( payload.param[0] === undefined 
        || await this.chatService.validatePassword(payload.param[0], payload.channelName) === false))// Si l'utilisateur a rentré un mauvais mot de passe
        notice = `#JOIN: Error when trying to join ${payload.channelName} : bad password`
      else if ( await this.chatService.isRoomPrivate(payload.channelName) === true)
        notice = `#JOIN: the channel ${payload.channelName} is on invitation only`
      else { // L'utilisateur rejoint la room         
            await this.chatService.joinRoom(room.id, userId)
            client.join(payload.channelName);
            notice = `You join ${payload.channelName}`
      }
    }
    client.emit('notice', {
      id: payload.id,
      name: payload.username,
      channel: payload.channelName,
      text: undefined,
      notice : notice
    })
  }
  
  // // JOIN
  // @SubscribeMessage('joinRoom')
  // async joinRoom(client: Socket, payload: any) {
  //   // ------------------------ Trop de parametre ------------------------
  //   if (payload.param[1] !== undefined)
  //   client.emit('messageResponse', {
  //     id: payload.id,
  //     name: payload.username,
  //     text: `#JOIN : bad format`,
  //   })
    
  //   // ------------------------ Creation d'un channel ------------------------
  //   else if (await this.chatService.isRoomExist(payload.channelName) === null){
  //     // et faire les manipulations pour ajouter le channel dans la db du user      
  //     let invite : boolean = false;
  //     if (payload.param[0] === '+i')
  //       invite = true;
  //     const userId = await this.chatService.getUserIdFromUsername(payload.username)
  //     await this.chatService.createRoom(payload.channelName, userId, payload.param, invite)// voir avec sam pour le param invit
  //     client.join(payload.channelName); 
  //     if (payload.param[0] !== undefined && payload.param[0] !== '+i') //Channel avec mdp
  //       await this.chatService.createPassword(payload.param[0], payload.channelName)
  //     // else if (payload.param !== undefined && payload.param === "+i") //channel sur invitation seulement
  //       //Fonction pour determiner un channel sur invitation seulement
  //     client.emit('messageResponse', {
  //       id: payload.id,
  //       name: payload.username,
  //       text: `You create and join new room ${payload.channelName}`,
  //     })
  //   }

  //   // ------------------------ le channel existe ------------------------
  //   else { 
  //     const room = await this.chatService.isRoomExist(payload.channelName) 
  //     const userId = await this.chatService.getUserIdFromUsername(payload.username)
  //     if (await this.chatService.isUserMemberOfRoom(userId, room.id) === true) { //Si l'utilisateur est deja membre du channel ERREUR : la fonction attend l'id de l'utilisateur
  //       client.emit('messageResponse', {
  //         id: payload.id,
  //         name: payload.username,
  //         text: `You already are a member of the room ${payload.channelName} `,
  //       })
  //     } 
  //     else if ( await this.chatService.isBanFromRoom(payload.username, payload.channelName) === true){ //Si l'utilisateur est banni du channel
  //       client.emit('messageResponse', {
  //         id: payload.id,
  //         name: payload.username,
  //         text: `You are ban from the room ${payload.channelName} `,
  //       })
  //     }
  //     else if ( await this.chatService.isRoomProtected(payload.channelName) === true 
  //       && ( payload.param[0] === undefined 
  //       || await this.chatService.validatePassword(payload.param[0], payload.channelName) === false)) { // Si l'utilisateur a rentré un mauvais mot de passe
  //       client.emit('messageResponse', {
  //         id: payload.id,
  //         name: payload.username,
  //         text: `Error when trying to join ${payload.channelName} : bad password`,
  //       })
  //     }
  //     // else if ( await this.chatService.isRoominviteOnly(payload.channelName) === true) {
  //       //   client.emit('messageResponse', {
  //         //     id: payload.id,
  //         //     name: payload.username,
  //         //     text: `Error when trying to join ${payload.name} :  you need to be invited`,
  //         //   })
  //         // }
  //     else { // L'utilisateur rejoint la room         
  //           const userId = await this.chatService.getUserIdFromUsername(payload.username)
  //           await this.chatService.joinRoom(room.id, userId)
  //           client.join(payload.channelName);
  //           // faire les manipulations  
  //           client.emit('messageResponse', {
  //             id: payload.id,
  //             name: payload.username,
  //             text: `You join ${payload.channelName}`,
  //           })
  //     }
  //   }
  // }



  // PRIVMSG   
  @SubscribeMessage('privmsg')
  async privateMessage(client: Socket, payload: any) {
    const roomName = payload.target.slice(1);
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const roomObject = await this.chatService.isRoomExist(roomName)
    let notice : string = null
    let event : string = "notice"

    // ---------------------- LE MESSAGE S'ADRESSE A UN CHANNEL ----------------------
    if (payload.target.startsWith("!")) {
      // ---------------------- LE  CHANNEL N'EXISTE PAS ----------------------
      if (roomObject === null)
      notice = `#PRIVMSG: The channel ${roomName} doesn't exist`
      // ---------------------- L'UTILISATEUR N'EST PAS MEMBRE DU CHANNEL ----------------------
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false) //l'utilisateur ne fait pas partie du channel
      notice = `#PRIVMSG: You are not a member of the channel ${roomName}`
      // ---------------------- L'UTILISATEUR EST MUTE DANS LE CHANNEL ----------------------
      // else if l'utilisateur est mute
      // ...
      // ---------------------- ON ENVOI LE MESSAGE AU CHANNEL  ----------------------
      else
      event = "messageResponse"
      // ---------------------- SI L'EVENT N'EST PAS UNE NOTICE  ----------------------
      if (event === "messageResponse")
      this.server.to(roomName).emit(event, {
        id: payload.id,
        name: payload.username,
        channel: roomName,
        text: payload.message,
        notice : notice
      })
      else 
        client.emit(event, {
          id: payload.id,
          name: payload.username,
          channel: roomName,
          text: payload.message,
          notice : notice
        })
    } 
    
    // ---------------------- LE MESSAGE S'ADRESSE A UN UTILISATEUR ----------------------
    else { //le message s'adresse a un utilistateur 
      const userId = await this.chatService.getUserIdFromUsername(payload.target);
      const socketId = await this.getSoketIdFromUserId(userId)
      // ---------------------- L'UTILISATEUR N'EXISTE PAS ----------------------
      if (userId === null)
        notice = `#PRIVMSG: The user ${payload.target} doesn't exist`
      // il faut verifier si l'utilisateur n'est pas bloqué. Mais c'est plus frontend je penses
      // ---------------------- SINON ON ENVOI LE MESSAGE A L'UTILISATEUR  ----------------------
      else
        event = 'messageResponse'
      if (event === 'messageResponse')
        this.server.to(socketId).emit(event, {
        id: payload.id,
        name: payload.username,
        channel: undefined,
        text: payload.message,
        notice : notice
        })
        else
        // ---------------------- J'ENVOIS UNE NOTICE A L'UTILSATEUR DE LA COMMANDE (ERREUR)  ----------------------
        client.emit(event, {
        userId: userId,
        id: payload.id,
        name: payload.username,
        channel: undefined,
        text: payload.message,
        notice : notice
        })
    }
  }
 
    


  // INVITE
  @SubscribeMessage('inviteRoom')
  async inviteRoom(client: Socket, payload: any) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    let socketId = await this.getSoketIdFromUserId(userId)
    const targetId = await this.chatService.getUserIdFromUsername(payload.target)
    const targetSocket = await this.getSoketIdFromUserId(targetId)
    const roomObject = await this.chatService.isRoomExist(payload.channelName[0])
    let message : string = null
    let notice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.channelName[1] !== undefined)
    notice = `#INVITE : bad format`
    // ------------------------ Le channel n'existe pas ------------------------
    else if (roomObject === null)
    notice = `#INVITE: The room ${payload.channelName[0]} don't exist`
    // ------------------------ L'utilisateur n'est pas membre de la room ------------------------
    else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
    notice = `#INVITE: The room ${payload.channelName[0]} don't exist`
    // ------------------------ La cible n'existe pas ------------------------
    else if (targetId === null)
    notice = `#INVITE: The user ${payload.target} doesn't exist`
    // ------------------------ La cible est deja membre de la room ------------------------
    else if (await this.chatService.isUserMemberOfRoom(targetId, roomObject.id) === true)
    notice = `#INVITE: The user ${payload.target} is already a member of the room ${payload.channelName[0]}`
    // ------------------------ Sinon on ajoute la cible dans la room ------------------------
    else {
      socketId = await this.getSoketIdFromUserId(targetId)
      notice = `${payload.username} invited you to the channel ${payload.channelName}`
      await this.chatService.joinRoom(roomObject.id, targetId)
      this.server.to(targetSocket).socketsJoin(payload.channelName) //faire des tests
    }
    this.server.to(socketId).emit('notice', {
      id: payload.id,
      name: payload.username,
      channel: undefined,
      text: message,
      notice: notice
    })
  }

  // //-------------------------------------------------------- TEST MORGAN --------------------------------------------------------
  
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



