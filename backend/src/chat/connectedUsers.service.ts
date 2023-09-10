import {  Injectable } from '@nestjs/common';
@Injectable()
export class ConnectedUsersService {
   connectedUsers: Map<number, string> = new Map();

  set(userId: number, socketId: string) {
    this.connectedUsers.set(userId, socketId);
  }

  delete(userId: number) {
    this.connectedUsers.delete(userId);
  }

  getSocketId(userId: number): string | undefined {
    return this.connectedUsers.get(userId);
  }
}