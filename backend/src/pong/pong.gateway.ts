import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { PongService } from './pong.service';
import { v4 as uuid } from 'uuid';
import { ConnectedUsersService } from 'src/connectedUsers/connectedUsers.service';

@WebSocketGateway({ cors: true,  namespace: 'pong' })
export class PongGateway {
  constructor(private pongService: PongService, private config: ConfigService, private readonly connectedUsersService: ConnectedUsersService) {}

  private playerNames: Map<string, string> = new Map();
  private gameModeQueue: Map<number, Socket[]> = new Map();
  private gameStates: Map<string, any> = new Map();
  private gameIds: Map<any, string> = new Map();
  
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket): void {
    console.log(`🏓   ${new Date().toISOString()} - ⚡: ${client.id} user just connected!`);
    const token = client.handshake.query.token as string;

    console.log("🏓   Received Token:", token);

      if (token) {
        try {
          const decoded = verify(token, this.config.get("JWT_SECRET"));
          console.log("🏓   voici lidentite du socket");
          console.log("🏓   ", decoded);

          //Array of Users connected to Pong
          
          this.connectedUsersService.setPong(Number(decoded.sub), client.id)
          const isConnected = { isConnected: true };
          client.emit("connected", isConnected);

        } catch (error) {
          console.log("🏓   Error:", error.message);
          client.disconnect();
        }
      } else {
        console.log('🏓   je suis passe par la');
        client.disconnect();
      }
  }

  handleDisconnect(client: Socket) {

    let gameIdToTerminate: string;
    let clientsMapToTerminate: any;
    
    //update connectedToPong
    
    this.connectedUsersService.deleteBySocketIdPonng(client.id);
    // Identify the game ID to terminate when disconnect or end of game.
    
    for (const [clientsMap, gameId] of this.gameIds.entries()) {
      if (clientsMap.has(client.id)) {
        gameIdToTerminate = gameId;
        clientsMapToTerminate = clientsMap;
        break;
      }
    }

    // Remove client from all game mode queues
    this.gameModeQueue.forEach((queue, gameMode) => {
      const index = queue.findIndex((queuedClient) => queuedClient.id === client.id);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    });

    if (gameIdToTerminate && clientsMapToTerminate) {
      //Notify remaining player
      for (const [playerId, playerSocket] of clientsMapToTerminate.entries()) {
        if (playerId !== client.id) {
          console.log(`🏓   ⚡: ${client.id} user just connected!`);
          playerSocket.emit('opponentDisconnected', { message: 'Your opponent has Disconnected. End of Game.' });
        }
      }
    }

    const isConnected = false;
    console.log(`🏓   🔥: ${client.id} user disconnected`);
    client.emit('connected', isConnected ); 

  }

  @SubscribeMessage('challengeGame')
  challengeGame(client: Socket, payload: any) {

    // Initializing the queue if not existing
    if (!this.gameModeQueue.has(payload.newGM)) {
      this.gameModeQueue.set(payload.newGM, []);
    }

    // Add to corresponding queue
    const queue = this.gameModeQueue.get(payload.newGM);
    queue.push(client);
    // this.matchmaking.push(client);

    this.playerNames.set(client.id, payload.playerName);    
  
  if (queue.length >= 2) {
      console.log('🏓   ⚡ 2 clients for GM 6!! ⚡');
      const gameId = payload.gameIdFromUrl;

      const player1 = queue.shift();
      const player2 = queue.shift();

      const clientsMap = new Map();
      clientsMap.set(player1.id, player1);
      clientsMap.set(player2.id, player2);

      this.gameIds.set(clientsMap, gameId);

      console.log('🏓   player1: ', player1.id);
      console.log('🏓   player1 username: ', this.playerNames.get(player1.id));
      const hostName = this.playerNames.get(player1.id);
      const clientName = this.playerNames.get(player2.id);
      console.log('🏓   player2: ', player2.id);
      console.log('🏓   player2 username: ', this.playerNames.get(player2.id));
  
      player1.join(gameId);
      player2.join(gameId);

      // Emit an event to both clients to indicate that the match is ready to start
      player1.emit('playerJoined', { gameId: gameId, hostStatus: true, hostName: hostName, clientName: clientName });
      player2.emit('playerJoined', { gameId: gameId, hostStatus: false, hostName: hostName, clientName: clientName });
      console.log(`🏓   Game ${gameId} started between ${hostName} and ${clientName}`);
    }
  }
  @SubscribeMessage('challengeGame')
  challengeGame(client: Socket, payload: any) {


  @SubscribeMessage('waitingForPlayerGM3')
  handleWaitingForPlayerGM3(client: Socket, payload: any) {

    // Initializing the queue if not existing
    if (!this.gameModeQueue.has(payload.newGM)) {
      this.gameModeQueue.set(payload.newGM, []);
    }

    // Add to corresponding queue
    const queue = this.gameModeQueue.get(payload.newGM);
    queue.push(client);
    // this.matchmaking.push(client);

    this.playerNames.set(client.id, payload.playerName);    
  
  if (queue.length >= 2) {
      console.log('🏓   ⚡ 2 clients for GM 3!! ⚡');
      const gameId = uuid();

      const player1 = queue.shift();
      const player2 = queue.shift();

      const clientsMap = new Map();
      clientsMap.set(player1.id, player1);
      clientsMap.set(player2.id, player2);

      this.gameIds.set(clientsMap, gameId);

      console.log('🏓   player1: ', player1.id);
      console.log('🏓   player1 username: ', this.playerNames.get(player1.id));
      const hostName = this.playerNames.get(player1.id);
      const clientName = this.playerNames.get(player2.id);
      console.log('🏓   player2: ', player2.id);
      console.log('🏓   player2 username: ', this.playerNames.get(player2.id));
  
      player1.join(gameId);
      player2.join(gameId);

      // Emit an event to both clients to indicate that the match is ready to start
      player1.emit('playerJoined', { gameId: gameId, hostStatus: true, hostName: hostName, clientName: clientName });
      player2.emit('playerJoined', { gameId: gameId, hostStatus: false, hostName: hostName, clientName: clientName });
      console.log(`🏓   Game ${gameId} started between ${hostName} and ${clientName}`);
    }
  }

  // @SubscribeMessage('waitingForPlayerGM4')
  // handleWaitingForPlayerGM4(client: Socket, payload: any) {
  //   // Initializing the queue if not existing
  //   if (!this.gameModeQueue.has(payload.newGM)) {
  //     this.gameModeQueue.set(payload.newGM, []);
  //   }

  //   // Add to corresponding queue
  //   const queue = this.gameModeQueue.get(payload.newGM);
  //   queue.push(client);

  //   this.playerNames.set(client.id, payload.playerName);    
  
  // if (queue.length >= 2) {
  //     console.log('🏓   ⚡ 2 clients for GM 4!! ⚡');
  //     const gameId = uuid();

  //     const player1 = queue.shift();
  //     const player2 = queue.shift();

  //     const clientsMap = new Map();
  //     clientsMap.set(player1.id, player1);
  //     clientsMap.set(player2.id, player2);

  //     this.gameIds.set(clientsMap, gameId);
      
  //     console.log('🏓   player1: ', player1.id);
  //     console.log('🏓   player1 username: ', this.playerNames.get(player1.id));
  //     const hostName = this.playerNames.get(player1.id);
  //     const clientName = this.playerNames.get(player2.id);
  //     console.log('🏓   player2: ', player2.id);
  //     console.log('🏓   player2 username: ', this.playerNames.get(player2.id));
  
  //     player1.join(gameId);
  //     player2.join(gameId);

  //     // Emit an event to both clients to indicate that the match is ready to start
  //     player1.emit('playerJoined', { gameId: gameId, hostStatus: true, hostName: hostName, clientName: clientName });
  //     player2.emit('playerJoined', { gameId: gameId, hostStatus: false, hostName: hostName, clientName: clientName });
  //     console.log(`🏓   Game ${gameId} started between ${hostName} and ${clientName}`);
  //   }
  // }

  @SubscribeMessage('hostGameParameters')
  handleGameParameters(client: Socket, payload: any) {
    const gameId = payload.gameId; // Make sure to send gameId from client
    
    this.gameStates.set(gameId, payload);

    this.server.to(gameId).volatile.emit('hostMovesUpdate', payload);
  }

  @SubscribeMessage('clientGameParameters')
  handleGameParametersClient(client: Socket, payload: any) {
    const gameId = payload.gameId; // Make sure to send gameId from client
    
    this.gameStates.set(gameId, payload);

    this.server.to(gameId).volatile.emit('clientMovesUpdate', payload);
  }

  // @SubscribeMessage('goalScored')
  // handleGoal(client: Socket, payload: any) {
  //   const gameId = payload.gameId;

  //   this.gameStates.set(gameId, payload);

  //   this.server.to(gameId).volatile.emit('goalScored', payload);
  // }

  @SubscribeMessage('weHaveAWinner')
  handleWinner(client: Socket, payload: any) {
    const gameId = payload.gameId; // Make sure to send gameId from client
    
    this.server.to(gameId).emit('weHaveAWinner', payload);
    console.log(`🏓   in ${gameId}, the winner is  `, payload.isHostWinner.current);

    this.gameStates.set(gameId, payload);
    this.server.to(gameId).volatile.emit('weHaveAWinner', payload);
    
    //player1 = host (toujours)
    // if (payload.isHostWinner) {
    //   const winnerId = 1;
    //   const loserId = 2;
    // } else {
    //   const winnerId = 1;
    //   const loserId = 2;
    // }

  

    // cleaning the gameId from the list of gameIds:
    let clientsMapToTerminate: any;
  
    // Identify the game ID to terminate when the game ends.
    for (const [clientsMap, existingGameId] of this.gameIds.entries()) {
      if (existingGameId === gameId) {
        clientsMapToTerminate = clientsMap;
        break;
      }
    }

    if (clientsMapToTerminate) {
      // Remove game from gameIds map
      this.gameIds.delete(clientsMapToTerminate);
    }
  }
  @SubscribeMessage('updateHistory')
  updateHistory(client: Socket, payload: {hostname:string, clientName:string, isHostWinner:boolean}){
    if(!payload.isHostWinner){
      this.pongService.updateHistory(payload.clientName, payload.hostname);
    }
    else{
      this.pongService.updateHistory(payload.hostname, payload.clientName);
    }
    

  }
  
}
