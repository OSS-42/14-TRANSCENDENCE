import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { PongService } from './pong.service';
import { v4 as uuid } from 'uuid';

@WebSocketGateway({ cors: true,  namespace: 'pongGame' })
export class PongGateway {
  constructor(private pongService: PongService, private config: ConfigService) {}

  private connectedUsers: Map<number, string> = new Map(); 
  private matchmaking: Socket[] = [];
  
  @WebSocketServer()
  server: Server


  handleConnection(client: Socket) {
    console.log(`⚡: ${client.id} user just connected!`);
    const token = client.handshake.query.token as string
      if (token) {
        try {
          const decoded = verify(token, this.config.get("JWT_SECRET"));
          console.log("voici lidentite du socket")
          console.log(decoded)
          this.connectedUsers.set( Number(decoded.sub), client.id);
          const connectedUserIds = Array.from(this.connectedUsers.keys());
          this.server.emit("updateConnectedUsers", connectedUserIds)
        } catch (error) {
          client.disconnect();
        }
      } else {
        client.disconnect();
      }
  }

  handleDisconnect(client: Socket) {
    
    const index = this.matchmaking.indexOf(client);
    if (index !== -1) {
      this.matchmaking.splice(index, 1);
    }
    console.log(`🔥: ${client.id} user disconnected`); 
    //supprime le le client.id de la map de connectedUser lorsque ce dernier ce déconnecte!
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }
//IL faudra faire un bouton pour join queue
  @SubscribeMessage('joinQueue')
  handleJoinQueue(client: Socket) {
    // Ajouter le joueur à la salle d'attente uniquement s'il le souhaite
    this.matchmaking.push(client);
    client.emit('queued'); // Informer le joueur qu'il est maintenant dans la salle d'attente
    //je pourrais retourner lavatar pour mettre de la queue
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(client: Socket) {
    // Retirer le joueur de la salle d'attente s'il le souhaite
    const index = this.matchmaking.indexOf(client);
    if (index !== -1) {
      this.matchmaking.splice(index, 1);
      client.emit('leftQueue'); // Informer le joueur qu'il a quitté la salle d'attente
    }
  }

  @SubscribeMessage('startQueue')
  handleStartQueue(client: Socket) {
    if (this.matchmaking.length >= 2) {
      // Assez de joueurs pour commencer une partie
      //shift retire les joueur de la quque
      const gameRoom = `game-${uuid()}`;
      this.matchmaking.shift().join(gameRoom);
      this.matchmaking.shift().join(gameRoom);
      this.server.to(gameRoom).emit('gameStart');
    } else {
      client.emit('notEnoughPlayers');
    }
  }
  handleUpdateBallPosition(client: Socket, ballPosition: { x: number, y: number }) {
    // Récupérer la salle du client
    const gameRoom = this.getGameRoom(client);
    
    // Émettre l'événement de mise à jour de la position de la balle à la salle
    this.server.to(gameRoom).emit('ballPositionUpdated', ballPosition);
  }

  // Méthode pour obtenir la salle du client
  private getGameRoom(client: Socket): string | null {
    for (const room of client.rooms.values()) {
      if (room !== client.id) {
        return room;
      }
    }
    return null;
  }

  
}

                /*IDEES A EXPLORER
Je pense quon va partir un socket different pour le jeu de pong
ajouter un paylod a levent game start afin denvoyer le id et le username au frontend
assurer la bonne correspondance avec l<utilsateur host
lorsque que le jeu se termine, SEULEMENT le host envoie les resulat de la partie au backend. La route est deja fait.
Penser quoi faire au niveau FRONTEND pour LINvitation a une parie.

EXEMPLE DE LOGIQUE POUR LINVITATION

@SubscribeMessage('invitePlayer')
invitePlayer(client: Socket, targetUserId: number) {
  const targetSocket = this.findSocketByUserId(targetUserId);
  if (targetSocket) {
    targetSocket.emit('invitationReceived', client.id);
  } else {
    client.emit('playerNotFound');
  }
}
@SubscribeMessage('acceptInvitation')
acceptInvitation(client: Socket, inviterSocketId: string) {
  const inviterSocket = this.server.sockets.sockets.get(inviterSocketId);
  if (inviterSocket) {
    const privateRoom = `private-${uuid()}`;
    inviterSocket.join(privateRoom);
    client.join(privateRoom);
    inviterSocket.emit('invitationAccepted', privateRoom);
    client.emit('invitationAccepted', privateRoom);
  }
}
@SubscribeMessage('rejectInvitation')
rejectInvitation(client: Socket, inviterSocketId: string) {
  const inviterSocket = this.server.sockets.sockets.get(inviterSocketId);
  if (inviterSocket) {
    inviterSocket.emit('invitationRejected');
  }
}
*/