import {  Injectable } from '@nestjs/common';

@Injectable()
export class ConnectedUsersService {
   connectedUsers: Map<number, string> = new Map();
   connectedtoPong: Map<number, string> = new Map();
   userAvailability: Map<number, boolean> = new Map();

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
    this.connectedtoPong.set(userId, socketId);
  }

  deletePong(userId: number) {
    this.connectedtoPong.delete(userId);
  }

  getSocketIdPong(userId: number): string | undefined {
    return this.connectedtoPong.get(userId);
  }
  
  deleteBySocketIdPong(socketId: string) {
    for (const [userId, id] of this.connectedtoPong) {
      if (id === socketId) {
        this.connectedtoPong.delete(userId);
        break; 
      }
    }
  }
}
