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
  constructor(private chatService: ChatService){}
  // async handleConnection(client: Socket) {
  //   const token = client.handshake.query.token as string
    
  //   if (token) {
  //     try {
  //       const decoded = verify(token, 'La danse des dindons');
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
  }
  
  handleDisconnect(client: Socket): void {
    console.log(`🔥: ${client.id} user disconnected`);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, payload: any) {
    if (this.chatService.isRoomExist(payload.name)){
      client.join(payload.name); 
      client.emit('messageResponse', `Welcome to room ${payload.name}!`);
      console.log(payload.name)
    } else {
    client.emit('messageResponse', {            
      id: payload.id, // un identifiant unique pour chaque message
      name: payload.username,
      text: `Room already exist!`,
    })
  }
}

  //-----------------test morgan-----------------
  
  @SubscribeMessage('createMessage')
  async createMessage(@MessageBody() createMessageDto: createMessageDto) {

    const message = await this.chatService.createMessage(createMessageDto)
    this.server.emit('message', message)
    
    return message;
  }

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


  @SubscribeMessage('createRoom')
  async createRoom(@MessageBody('room') room: string, @ConnectedSocket() client: Socket) {
    if (!this.chatService.isRoomExist(room)){
      this.chatService.createRoom(room)
      client.join(room); 
      client.emit('message', `Welcome to room ${room}!`);
    }
    client.join(room); 
    client.emit('message', `Welcome to room ${room}!`);
    //implementer une logique sil ya une creation de room (la premiere fois qu<on joint une room) Et identifier le proprietaire de la room
  }


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



