import {  Injectable } from '@nestjs/common';

@Injectable()
export class ConnectedUsersService {
   connectedUsers: Map<number, string> = new Map();
   connectedToPong: Map<number, string> = new Map();userAvailability: Map<number, boolean> = new Map();

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
    this.connectedToPong.set(userId, socketId);
  }

  deletePong(userId: number) {
    this.connectedToPong.delete(userId);
  }

  getSocketIdPong(userId: number): string | undefined {
    return this.connectedToPong.get(userId);
  }
  
  deleteBySocketIdPong(socketId: string) {
    for (const [userId, id] of this.connectedToPong) {
      if (id === socketId) {
        this.connectedToPong.delete(userId);
        break; 
      }
    }
  }
}
