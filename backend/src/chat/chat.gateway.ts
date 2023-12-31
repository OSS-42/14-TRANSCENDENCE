import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { ConnectedUsersService } from '../connectedUsers/connectedUsers.service';
import { empty } from '@prisma/client/runtime/library';
import { OnModuleInit} from '@nestjs/common';

// admin, ban, inviteRoom, kickUser, mute
interface ChatPayload {
  username: string,
  channelName: string[],
  target: string
}

// block,unblock
interface BlockPayload {
  username: string,
  socketID: string,
  target: string[]
}

// default(message), help, list
interface GeneralMessagePayload {
  message: string[],
  name: string
}

//joinRoom, modeRoom, 
interface ChannelPayload {
  username: string,
  channelName: string,
  param : string[]
}

// privmsg
interface PrivmsgPayload {
  username: string,
  channelName: string,
  param : string
}

@WebSocketGateway({ cors: true,  namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  // Map pour stocker les ID d'utilisateur associés aux IDs de socket
  // AVec cette map, on peut identifier le client.id à partir d'un Utilisateur ID.
  //private connectedUsers: Map<number, string> = new Map(); 

  constructor(
    private chatService: ChatService,
    private config: ConfigService,
    private readonly connectedUsersService: ConnectedUsersService) {
    // setInterval(() => this.emitUpdateConnectedUsers(), 1500);
  }
  @WebSocketServer()
  server: Server

  // ----------------------- UPDATE ----------------------------
  // onmoduleinit pour s'assurer que le websocket est fini d'etre mis en place et ensuite de faire le premier emit.
  onModuleInit() {

    this.connectedUsersService.events.on("updateConnectedUsers", () => {
      this.emitUpdateConnectedUsers();
    })

    // this.emitUpdateConnectedUsers();
    this.server.emit('updateConnectedUsers', {
      connectedUserIds: Array.from(this.connectedUsersService.connectedUsers.keys()),
      connectedUserIdsPong: Array.from(this.connectedUsersService.connectedToPong.keys())
    });
  }
 
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
          this.connectedUsersService.set(Number(decoded.sub), client.id);
          this.connectedUsersService.set(Number(decoded.sub), client.id);
          this.connectedUsersService.setSocketChat(Number(decoded.sub), client);
          
          //FONCTION QUI VERIFIE LES CHANNELS DONT LUTILASATEUR EST MEMBRE ET LES JOIN TOUS
          this.joinRoomsAtConnection(Number(decoded.sub), client)
          this.server.emit("updateUserList")
          this.emitUpdateConnectedUsers()
          this.server.emit('newUser'); // ici morgan

        } catch (error) {
          client.disconnect();
        }
      } else {
        client.disconnect();
      }
   }
   // renvoie au client la liste des users connectés
 
  //Fonction qui gère les déconnexions au socket
  //dès qu'un client se déconnecte du socket, cette fonction est appelée
  handleDisconnect(client: Socket): void {
    const token = client.handshake.query.token as string; // UPDATE
    const decoded = verify(token, this.config.get("JWT_SECRET")); // UPDATE
    console.log(`🔥: ${client.id} user disconnected`); 
    //supprime le le client.id de la map de connectedUser lorsque ce dernier ce déconnecte!
    for (const [userId, socketId] of this.connectedUsersService.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsersService.delete(userId);
        break;
      }
    }
    this.emitUpdateConnectedUsers()
    // const connectedUserIds = Array.from(this.connectedUsers.keys());
    // this.server.emit("updateConnectedUsers", connectedUserIds)
  }

//Retourne le clientId du socket, si lutilisateur n<est pas connect/ la fonciton retourne undefined.
  //join chaque channel dont le user est membre
  private  async joinRoomsAtConnection(userId:number, client:Socket){
    const memberOf = await this.chatService.getRoomNamesUserIsMemberOf(userId)
    memberOf.forEach((roomName) => {
      client.join(roomName);
    });
  }

  @SubscribeMessage("onChatTab") // UPDATE
  private emitUpdateConnectedUsers(client?: Socket): void {
    const connectedUserIds = Array.from(this.connectedUsersService.connectedUsers.keys());
    const connectedUserIdsPong = Array.from(this.connectedUsersService.connectedToPong.keys());
    this.server.emit('updateConnectedUsers', { connectedUserIds, connectedUserIdsPong });
  }

  @SubscribeMessage('invitation')
  async invitation(client: Socket, payload: any){ //voir pour changer any
    const socketId = await this.connectedUsersService.getSocketId(payload.userId)
    this.server.to(socketId).emit('invitation', {
      roomId: payload.roomId,
      challengerUsername : payload.challengerUsername,
      challengerId : payload.challengerId
    });
  }
  
  @SubscribeMessage('challengeAccepted')
  async challengeAccepted(client: Socket, payload: any){ 
    const socketId = await this.connectedUsersService.getSocketId(payload.challengerId)
    this.server.to(socketId).emit('challengeAccepted', {
      roomId: payload.roomId,
      challengerId : payload.userId
    });
  }
  
  // //-------------------------------------------------------- COMMANDE DU CHAT --------------------------------------------------------
  
  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: GeneralMessagePayload){
    const userId = await this.chatService.getUserIdFromUsername(payload.name)
    this.server.emit('messageResponse', {
      userId: userId,
      name: payload.name,
      channel: 'General',
      text: payload.message
    });
   // Diffuser le message à tous les clients connectés
  }
  
  // ---------------------------------------------------------- JOIN ----------------------------------------------------------
  // Utilisation :  /JOIN #nomDuchannel 
  // Utilisation :  /JOIN #nomDuchannel motDePasse 
  // Utilisation :  /JOIN #nomDuchannel +i (channel sur invitation seulement) 
  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, payload: ChannelPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    let notice : string = null
    // ------------------------ Mauvais parametre ------------------------
    if (payload.channelName === undefined || payload.param[1] !== undefined)
    notice = '/JOIN : bad format'
    else if (!payload.channelName.startsWith('#'))
    notice = '/JOIN : bad format, the channel name must begin with a #'
    // ------------------------ Creation d'un channel ------------------------
    else {
      const room = await this.chatService.isRoomExist(payload.channelName)
      console.log(payload.param)
      if (room === null && payload.param[0] === " ")
        notice = `/JOIN: The channel password should contain alphanumeric characters`
      else if (room === null){
        let invite : boolean = false;
        if (payload.param[0] === '+i')
        invite = true;
        await this.chatService.createRoom(payload.channelName, userId, payload.param[0], invite)// voir avec sam pour le param invit
        client.join(payload.channelName);
        if (payload.param[0] !== undefined && payload.param[0] !== '+i' && payload.param[0] !== "")//Channel avec mdp
        await this.chatService.createPassword(payload.param[0], payload.channelName)
        notice = `You create and join a new room ${payload.channelName}`
      }
  
      // ------------------------ le channel existe ------------------------
      else { 
        if (await this.chatService.isUserMemberOfRoom(userId, room.id) === true)//Si l'utilisateur est deja membre du channel ERREUR : la fonction attend l'id de l'utilisateur
          notice = `/JOIN: You already are a member of the room ${payload.channelName}`
        else if ( payload.param[0] === '+i') //Si l'utilisateur est banni du channel
          notice = `/JOIN: The room ${payload.channelName} already exist`
        else if ( await this.chatService.isBanFromRoom(payload.username, payload.channelName) === true) //Si l'utilisateur est banni du channel
          notice = `/JOIN: You are ban from the room ${payload.channelName}`
        else if ( await this.chatService.isRoomProtected(payload.channelName) === true 
          && ( payload.param[0] === undefined 
          || await this.chatService.validatePassword(payload.param[0], payload.channelName) === false))// Si l'utilisateur a rentré un mauvais mot de passe
          notice = `/JOIN: Error when trying to join ${payload.channelName} : bad password`
        else if ( await this.chatService.isRoomPrivate(payload.channelName) === true)
          notice = `/JOIN: the channel ${payload.channelName} is on invitation only`
        else { // L'utilisateur rejoint la room         
              await this.chatService.joinRoom(room.id, userId)
              client.join(payload.channelName);
              notice = `You join ${payload.channelName}`
        }
      }
    } 
    client.emit('notice', {
      name: payload.username,
      channel: payload.channelName,
      text: undefined,
      notice : notice
    })
  }

  // ---------------------------------------------------------- BLOCK ----------------------------------------------------------
  // Utilisation :  /BLOCK nomCible 
  @SubscribeMessage('blockUser')
  async blockUser(client: Socket, payload: BlockPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const blockedUserIds = await this.chatService.getBlockedUserIds(userId)
    let notice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target[0] === undefined ||  payload.target[1] !== undefined)
      notice = '/BLOCK : bad format'
    else {
      const targetId : number = await this.chatService.getUserIdFromUsername(payload.target[0])
      if (targetId === null)
        notice = `/BLOCK: The user ${payload.target} doesn't exist`
      else if (blockedUserIds.find((id) => id === targetId)  !== undefined)
        notice = `/BLOCK: The user ${payload.target} is already block`
      else if (userId === targetId)
        notice = `/BLOCK: You can't block yourself`
      else {
        notice = `/BLOCK : You block ${payload.target}`
        this.chatService.blockUser(targetId, userId)
      }      
    }
    client.emit('notice', {
    name: payload.username,
    channel: undefined,
    text: undefined,
    notice : notice
    })
  }

  // ---------------------------------------------------------- UNBLOCK ----------------------------------------------------------
  // Utilisation :  /UNBLOCK nomCible 
  @SubscribeMessage('unblockUser')
  async unblockUser(client: Socket, payload: BlockPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const blockedUserIds = await this.chatService.getBlockedUserIds(userId)
    let notice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target[0] === undefined ||  payload.target[1] !== undefined)
      notice = '/UNBLOCK : bad format'
    else {
      const targetId : number = await this.chatService.getUserIdFromUsername(payload.target[0])
      if (targetId === null)
        notice = `/UNBLOCK: The user ${payload.target} doesn't exist`
      else if (blockedUserIds.find((id) => id === targetId)  == undefined)
        notice = `/UNBLOCK: The user ${payload.target} is not block`
      else {
        notice = `/UNBLOCK : You unblock ${payload.target}`
        this.chatService.unblockUser(targetId, userId)
      }      
    }
    client.emit('notice', {
    name: payload.username,
    channel: undefined,
    text: undefined,
    notice : notice
    })
  }

  // ---------------------------------------------------------- HELP ----------------------------------------------------------
  // Utilisation :  /HELP 
  @SubscribeMessage('help')
  async help(client: Socket, payload: GeneralMessagePayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.name)
    let notice : string = undefined
    let help : string = undefined
    // ------------------------ Trop de parametre ------------------------
    if (payload.message[0] !== undefined)
      notice = '/HELP: Too many argument'
    else {
    help = `
      <br>Here are some tips on how to use the chat commands:<br>
      <br><b>JOIN</b><br>
      &emsp;To join or create a public room:<br/>&emsp;&emsp;<span>/JOIN #channelName</span><br>
      &emsp;To join or create a room with a password:<br/>&emsp;&emsp;<span>/JOIN #channelName password</span><br>
      &emsp;To create a private room:<br/>&emsp;&emsp;<span>/JOIN #channelName +i</span><br>
      <br><b>BLOCK</b><br>
      &emsp;To block a user:<br/>&emsp;&emsp;<span>/BLOCK username</span><br>
      <br><b>UNBLOCK</b><br>
      &emsp;To unblock a user:<br/>&emsp;&emsp;<span>/UNBLOCK username</span><br>
      <br><b>HELP</b><br>
      &emsp;To get a list of available commands:<br/>&emsp;&emsp;<span>/HELP</span><br>
      <br><b>PRIVMSG</b><br>
      &emsp;To send a message to a channel:<br/>&emsp;&emsp;<span>PRIVMSG #channelName message...</span><br>
      &emsp;To send a private message to a user:<br/>&emsp;&emsp;<span>/PRIVMSG username message...</span><br>
      <br><b>INVITE</b><br>
      &emsp;To invite a user to a channel:<br/>&emsp;&emsp;<span>/INVITE username #channelName</span><br>
      <br><b>MUTE</b><br>
      &emsp;To mute a user in a channel:<br/>&emsp;&emsp;<span>/MUTE username #channelName</span><br>
      <br><b>KICK</b><br>
      &emsp;To kick a user from a channel:<br/>&emsp;&emsp;<span>/KICK username #channelName</span><br>
      <br><b>BAN</b><br>
      &emsp;To ban a user from a channel:<br/>&emsp;&emsp;<span>/BAN username #channelName</span><br>
      <br><b>ADMIN</b><br>
      &emsp;To grant admin privileges to a user in a channel:<br/>&emsp;&emsp;<span>/ADMIN username #channelName</span><br>
      <br><b>MODE</b><br>
      &emsp;To change channel modes:<br>
      &emsp;Invitation-only: &nbsp;<span>/MODE #channelName invite</span><br>
      &emsp;Public mode: &emsp;&emsp;&emsp;&emsp;<span>/MODE #channelName public</span><br>
      &emsp;Protected mode: &emsp;<span>/MODE #channelName protected password</span><br><br>
    `;


    }      
    client.emit('notice', {
    name: payload.name,
    channel: undefined,
    text: undefined,
    notice : notice,
    help : help
    })
  }
  
  // ---------------------------------------------------------- LIST ----------------------------------------------------------
  // Utilisation :  /LIST 
  @SubscribeMessage('list')
  async listChannel(client: Socket, payload: GeneralMessagePayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.name)
    const channelList = await this.chatService.getRoomNamesUserIsMemberOf(userId)
    let notice : string = undefined
    let help : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.message[0] !== undefined && payload.message[0] !== "")
      notice = '/LIST: Too many argument'
    else if (channelList.length === 0)
      notice = '/LIST: You are not inside any channel'
    else {
      const formattedList = channelList.map(channel => `- ${channel}<br>`).join('');
      help = `<br>Here is the list of channels you are part of :<br>${formattedList}<br>`;
    }
    client.emit('notice', {
    name: payload.name,
    channel: undefined,
    text: undefined,
    notice: notice,
    help : help,
    })
  }
  
  



  // ---------------------------------------------------------- PRIVMSG ----------------------------------------------------------
  // Utilisation :  /PRIVMSG !NomDuChannel message...
  // Utilisation :  /PRIVMSG NomUtilisateur message ...                    
  @SubscribeMessage('privmsg')

  async privateMessage(client: Socket, payload: PrivmsgPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    let notice : string = null
    let event : string = "notice"
    
    // --------------------------------------------- LE MESSAGE S'ADRESSE A UN CHANNEL ---------------------------------------------
    if (payload.channelName === undefined || payload.param === null)
    {
      notice = "/PRIVMSG: bad format"
      client.emit(event, {
        userId: userId,
        name: payload.username,
        channel: payload.channelName,
        text: payload.param,
        notice : notice
      })
    }
    else {
      const roomObject = await this.chatService.isRoomExist(payload.channelName)
      if (payload.channelName.startsWith("#")) {
        // ---------------------- LE  CHANNEL N'EXISTE PAS ----------------------
        if (roomObject === null)
          notice = `/PRIVMSG: The channel or user ${payload.channelName} doesn't exist`
        // ---------------------- L'UTILISATEUR N'EST PAS MEMBRE DU CHANNEL ----------------------
        else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false) //l'utilisateur ne fait pas partie du channel
          notice = `/PRIVMSG: You are not a member of the channel ${payload.channelName}`
        // ---------------------- L'UTILISATEUR EST MUTE DANS LE CHANNEL ----------------------
        else if (await this.chatService.isUserMutedInRoom(userId, roomObject.id) === true)
          notice = `/PRIVMSG: You are muted in the room ${payload.channelName}`
        // ---------------------- ON ENVOI LE MESSAGE AU CHANNEL  ----------------------
        else
          event = "messageResponse"
        // ---------------------- J'ENVOIS LE MESSAGE AU CHANNEL ----------------------
        if (event === "messageResponse")
          this.server.to(payload.channelName).emit(event, {
            userId: userId,
            name: payload.username,
            channel: payload.channelName,
            text: payload.param,
            notice : notice
          })
        // ---------------------- J'ENVOIS UNE NOTICE A L'UTILSATEUR DE LA COMMANDE (ERREUR)  ----------------------
        else 
          client.emit(event, {
            userId: userId,
            name: payload.username,
            channel: payload.channelName,
            text: payload.param,
            notice : notice
          })
      } 
      
      // ------------------------------------------ LE MESSAGE S'ADRESSE A UN UTILISATEUR ------------------------------------------
      else { //le message s'adresse a un utilistateur 
        const userId = await this.chatService.getUserIdFromUsername(payload.channelName);
        const socketId = await this.connectedUsersService.getSocketId(userId)
        // ---------------------- L'UTILISATEUR N'EXISTE PAS ----------------------
        if (userId === null)
          notice = `/PRIVMSG: The user ${payload.channelName} doesn't exist`
        // il faut verifier si l'utilisateur n'est pas bloqué. Mais c'est plus frontend je penses
        // ---------------------- SINON ON ENVOI LE MESSAGE A L'UTILISATEUR  ----------------------
        else
          event = 'messageResponse'
        // ---------------------- J'ENVOIS LE MESSAGE A LA CIBLE ----------------------
        if (event === 'messageResponse')
          this.server.to(socketId).emit(event, {
            userId: userId,
            name: payload.username,
            channel: undefined,
            text: payload.param,
            notice : notice
          })
          else
          // ---------------------- J'ENVOIS UNE NOTICE A L'UTILSATEUR DE LA COMMANDE (ERREUR)  ----------------------
          client.emit(event, {
          userId: userId,
          name: payload.username,
          channel: undefined,
          text: payload.param,
          notice : notice
          })
      }
    }
  }
 
    


  // ---------------------------------------------------------- INVITE ----------------------------------------------------------
  // Utilisation :  /INVITE nomCible nomDuChannel   
  @SubscribeMessage('inviteRoom')
  async inviteRoom(client: Socket, payload: ChatPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.connectedUsersService.getSocketId(userId)
    const targetId = await this.chatService.getUserIdFromUsername(payload.target)
    const targetSocketId = await this.connectedUsersService.getSocketId(targetId)
    let roomObject = null
    let userNotice : string = null
    let targetNotice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined || payload.channelName[1] !== undefined)
    userNotice = `/INVITE : bad format`
    else {
      roomObject = await this.chatService.isRoomExist(payload.channelName[0])
      if (roomObject === null)
        userNotice = `/INVITE: The room ${payload.channelName[0]} don't exist`
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
        userNotice = `/INVITE: You need to be a member of the room ${payload.channelName[0]} to send a invite`
      // ------------------------ L'utilisateur est ban de la room ------------------------
      else if (await this.chatService.isBanFromRoom(payload.target, payload.channelName[0]) === true)
        userNotice = `/INVITE: The user ${[payload.target]} is ban of the room ${payload.channelName[0]}`
      // ------------------------ La cible n'existe pas ------------------------
      else if (targetId === null)
        userNotice = `/INVITE: The user ${payload.target} doesn't exist`
      // ------------------------ La cible est deja membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(targetId, roomObject.id) === true)
        userNotice = `/INVITE: The user ${payload.target} is already a member of the room ${payload.channelName[0]}`
      // ------------------------ Sinon on ajoute la cible dans la room ------------------------
      else {
        targetNotice = `${payload.username} invited you to the channel ${payload.channelName}`
        userNotice = `/INVITE: The user ${payload.target} is now a member of the room ${payload.channelName[0]}`
        await this.chatService.joinRoom(roomObject.id, targetId)
        this.server.to(targetSocketId).socketsJoin(payload.channelName) 
      }
    }
    // ------------------------ Le channel n'existe pas ------------------------
    console.log(targetSocketId)
    if (targetSocketId !== null) {
      this.server.to(targetSocketId).emit
      ('notice', {
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    }
    this.server.to(userSocketId).emit('notice', {
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }


  // ---------------------------------------------------------- MUTE ----------------------------------------------------------
  // Utilisation :  /MUTE nomCible nomDuChannel   
  @SubscribeMessage('mute')
  async muteUser(client: Socket, payload: ChatPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.connectedUsersService.getSocketId(userId)
    let targetSocketId = null;
    let userNotice : string = null
    let targetNotice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined || payload.channelName[1] !== undefined)
    userNotice = `/MUTE : bad format`
    else {
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      targetSocketId = await this.connectedUsersService.getSocketId(targetId)
      const roomObject = await this.chatService.isRoomExist(payload.channelName[0])
      if (roomObject === null)
        userNotice = `/MUTE: The room ${payload.channelName[0]} don't exist`
      // ------------------------ L'utilisateur n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
        userNotice = `/MUTE: You need to be a member of the room ${payload.channelName[0]} to mute the user ${payload.target}`
      // ------------------------ La cible n'existe pas ------------------------
      else if (targetId === null)
        userNotice = `/MUTE: The user ${payload.target} doesn't exist`
      // ------------------------ La cible n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(targetId, roomObject.id) === false)
        userNotice = `/MUTE: The user ${payload.target} is not a member of the room ${payload.channelName[0]}`
      // ------------------------ L'utilisateur n'a pas les autorisations (n'est pas owner ou admin du channel) ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(userId, roomObject.id) === false 
      && await this.chatService.isUserModeratorOfChatRoom(userId, roomObject.id) === false)
        userNotice = `/MUTE: You don't have the right to mute a user of the room ${payload.channelName}`
      // ------------------------ La cible est owner du chat ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(targetId, roomObject.id) === true)
        userNotice = `/MUTE: The target is the owner of the room ${payload.channelName}`
      // ------------------------ L'utilisateur est deja mute ------------------------
      else if (await this.chatService.isUserMutedInRoom(targetId, roomObject.id) === true)
        userNotice = `/MUTE: The target is already mute in the room ${payload.channelName}`
      else if (userId === targetId)
        userNotice = `/MUTE: You can't mute yourself`
      // ------------------------ Sinon on mute la cible ------------------------
      else {
        targetNotice = `You are muted for 30s in the channel ${payload.channelName}`
        userNotice = `/MUTE: The user ${payload.target} is now mute in the room ${payload.channelName[0]}`
        await this.chatService.muteUserInRoom(targetId, roomObject.id, 0.5)
      }
    }
    // ------------------------ Le channel n'existe pas ------------------------
    if (targetSocketId !== null && targetNotice !== null)
      this.server.to(targetSocketId).emit('notice', {
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    this.server.to(userSocketId).emit('notice', {
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }

  // ---------------------------------------------------------- KICK ----------------------------------------------------------
  // Utilisation :  /KICK nomCible nomDuChannel   
  @SubscribeMessage('kickUser')
  async kickUser(client: Socket, payload: ChatPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.connectedUsersService.getSocketId(userId)
    let targetSocketId = null;
    let userNotice : string = null
    let targetNotice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined ||  payload.channelName[1] !== undefined)
    userNotice = `/KICK : bad format`
    // ------------------------ Le channel n'existe pas ------------------------
    else{
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      const targetSocket = await this.connectedUsersService.getSocketChat(targetId);
      targetSocketId = await this.connectedUsersService.getSocketId(targetId)
      const roomObject = await this.chatService.isRoomExist(payload.channelName[0])
      if (roomObject === null)
        userNotice = `/KICK: The room ${payload.channelName[0]} don't exist`
      // ------------------------ L'utilisateur n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
        userNotice = `/KICK: You need to be a member of the room ${payload.channelName[0]} to kick the user ${payload.target}`
      // ------------------------ La cible n'existe pas ------------------------
      else if (targetId === null)
        userNotice = `/KICK: The user ${payload.target} doesn't exist`
      // ------------------------ La cible n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(targetId, roomObject.id) === false)
        userNotice = `/KICK: The user ${payload.target} is not a member of the room ${payload.channelName[0]}`
      // ------------------------ L'utilisateur n'a pas les autorisations (n'est pas owner ou admin du channel) ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(userId, roomObject.id) === false 
      && await this.chatService.isUserModeratorOfChatRoom(userId, roomObject.id) === false)
        userNotice = `/KICK: You don't have the right to kick a user of the room ${payload.channelName}`
      // ------------------------ La cible est owner du chat ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(targetId, roomObject.id) === true)
        userNotice = `/KICK: Error: the target is the owner of the room ${payload.channelName}`
      else if (userId === targetId)
        userNotice = `/KICK: You can't kick yourself`
      // ------------------------ Sinon on mute la cible ------------------------
      else {
        targetNotice = `You are kick of the channel ${payload.channelName}`
        userNotice = `/KICK: The user ${payload.target} is now kicked of the room ${payload.channelName[0]}`
        await this.chatService.removeMember(roomObject.id, targetId)
        targetSocket.leave(payload.channelName[0]);
      }
    } 
    if (targetSocketId !== null &&  targetNotice !== null)
      this.server.to(targetSocketId).emit('notice', {
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    this.server.to(userSocketId).emit('notice', {
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }

  // ---------------------------------------------------------- BAN ----------------------------------------------------------
  // Utilisation :  /BAN nomCible nomDuChannel   
  @SubscribeMessage('banUser')
  async banUser(client: Socket, payload: ChatPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.connectedUsersService.getSocketId(userId)
    let targetSocketId = null
    let userNotice : string = null
    let targetNotice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined ||  payload.channelName[1] !== undefined)
    userNotice = `/BAN : bad format`
    else {      
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      const targetSocket = await this.connectedUsersService.getSocketChat(targetId);
      targetSocketId = await this.connectedUsersService.getSocketId(targetId)
      const roomObject = await this.chatService.isRoomExist(payload.channelName[0])
      if (roomObject === null)
        userNotice = `/BAN: The room ${payload.channelName[0]} don't exist`
      // ------------------------ L'utilisateur n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
        userNotice = `/BAN: You need to be a member of the room ${payload.channelName[0]} to ban the user ${payload.target}`
      // ------------------------ La cible n'existe pas ------------------------
      else if (targetId === null)
        userNotice = `/BAN: The user ${payload.target} doesn't exist`
      // ------------------------ La cible n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(targetId, roomObject.id) === false)
        userNotice = `/BAN: The user ${payload.target} is not a member of the room ${payload.channelName[0]}`
      // ------------------------ L'utilisateur n'a pas les autorisations (n'est pas owner ou admin du channel) ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(userId, roomObject.id) === false 
      && await this.chatService.isUserModeratorOfChatRoom(userId, roomObject.id) === false)
        userNotice = `/BAN: You don't have the right to ban a user of the room ${payload.channelName}`
      // ------------------------ La cible est owner du chat ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(targetId, roomObject.id) === true)
        userNotice = `/BAN: The target is the owner of the room ${payload.channelName}`
      else if (userId === targetId)
        userNotice = `/BAN: You can't BAN yourself`
      // ------------------------ Sinon on ban la cible ------------------------
      else {
        targetNotice = `You are ban of the channel ${payload.channelName}`
        userNotice = `/BAN: The user ${payload.target} is now ban of the room ${payload.channelName[0]}`
        targetSocket.leave(payload.channelName[0]);
        await this.chatService.banUserFromRoom(targetId, roomObject.id)
      }
    }
    if (targetSocketId !== null && targetNotice !== null)
      this.server.to(targetSocketId).emit('notice', {
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    this.server.to(userSocketId).emit('notice', {
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }
  
  // ---------------------------------------------------------- UNBAN ----------------------------------------------------------
  // Utilisation :  /UNBAN nomCible nomDuChannel   
  @SubscribeMessage('unbanUser')
  async unbanUser(client: Socket, payload: ChatPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.connectedUsersService.getSocketId(userId)
    let targetSocketId = null
    let userNotice : string = null
    let targetNotice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined ||  payload.channelName[1] !== undefined)
    userNotice = `/UNBAN : bad format`
    else {      
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      targetSocketId = await this.connectedUsersService.getSocketId(targetId)
      const roomObject = await this.chatService.isRoomExist(payload.channelName[0])
      if (roomObject === null)
        userNotice = `/UNBAN: The room ${payload.channelName[0]} don't exist`
      // ------------------------ L'utilisateur n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
        userNotice = `/UNBAN: You need to be a member of the room ${payload.channelName[0]} to unban the user ${payload.target}`
      // ------------------------ La cible n'existe pas ------------------------
      else if (targetId === null)
        userNotice = `/UNBAN: The user ${payload.target} doesn't exist`
      // ------------------------ La cible n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(targetId, roomObject.id) === false)
        userNotice = `/UNBAN: The user ${payload.target} is not a member of the room ${payload.channelName[0]}`
      // ------------------------ L'utilisateur n'a pas les autorisations (n'est pas owner ou admin du channel) ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(userId, roomObject.id) === false 
      && await this.chatService.isUserModeratorOfChatRoom(userId, roomObject.id) === false)
        userNotice = `/UNBAN: You don't have the right to unban a user of the room ${payload.channelName}`
      // ------------------------ Sinon on unban la cible ------------------------
      else {
        targetNotice = `You are unban of the channel ${payload.channelName}`
        userNotice = `/UNBAN: The user ${payload.target} is now unban of the room ${payload.channelName[0]}`
        await this.chatService.removeBan(roomObject.id, targetId)
      }
    }
    if (targetSocketId !== null && targetNotice !== null)
      this.server.to(targetSocketId).emit('notice', {
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    this.server.to(userSocketId).emit('notice', {
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }

  
  // ---------------------------------------------------------- ADMIN ----------------------------------------------------------
  // Utilisation :  /ADMIN nomCible nomDuChannel   
  @SubscribeMessage('admin')
  async adminUser(client: Socket, payload: ChatPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.connectedUsersService.getSocketId(userId)
    let targetSocketId = null;
    let userNotice : string = null
    let targetNotice : string = null
    
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined ||  payload.channelName[1] !== undefined)
    userNotice = `/ADMIN : bad format`
    else {
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      targetSocketId = await this.connectedUsersService.getSocketId(targetId)
      const roomObject = await this.chatService.isRoomExist(payload.channelName[0])
      if (roomObject === null)
        userNotice = `/ADMIN: The room ${payload.channelName[0]} don't exist`
      // ------------------------ L'utilisateur n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
        userNotice = `/ADMIN: You need to be a member of the room ${payload.channelName[0]} to mute the user ${payload.target}`
      // ------------------------ La cible n'existe pas ------------------------
      else if (targetId === null)
        userNotice = `/ADMIN: The user ${payload.target} doesn't exist`
      // ------------------------ La cible n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(targetId, roomObject.id) === false)
        userNotice = `/ADMIN: The user ${payload.target} is not a member of the room ${payload.channelName[0]}`
      // ------------------------ L'utilisateur n'a pas les autorisations (n'est pas owner ou admin du channel) ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(userId, roomObject.id) === false 
      && await this.chatService.isUserModeratorOfChatRoom(userId, roomObject.id) === false)
        userNotice = `/ADMIN: You don't have the right to add a admin to the room ${payload.channelName}`
      // ------------------------ L'utilisateur est deja admin ------------------------
      else if (await this.chatService.isUserModeratorOfChatRoom(targetId, roomObject.id) === true)
        userNotice = `/ADMIN: The user ${payload.target} is already a admin of the room ${payload.channelName}`
      // ------------------------ Sinon on ajoute la cible comme admin du channel ------------------------
      else {
        targetNotice = `You are now a admin of the channel ${payload.channelName}`
        userNotice = `/ADMIN: The user ${payload.target} is now a admin the room ${payload.channelName[0]}`
        await this.chatService.addModerator(roomObject.id, targetId)
        //faire des tests
      }
    }
    // ------------------------ Le channel n'existe pas ------------------------
    if (targetSocketId !== null && targetNotice !== null)
      this.server.to(targetSocketId).emit('notice', { //probleme ici 
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    this.server.to(userSocketId).emit('notice', {
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }  


// ---------------------------------------------------------- MODE ----------------------------------------------------------
// Utilisation :  /MODE nomDuChannel flag
  // Passer le channel sur invitation : /MODE nomDuChannel invite
  // Passer le channel en public : /MODE nomDuChannel public 
  // Passer le channel en mode protection : /MODE nomDuChannel protected motDePasse
  @SubscribeMessage('modeRoom')
  async modeRoom(client: Socket, payload: ChannelPayload) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.connectedUsersService.getSocketId(userId)
    let userNotice : string = null
    
    // ------------------------ Pas assez de parametre ------------------------
    if (payload.channelName === undefined ||  payload.param[0] === undefined)
    userNotice = `/MODE : bad format`
    else {
      const roomObject = await this.chatService.isRoomExist(payload.channelName)
      // ------------------------ Le room est inconnu ------------------------
      if (roomObject === null)
      userNotice = `/MODE: The room ${payload.channelName} don't exist`
      // ------------------------ Le flag est inconnu ------------------------
      else if (payload.param[0] !== 'private' && payload.param[0] !== 'public' && payload.param[0] !== 'protected')
      userNotice = `/MODE: Unknown flag ${payload.param[0]}`
      // ------------------------ L'utilisateur n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
      userNotice = `/MODE: You are not a member of the room ${payload.channelName}`
      // ------------------------ L'utilisateur n'a pas les autorisations (n'est pas owner ou admin du channel) ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(userId, roomObject.id) === false 
      && await this.chatService.isUserModeratorOfChatRoom(userId, roomObject.id) === false)
      userNotice = `/MODE: You don't have the right to add a admin to the room ${payload.channelName}`
      // ------------------------ On verifie si il n'y a pas trop de parametres selon le flag ------------------------
      else if (payload.param[0] !== 'protected' && payload.param[1] !== undefined)
      userNotice = `/MODE ${payload.param[0]}: bad format, to many argument`
      else if (payload.param[0] === 'protected' && payload.param[2] !== undefined)
      userNotice = `/MODE ${payload.param[0]}: bad format, to many argument`
      else if (payload.param[0] === 'protected' && (payload.param[1] === undefined || payload.param[1] === ""))
      userNotice = `/MODE ${payload.param[0]}: bad format, password is missing`
      // ------------------------ Sinon on vérifie le flag et on applique les changements ------------------------
      else {
        if (payload.param[0] === 'private') {
          if (await this.chatService.isRoomProtected(roomObject.name) === true)
            await this.chatService.removePassword(roomObject.id)
          this.chatService.changeInvite(roomObject.id, true)
          userNotice = `/MODE ${payload.param[0]}: The channel ${payload.channelName} is now private`
        }
        else if (payload.param[0] === 'public') {
          if (await this.chatService.isRoomPrivate(roomObject.name) === true)
            await this.chatService.changeInvite(roomObject.id, false)
          if (await this.chatService.isRoomProtected(roomObject.name) === true)
            await this.chatService.removePassword(roomObject.id)
          userNotice = `/MODE ${payload.param[0]}: The channel ${payload.channelName} is now public`
        }
        else if (payload.param[0] === 'protected') {
          if (await this.chatService.isRoomPrivate(roomObject.name) === true)
            await this.chatService.changeInvite(roomObject.id, false)
          await this.chatService.createPassword(payload.param[1], roomObject.name)
          userNotice = `/MODE ${payload.param[0]}: The channel ${payload.channelName} is now protected`
        }
      }
    }
    client.emit('notice', {
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }  
}
