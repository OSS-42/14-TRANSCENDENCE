import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { PongService } from './pong.service';
import { v4 as uuid } from 'uuid';
import { ConnectedUsersService } from 'src/connectedUsers/connectedUsers.service';

interface ChallengeGame {
  playerName: string;
  newGM: number;
  gameIdFromUrl: string;
}

interface GM3 {
  playerName: string;
  newGM: number;
}

interface ClientGameParameters {
  gameId: string;
  rightPaddlePositionZ: number;
}

interface HostGameParameters {
  gameId: string;
  // ballPosition: { x: number; y: number; z: number };
  // ballVelocity: { x: number, z: number };
  leftPaddlePositionZ: number;
  leftScore: number;
  rightScore: number;
};

interface WeHaveAWinner {
  gameId: string;
  theHostIsWinner: boolean;
  winnerText: string;
  hostname: string;
  clientName: string;
};

interface NewRound {
  gameId: string;
}

interface BallPosition {
  ballPosition: { x: number; y: number; z: number };
  gameId: string;
}

type GameState = HostGameParameters | ClientGameParameters | WeHaveAWinner | NewRound | BallPosition;

@WebSocketGateway({ cors: true,  namespace: 'pong' })
export class PongGateway {
  constructor(private pongService: PongService, private config: ConfigService, private readonly connectedUsersService: ConnectedUsersService) {}

  private playerNames: Map<string, string> = new Map();
  private gameModeQueue: Map<number, Socket[]> = new Map();
  private gameStates: Map<string, GameState> = new Map();
  private gameIds: Map<Map<string, Socket>, string> = new Map();
  
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket): void {
    const token = client.handshake.query.token as string;

      if (token) {
        try {
          const decoded = verify(token, this.config.get("JWT_SECRET"));

          //Array of Users connected to Pong
          this.connectedUsersService.setPong(Number(decoded.sub), client.id);

          const isConnected = { isConnected: true };
          client.emit("connected", isConnected);

        } catch (error) {
          console.log("🏓   Error:", error.message);
          client.disconnect();
        }
      } else {
        client.disconnect();
      }
  }

  handleDisconnect(client: Socket) {
    const token = client.handshake.query.token as string; // UPDATE
    const decoded = verify(token, this.config.get("JWT_SECRET")); // UPDATE
    let gameIdToTerminate: string;
    let clientsMapToTerminate: Map<string, Socket>;

    //update connectedToPong

    this.connectedUsersService.deleteBySocketIdPong(client.id);

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
          playerSocket.emit('opponentDisconnected', { message: 'Your opponent has Disconnected. End of Game.' });
        }
      }
    }

    const isConnected = false;
    client.emit('connected', isConnected );

  }

  @SubscribeMessage('disconnected')
  handlePlayerDisconnect(client: Socket) {
  // handlePlayerDisconnect(client: Socket, payload: any) {

    this.handleDisconnect(client);
  }

  @SubscribeMessage('challengeGame')
  challengeGame(client: Socket, payload: ChallengeGame) {

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
      const gameId = payload.gameIdFromUrl;

      const player1 = queue.shift();
      const player2 = queue.shift();

      const clientsMap = new Map();
      clientsMap.set(player1.id, player1);
      clientsMap.set(player2.id, player2);

      this.gameIds.set(clientsMap, gameId);

      const hostName = this.playerNames.get(player1.id);
      const clientName = this.playerNames.get(player2.id);

      player1.join(gameId);
      player2.join(gameId);

      // Emit an event to both clients to indicate that the match is ready to start
      player1.emit('playerJoined', { gameId: gameId, hostStatus: true, hostName: hostName, clientName: clientName });
      player2.emit('playerJoined', { gameId: gameId, hostStatus: false, hostName: hostName, clientName: clientName });
    }
  }


  @SubscribeMessage('waitingForPlayerGM3')
  handleWaitingForPlayerGM3(client: Socket, payload: GM3) {

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
      const gameId = uuid();

      const player1 = queue.shift();
      const player2 = queue.shift();

      const clientsMap = new Map();
      clientsMap.set(player1.id, player1);
      clientsMap.set(player2.id, player2);

      this.gameIds.set(clientsMap, gameId);

      const hostName = this.playerNames.get(player1.id);
      const clientName = this.playerNames.get(player2.id);

      player1.join(gameId);
      player2.join(gameId);

      // Emit an event to both clients to indicate that the match is ready to start
      player1.emit('playerJoined', { gameId: gameId, hostStatus: true, hostName: hostName, clientName: clientName });
      player2.emit('playerJoined', { gameId: gameId, hostStatus: false, hostName: hostName, clientName: clientName });
    }
  }

  @SubscribeMessage('hostGameParameters')
  handleGameParameters(client: Socket, payload: HostGameParameters) {
    const gameId = payload.gameId; // Make sure to send gameId from client

    this.gameStates.set(gameId, payload);

    this.server.to(gameId).volatile.emit('hostMovesUpdate', payload);
  }

  @SubscribeMessage('clientGameParameters')
  handleGameParametersClient(client: Socket, payload: ClientGameParameters) {
    const gameId = payload.gameId; // Make sure to send gameId from client

    this.gameStates.set(gameId, payload);

    this.server.to(gameId).volatile.emit('clientMovesUpdate', payload);
  }

  @SubscribeMessage('newRound')
  launchNewRound(client: Socket, payload: NewRound) {

    const gameId = payload.gameId;
    // console.log('server starting new round for :', gameId);

    this.gameStates.set(gameId, payload);

    this.server.to(gameId).volatile.emit('startNewRound', payload);
  }

  @SubscribeMessage('ballPositionUpdate')
  newBallPosition(client: Socket, payload: BallPosition) {
    const gameId = payload.gameId;

    this.gameStates.set(gameId, payload);

    this.server.to(gameId).volatile.emit('newBallPosition', payload);
  }

  @SubscribeMessage('weHaveAWinner')
  handleWinner(client: Socket, payload: WeHaveAWinner) {
    const gameId = payload.gameId; // Make sure to send gameId from client

    console.log('weHaveAWinner', gameId);
    this.gameStates.set(gameId, payload);

    // this.server.to(gameId).volatile.emit('endGame', payload);
    this.server.to(gameId).emit('endGame', payload);

    if(!payload.theHostIsWinner){
      this.pongService.updateHistory(payload.clientName, payload.hostname);
    }
    else{
      this.pongService.updateHistory(payload.hostname, payload.clientName);
    }

    // cleaning the gameId from the list of gameIds:
    let clientsMapToTerminate: Map<string, Socket>;

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
}
