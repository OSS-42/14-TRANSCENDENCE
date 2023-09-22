import { Module } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';
import { ConnectedUsersModule } from 'src/connectedUsers/connectedUsers.module';

@Module({
  controllers: [PongController],
  imports: [ConnectedUsersModule], 
  providers: [PongService, PongGateway, ConnectedUsersModule]
})
export class PongModule {}
