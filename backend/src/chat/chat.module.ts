import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ConnectedUsersModule}  from '../connectedUsers/connectedUsers.module';

@Module({
  imports: [ConnectedUsersModule], 
  providers: [ChatGateway, ChatService, ConnectedUsersModule]
})
export class ChatModule {}
