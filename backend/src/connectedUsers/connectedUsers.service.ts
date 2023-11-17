import {  Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Socket } from 'socket.io';


@Injectable()
export class ConnectedUsersService implements OnModuleInit {
  public events: EventEmitter;
  
  onModuleInit() {
    this.events = new EventEmitter();
  }

   connectedUsers: Map<number, string> = new Map();
   connectedUsersSocket: Map<number, Socket> = new Map();
   connectedToPong: Map<number, string> = new Map();

  set(userId: number, socketId: string) {
    this.connectedUsers.set(userId, socketId);
    this.events.emit("updateConnectedUsers");
  }

  setSocketChat(userId: number, socket: Socket) {
    this.connectedUsersSocket.set(userId, socket);
  }

  delete(userId: number) {
    this.connectedUsers.delete(userId);
    this.events.emit("updateConnectedUsers");
  }

  getSocketId(userId: number): string | undefined {
    return this.connectedUsers.get(userId);
  }

  getSocketChat(userId: number): Socket | undefined {
    return this.connectedUsersSocket.get(userId);
  }

  setPong(userId: number, socketId: string) {
    this.connectedToPong.set(userId, socketId);
    this.events.emit("updateConnectedUsers");
  }

  deletePong(userId: number) {
    this.connectedToPong.delete(userId);
    this.events.emit("updateConnectedUsers");
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
