import {  Injectable } from '@nestjs/common';

@Injectable()
export class ConnectedUsersService {
   connectedUsers: Map<number, string> = new Map();
   connectedtoPonng: Map<number, string> = new Map();

  set(userId: number, socketId: string) {
    this.connectedUsers.set(userId, socketId);
  }

  delete(userId: number) {
    this.connectedUsers.delete(userId);
  }

  getSocketId(userId: number): string | undefined {
    return this.connectedUsers.get(userId);
  }

  setPong(userId: number, socketId: string) {
    this.connectedtoPonng.set(userId, socketId);
  }

  deletePong(userId: number) {
    this.connectedtoPonng.delete(userId);
  }

  getSocketIdPong(userId: number): string | undefined {
    return this.connectedtoPonng.get(userId);
  }
  deleteBySocketIdPonng(socketId: string) {
    for (const [userId, id] of this.connectedtoPonng) {
      if (id === socketId) {
        this.connectedtoPonng.delete(userId);
        break; 
      }
    }
  }
}
