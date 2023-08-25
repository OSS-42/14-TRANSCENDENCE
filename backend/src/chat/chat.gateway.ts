import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { createMessageDto } from './dto/create.message.dto';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { stringify } from 'querystring';


@WebSocketGateway({ cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  //une reference au socket.io 
  server: Server
  constructor(private chatService: ChatService,
      private config: ConfigService){}
  // async handleConnection(client: Socket) {
  //   const token = client.handshake.query.token as string
  //   if (token) {
  //     try {
  //       const decoded = verify(token, this.config.get("JWT_TOKEN"));
  //     console.log("voici lidentite du socket")
  //       console.log(decoded)
        
        
  //     } catch (error) {
  //       client.disconnect();
  //     }
  //   } else {
  //     client.disconnect();
  //   }
  // }

  //-----------------test morgan-----------------
  @SubscribeMessage('allo')
  handleAllo (client: Socket) {
    // this.server.to(client.id).emit('allo')
    console.log('allo')
  }
  
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void { //voir pour changer any
    console.log(payload.name)
    this.server.emit('messageResponse', payload); // Diffuser le message à tous les clients connectés
  }
  
  handleConnection(client: Socket): void {
    console.log(`⚡: ${client.id} user just connected!`);
    const token = client.handshake.query.token as string
    if (token) {
      try {
        const decoded = verify(token, this.config.get("JWT_SECRET"));
        console.log("voici lidentite du socket")
        console.log(decoded)
        
        
      } catch (error) {
        client.disconnect();
      }
    } else {
      client.disconnect();
    }
    
  }
  
  handleDisconnect(client: Socket): void {
    console.log(`🔥: ${client.id} user disconnected`);
  }
  
  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, payload: any) {
    if (await this.chatService.isRoomExist(payload.name) != null){ // la room n'existe pas
      // ici il faut rajouter du code pour ajouter le nouveau canal a la base de donnée
      // et faire les manipulations pour ajouter le chat dans la db du user, ajouter le user au db du canal etc ...            
      client.join(payload.name); 
      // si la room existe et que l'utilisateur n'est pas dedans
      client.emit('messageResponse', `You join the room ${payload.name}!`);
      // si la room existe et que l'utilisateur EST dedans
      // client.emit('messageResponse', `You already are in the room ${payload.name}!`);
    } else { //la room existe
      client.emit('messageResponse', {
        // ici il va falloir verifier si l'utilisateur est deja dans le canal et envoyer un message adapté.
        // if deja dedans
        id: payload.id, // un identifiant unique pour chaque message
        name: payload.username,
        text: `You create and join a new room ${payload.name} !`,
        // else vous avez rejoins la room ...
      })
    }
  }
  
  // @SubscribeMessage('privmsg')
  // handleMessage(client: Socket, payload: any): void { //voir pour changer any
  //   console.log(payload.name)
  //   this.server.emit('messageResponse', payload); // Diffuser le message à tous les clients connectés
  // }
  //-----------------test morgan-----------------
  
  @SubscribeMessage('findAllMessages')
  findAllMessages(client: any, payload: any): string {
    return 'array des messages';
  }

  @SubscribeMessage('privateMessage')
  async privateMessage(
    @MessageBody() data: { to: string; message: string },
    @ConnectedSocket() client: Socket
  ) {
    const { to, message } = data;
    client.to(to).emit('privateMessage', `Private message from ${client.id}: ${message}`);
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



