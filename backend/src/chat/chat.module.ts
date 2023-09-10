import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import {ConnectedUsersService}  from './connectedUsers.service';

@Module({
  providers: [ChatGateway, ChatService, ConnectedUsersService]
})
export class ChatModule {}
