import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import express from 'express';
import { gameManager } from '../gameManager';

describe('Socket.IO Integration', () => {
  let httpServer: http.Server;
  let io: SocketIOServer;
  let clientSocket: ClientSocket;
  let port: number;

  beforeAll((done) => {
    const app = express();
    httpServer = http.createServer(app);
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Set up Socket.IO handlers (similar to server.ts)
    io.on('connection', (socket) => {
      socket.on('joinRoom', ({ roomId, playerId, userId }) => {
        if (!roomId) {
          socket.emit('error', { message: 'Room ID is required' });
          return;
        }

        socket.join(roomId);

        if (!gameManager.hasGame(roomId)) {
          gameManager.createGame(roomId);
        }

        const result = gameManager.addPlayer(roomId, playerId || socket.id, userId);
        const gameState = gameManager.getState(roomId);

        socket.emit('joinedRoom', {
          roomId,
          playerId: playerId || socket.id,
          color: result.color,
          gameState,
        });

        socket.to(roomId).emit('playerJoined', {
          playerId: playerId || socket.id,
          color: result.color,
          gameState,
        });
      });

      socket.on('move', ({ roomId, playerId, move }) => {
        if (!roomId || !move) {
          socket.emit('error', { message: 'Room ID and move are required' });
          return;
        }

        const result = gameManager.makeMove(roomId, playerId || socket.id, move);

        if (result.success) {
          io.to(roomId).emit('moveMade', {
            playerId: playerId || socket.id,
            move,
            gameState: result.gameState,
          });
        } else {
          socket.emit('moveError', {
            error: result.error,
          });
        }
      });

      socket.on('reset', ({ roomId }) => {
        if (!roomId) {
          socket.emit('error', { message: 'Room ID is required' });
          return;
        }

        const success = gameManager.resetGame(roomId);

        if (success) {
          const gameState = gameManager.getState(roomId);
          io.to(roomId).emit('gameReset', { gameState });
        } else {
          socket.emit('error', { message: 'Game not found' });
        }
      });
    });

    httpServer.listen(() => {
      const address = httpServer.address();
      if (address && typeof address === 'object') {
        port = address.port;
      }
      done();
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close();
    done();
  });

  beforeEach((done) => {
    clientSocket = Client(`http://localhost:${port}`);
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    // Clean up all games
    const testRoomIds = ['test-room-1', 'test-room-2', 'test-room-3'];
    testRoomIds.forEach((roomId) => {
      if (gameManager.hasGame(roomId)) {
        gameManager.removeGame(roomId);
      }
    });
  });

  describe('joinRoom event', () => {
    it('should join a room and receive joinedRoom event', (done) => {
      const roomId = 'test-room-1';
      const playerId = 'player1';

      clientSocket.on('joinedRoom', (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.playerId).toBe(playerId);
        expect(data.color).toBe('white');
        expect(data.gameState).toBeDefined();
        done();
      });

      clientSocket.emit('joinRoom', { roomId, playerId });
    });

    it('should emit error if roomId is missing', (done) => {
      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Room ID is required');
        done();
      });

      clientSocket.emit('joinRoom', {});
    });

    it('should assign first player as white and second as black', (done) => {
      const roomId = 'test-room-2';
      const client2 = Client(`http://localhost:${port}`);
      
      let player1Joined = false;
      let player2Joined = false;

      clientSocket.on('joinedRoom', (data) => {
        expect(data.color).toBe('white');
        player1Joined = true;
        
        // After first player joins, join with second player
        client2.emit('joinRoom', { roomId, playerId: 'player2' });
      });

      clientSocket.on('playerJoined', (data) => {
        expect(data.color).toBe('black');
        player2Joined = true;
        
        if (player1Joined && player2Joined) {
          client2.disconnect();
          done();
        }
      });

      client2.on('joinedRoom', (data) => {
        expect(data.color).toBe('black');
      });

      clientSocket.emit('joinRoom', { roomId, playerId: 'player1' });
    });
  });

  describe('move event', () => {
    beforeEach((done) => {
      const roomId = 'test-room-3';
      clientSocket.emit('joinRoom', { roomId, playerId: 'player1' });
      clientSocket.on('joinedRoom', () => done());
    });

    it('should emit moveMade for valid move', (done) => {
      const roomId = 'test-room-3';
      const move = { from: 'e2', to: 'e4' };

      clientSocket.on('moveMade', (data) => {
        expect(data.move).toEqual(move);
        expect(data.gameState).toBeDefined();
        expect(data.gameState.turn).toBe('b');
        done();
      });

      clientSocket.emit('move', { roomId, playerId: 'player1', move });
    });

    it('should emit moveError for invalid move', (done) => {
      const roomId = 'test-room-3';
      const move = { from: 'e2', to: 'e5' }; // Invalid pawn move

      clientSocket.on('moveError', (data) => {
        expect(data.error).toBe('Invalid move');
        done();
      });

      clientSocket.emit('move', { roomId, playerId: 'player1', move });
    });

    it('should emit error if roomId is missing', (done) => {
      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Room ID and move are required');
        done();
      });

      clientSocket.emit('move', { playerId: 'player1', move: { from: 'e2', to: 'e4' } });
    });
  });

  describe('reset event', () => {
    beforeEach((done) => {
      const roomId = 'test-room-3';
      clientSocket.emit('joinRoom', { roomId, playerId: 'player1' });
      clientSocket.on('joinedRoom', () => {
        // Make a move
        clientSocket.emit('move', {
          roomId,
          playerId: 'player1',
          move: { from: 'e2', to: 'e4' },
        });
        clientSocket.once('moveMade', () => done());
      });
    });

    it('should reset game and emit gameReset', (done) => {
      const roomId = 'test-room-3';

      clientSocket.on('gameReset', (data) => {
        expect(data.gameState).toBeDefined();
        expect(data.gameState.history).toHaveLength(0);
        expect(data.gameState.turn).toBe('w');
        done();
      });

      clientSocket.emit('reset', { roomId });
    });

    it('should emit error if roomId is missing', (done) => {
      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Room ID is required');
        done();
      });

      clientSocket.emit('reset', {});
    });
  });
});
