import { Module } from '@nestjs/common';
import { ConnectedUsersService } from './connectedUsers.service';


@Module({
  providers: [ConnectedUsersService],
  exports: [ConnectedUsersService], 
})
export class ConnectedUsersModule {}
