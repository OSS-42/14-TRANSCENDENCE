import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Server } from 'http';
import { ChatService } from './chat.service';
import { createMessageDto } from './dto/create.message.dto';

@WebSocketGateway()
export class ChatGateway {

  @WebSocketServer()
  server: Server

  constructor(private chatService: ChatService){}


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


  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody('name') name: string, @ConnectedSocket() client :Socket) {
    return 'Hello world!';
  }
}
