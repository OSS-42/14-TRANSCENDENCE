import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';


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
          this.joinRoomsAtConnection(Number(decoded.sub), client)
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
  //join chaque channel dont le user est membre
  private  async joinRoomsAtConnection(userId:number, client:Socket){
    const memberOf = await this.chatService.getRoomNamesUserIsMemberOf(userId)
    memberOf.forEach((roomName) => {
      client.join(roomName);
    });

  }

  // //-------------------------------------------------------- COMMANDE DU CHAT --------------------------------------------------------
  
  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any){ //voir pour changer any
    const userId = await this.chatService.getUserIdFromUsername(payload.name)
    this.server.emit('messageResponse', {
      id: payload.id,
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
  async joinRoom(client: Socket, payload: any) {
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
      if (room === null){
        let invite : boolean = false;
        if (payload.param[0] === '+i')
          invite = true;
        await this.chatService.createRoom(payload.channelName, userId, payload.param, invite)// voir avec sam pour le param invit
        client.join(payload.channelName);
        if (payload.param[0] !== undefined && payload.param[0] !== '+i') //Channel avec mdp
          await this.chatService.createPassword(payload.param[0], payload.channelName)
        notice = `You create and join a new room ${payload.channelName}`
      }
  
      // ------------------------ le channel existe ------------------------
      else { 
        if (await this.chatService.isUserMemberOfRoom(userId, room.id) === true)//Si l'utilisateur est deja membre du channel ERREUR : la fonction attend l'id de l'utilisateur
          notice = `/JOIN: You already are a member of the room ${payload.channelName}`
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
      id: payload.id,
      name: payload.username,
      channel: payload.channelName,
      text: undefined,
      notice : notice
    })
  }

  // ---------------------------------------------------------- BLOCK ----------------------------------------------------------
  // Utilisation :  /BLOCK nomCible 
  @SubscribeMessage('blockUser')
  async blockUser(client: Socket, payload: any) {
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
      else {
        notice = `/BLOCK : You block ${payload.target}`
        this.chatService.blockUser(targetId, userId)
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
  
  



  // ---------------------------------------------------------- PRIVMSG ----------------------------------------------------------
  // Utilisation :  /PRIVMSG !NomDuChannel message...
  // Utilisation :  /PRIVMSG NomUtilisateur message ...                    
  @SubscribeMessage('privmsg')
  async privateMessage(client: Socket, payload: any) {
    console.log('coucou')
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    let notice : string = null
    let event : string = "notice"
    
    // --------------------------------------------- LE MESSAGE S'ADRESSE A UN CHANNEL ---------------------------------------------
    if (payload.target === undefined || payload.message === undefined)
    {
      notice = "/PRIVMSG: bad format"
      client.emit(event, {
        id: payload.id,
        userId: userId,
        name: payload.username,
        channel: payload.target,
        text: payload.message,
        notice : notice
      })
    }
    else {
      const roomObject = await this.chatService.isRoomExist(payload.target)
      if (payload.target.startsWith("#")) {
        // ---------------------- LE  CHANNEL N'EXISTE PAS ----------------------
        if (roomObject === null)
          notice = `/PRIVMSG: The channel ${payload.target} doesn't exist`
        // ---------------------- L'UTILISATEUR N'EST PAS MEMBRE DU CHANNEL ----------------------
        else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false) //l'utilisateur ne fait pas partie du channel
          notice = `/PRIVMSG: You are not a member of the channel ${payload.target}`
        // ---------------------- L'UTILISATEUR EST MUTE DANS LE CHANNEL ----------------------
        else if (await this.chatService.isUserMutedInRoom(userId, roomObject.id) === true)
          notice = `/PRIVMSG: You are muted in the room ${payload.target}`
        // ---------------------- ON ENVOI LE MESSAGE AU CHANNEL  ----------------------
        else
          event = "messageResponse"
        // ---------------------- J'ENVOIS LE MESSAGE AU CHANNEL ----------------------
        if (event === "messageResponse")
          this.server.to(payload.target).emit(event, {
            id: payload.id,
            userId: userId,
            name: payload.username,
            channel: payload.target,
            text: payload.message,
            notice : notice
          })
        // ---------------------- J'ENVOIS UNE NOTICE A L'UTILSATEUR DE LA COMMANDE (ERREUR)  ----------------------
        else 
          client.emit(event, {
            id: payload.id,
            userId: userId,
            name: payload.username,
            channel: payload.target,
            text: payload.message,
            notice : notice
          })
      } 
      
      // ------------------------------------------ LE MESSAGE S'ADRESSE A UN UTILISATEUR ------------------------------------------
      else { //le message s'adresse a un utilistateur 
        const userId = await this.chatService.getUserIdFromUsername(payload.target);
        const socketId = await this.getSoketIdFromUserId(userId)
        // ---------------------- L'UTILISATEUR N'EXISTE PAS ----------------------
        if (userId === null)
          notice = `/PRIVMSG: The user ${payload.target} doesn't exist`
        // il faut verifier si l'utilisateur n'est pas bloqué. Mais c'est plus frontend je penses
        // ---------------------- SINON ON ENVOI LE MESSAGE A L'UTILISATEUR  ----------------------
        else
          event = 'messageResponse'
        // ---------------------- J'ENVOIS LE MESSAGE A LA CIBLE ----------------------
        if (event === 'messageResponse')
          this.server.to(socketId).emit(event, {
            id: payload.id,
            userId: userId,
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
  }
 
    


  // ---------------------------------------------------------- INVITE ----------------------------------------------------------
  // Utilisation :  /INVITE nomCible nomDuChannel   
  @SubscribeMessage('inviteRoom')
  async inviteRoom(client: Socket, payload: any) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.getSoketIdFromUserId(userId)
    let targetSocketId = null
    let roomObject = null
    let userNotice : string = null
    let targetNotice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined || payload.channelName[1] !== undefined)
    userNotice = `/INVITE : bad format`
    else {
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      const targetSocketId = await this.getSoketIdFromUserId(targetId)
      roomObject = await this.chatService.isRoomExist(payload.channelName[0])
      if (roomObject === null)
        userNotice = `/INVITE: The room ${payload.channelName[0]} don't exist`
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
        userNotice = `/INVITE: You need to be a member of the room ${payload.channelName[0]} to send a invite`
      // ------------------------ L'utilisateur est ban de la room ------------------------
      else if (await this.chatService.isBanFromRoom(payload.username, payload.channelName[0]) === true)
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
    if (targetSocketId !== null &&  targetNotice !== null) {
      this.server.to(targetSocketId).emit('notice', {
        id: payload.id,
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    }
    this.server.to(userSocketId).emit('notice', {
      id: payload.id,
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }


  // ---------------------------------------------------------- MUTE ----------------------------------------------------------
  // Utilisation :  /MUTE nomCible nomDuChannel   
  @SubscribeMessage('mute')
  async muteUser(client: Socket, payload: any) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.getSoketIdFromUserId(userId)
    let targetSocketId = null;
    let userNotice : string = null
    let targetNotice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined || payload.channelName[1] !== undefined)
    userNotice = `/MUTE : bad format`
    else {
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      targetSocketId = await this.getSoketIdFromUserId(targetId)
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
      // ------------------------ Sinon on mute la cible ------------------------
      else {
        targetNotice = `You are muted in the channel ${payload.channelName}`
        userNotice = `/MUTE: The user ${payload.target} is now mute in the room ${payload.channelName[0]}`
        await this.chatService.muteUserInRoom(targetId, roomObject.id, 0.5)
      }
    }
    // ------------------------ Le channel n'existe pas ------------------------
    if (targetSocketId !== null && targetNotice !== null)
      this.server.to(targetSocketId).emit('notice', {
        id: payload.id,
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    this.server.to(userSocketId).emit('notice', {
      id: payload.id,
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }

  // ---------------------------------------------------------- KICK ----------------------------------------------------------
  // Utilisation :  /KICK nomCible nomDuChannel   
  @SubscribeMessage('kickUser')
  async kickUser(client: Socket, payload: any) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.getSoketIdFromUserId(userId)
    let targetSocketId = null;
    let userNotice : string = null
    let targetNotice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined ||  payload.channelName[1] !== undefined)
    userNotice = `/KICK : bad format`
    // ------------------------ Le channel n'existe pas ------------------------
    else{
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      targetSocketId = await this.getSoketIdFromUserId(targetId)
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
        userNotice = `/KICK: The target is the owner of the room ${payload.channelName}`
      // ------------------------ Sinon on mute la cible ------------------------
      else {
        targetNotice = `You are kick of the channel ${payload.channelName}`
        userNotice = `/KICK: The user ${payload.target} is now kick of the room ${payload.channelName[0]}`
        await this.chatService.removeMember(roomObject.id, targetId)
      }
    } 
    if (targetSocketId !== null &&  targetNotice !== null)
      this.server.to(targetSocketId).emit('notice', {
        id: payload.id,
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    this.server.to(userSocketId).emit('notice', {
      id: payload.id,
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }

  // ---------------------------------------------------------- BAN ----------------------------------------------------------
  // Utilisation :  /BAN nomCible nomDuChannel   
  @SubscribeMessage('banUser')
  async banUser(client: Socket, payload: any) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.getSoketIdFromUserId(userId)
    let targetSocketId = null
    let userNotice : string = null
    let targetNotice : string = null
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined ||  payload.channelName[1] !== undefined)
    userNotice = `/BAN : bad format`
    else {      
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      targetSocketId = await this.getSoketIdFromUserId(targetId)
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
      // ------------------------ Sinon on mute la cible ------------------------
      else {
        targetNotice = `You are ban of the channel ${payload.channelName}`
        userNotice = `/BAN: The user ${payload.target} is now ban of the room ${payload.channelName[0]}`
        await this.chatService.banUserFromRoom(targetId, roomObject.id)
      }
    }
    // ------------------------ Le channel n'existe pas ------------------------
    if (targetSocketId !== null && targetNotice !== null)
      this.server.to(targetSocketId).emit('notice', {
        id: payload.id,
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    this.server.to(userSocketId).emit('notice', {
      id: payload.id,
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }

  
  // ---------------------------------------------------------- ADMIN ----------------------------------------------------------
  // Utilisation :  /ADMIN nomCible nomDuChannel   
  @SubscribeMessage('admin')
  async adminUser(client: Socket, payload: any) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.getSoketIdFromUserId(userId)
    let targetSocketId = null;
    let userNotice : string = null
    let targetNotice : string = null
    
    // ------------------------ Trop de parametre ------------------------
    if (payload.target === undefined || payload.channelName[0] === undefined ||  payload.channelName[1] !== undefined)
    userNotice = `/ADMIN : bad format`
    else {
      const targetId = await this.chatService.getUserIdFromUsername(payload.target)
      targetSocketId = await this.getSoketIdFromUserId(targetId)
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
        id: payload.id,
        name: payload.username,
        channel: undefined,
        text: null,
        notice: targetNotice
      })
    this.server.to(userSocketId).emit('notice', {
      id: payload.id,
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }  


// ---------------------------------------------------------- MODE ----------------------------------------------------------
  // Passer le channel sur invitation : /MODE nomDuChannel invite
  // Passer le channel en public : /MODE nomDuChannel public 
  // Passer le channel en mode protection : /MODE nomDuChannel protected motDePasse
  // Utilisation :  /MODE nomDuChannel flag
  @SubscribeMessage('modeRoom')
  async modeRoom(client: Socket, payload: any) {
    const userId = await this.chatService.getUserIdFromUsername(payload.username)
    const userSocketId = await this.getSoketIdFromUserId(userId)
    let userNotice : string = null
    
    // ------------------------ Pas assez de parametre ------------------------
    if (payload.channelName === undefined ||  payload.param[0] === undefined)
    userNotice = `/MODE : bad format`
    else {
      const roomObject = await this.chatService.isRoomExist(payload.channelName)
      // ------------------------ Le room est inconnu ------------------------
      if (roomObject === null)
      userNotice = `/MODE: The room ${payload.channelName[0]} don't exist`
      // ------------------------ Le flag est inconnu ------------------------
      else if (payload.param[0] !== 'invite' && payload.param[0] !== 'public' && payload.param[0] !== 'protected')
      userNotice = `/MODE: Unknown flag ${payload.param[0]}`
      // ------------------------ L'utilisateur n'est pas membre de la room ------------------------
      else if (await this.chatService.isUserMemberOfRoom(userId, roomObject.id) === false)
      userNotice = `/MODE: The user ${payload.target} is not a member of the room ${payload.channelName[0]}`
      // ------------------------ L'utilisateur n'a pas les autorisations (n'est pas owner ou admin du channel) ------------------------
      else if (await this.chatService.isUserOwnerOfChatRoom(userId, roomObject.id) === false 
      && await this.chatService.isUserModeratorOfChatRoom(userId, roomObject.id) === false)
      userNotice = `/MODE: You don't have the right to add a admin to the room ${payload.channelName}`
      // ------------------------ On verifie si il n'y a pas trop de parametres selon le flag ------------------------
      else if (payload.param[0] !== 'protected' && payload.param[1] !== undefined)
      userNotice = `/MODE ${payload.param[0]}: bad format, to many argument`
      else if (payload.param[0] === 'protected' && payload.param[2] !== undefined)
      userNotice = `/MODE ${payload.param[0]}: bad format, to many argument`
      // ------------------------ Sinon on vérifie le flag et on applique les changements ------------------------
      else {
        if (payload.param[0] === 'invite') {
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
          await this.chatService.createPassword(payload.param[1], roomObject.name)
          userNotice = `/MODE ${payload.param[0]}: The channel ${payload.channelName} is now protected`
        }
      }
    }
    console.log(userSocketId)
    // this.server.to(userSocketId).emit('notice', {
    client.emit('notice', {
      id: payload.id,
      name: payload.username,
      channel: undefined,
      text: null,
      notice: userNotice
    })
  }  
}


   //cette ligne permet de diffuser a tout le monde, sauf celui qui emet
   //client.broadcast.emit('test', {'payload':'test'});

  //exemple pour envoyer un message a une room.
   //this.server.to('room-name').emit('message', 'Hello from the room!');



