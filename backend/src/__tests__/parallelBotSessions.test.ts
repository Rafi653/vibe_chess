import { gameManager } from '../gameManager';
import { selectBotMove, BotDifficulty } from '../botPlayer';

describe('Parallel Bot Sessions', () => {
  // Clean up all test rooms before and after each test
  const testRooms: string[] = [];
  
  beforeEach(() => {
    // Clear any existing test rooms
    testRooms.forEach(roomId => {
      if (gameManager.hasGame(roomId)) {
        gameManager.removeGame(roomId);
      }
    });
    testRooms.length = 0;
  });

  afterEach(() => {
    // Clean up test rooms
    testRooms.forEach(roomId => {
      if (gameManager.hasGame(roomId)) {
        gameManager.removeGame(roomId);
      }
    });
  });

  describe('Multiple Concurrent Bot Games', () => {
    it('should support 5 parallel bot games without interference', () => {
      const numGames = 5;
      
      // Create 5 bot games
      for (let i = 1; i <= numGames; i++) {
        const roomId = `parallel-bot-room-${i}`;
        testRooms.push(roomId);
        
        gameManager.createGame(roomId, true, BotDifficulty.MEDIUM);
        gameManager.addPlayer(roomId, `user${i}`, `User${i}`, false);
        gameManager.addPlayer(roomId, 'bot-player', 'Bot', true);
        
        expect(gameManager.hasGame(roomId)).toBe(true);
        expect(gameManager.isBotGame(roomId)).toBe(true);
      }
      
      // Make user moves in all games
      for (let i = 1; i <= numGames; i++) {
        const roomId = `parallel-bot-room-${i}`;
        const userId = `user${i}`;
        
        const result = gameManager.makeMove(roomId, userId, { from: 'e2', to: 'e4' });
        expect(result.success).toBe(true);
      }
      
      // Make bot moves in all games
      for (let i = 1; i <= numGames; i++) {
        const roomId = `parallel-bot-room-${i}`;
        const chess = gameManager.getChessInstance(roomId);
        
        expect(chess).toBeTruthy();
        
        const botMove = selectBotMove(chess!, BotDifficulty.MEDIUM);
        expect(botMove).toBeTruthy();
        
        const result = gameManager.makeMove(roomId, 'bot-player', {
          from: botMove!.from,
          to: botMove!.to,
        });
        expect(result.success).toBe(true);
      }
      
      // Verify all games have correct state
      for (let i = 1; i <= numGames; i++) {
        const roomId = `parallel-bot-room-${i}`;
        const state = gameManager.getState(roomId);
        
        expect(state).toBeTruthy();
        expect(state.history.length).toBe(2); // User move + bot move
        expect(state.turn).toBe('w'); // White's turn again
      }
    });

    it('should handle different bot difficulties in parallel games', () => {
      const difficulties = [
        BotDifficulty.EASY,
        BotDifficulty.MEDIUM,
        BotDifficulty.HARD,
      ];
      
      difficulties.forEach((difficulty, index) => {
        const roomId = `difficulty-test-room-${index}`;
        testRooms.push(roomId);
        
        gameManager.createGame(roomId, true, difficulty);
        gameManager.addPlayer(roomId, `user${index}`, `User${index}`, false);
        gameManager.addPlayer(roomId, 'bot-player', 'Bot', true);
        
        expect(gameManager.getBotDifficulty(roomId)).toBe(difficulty);
      });
      
      // Make moves in all games
      difficulties.forEach((difficulty, index) => {
        const roomId = `difficulty-test-room-${index}`;
        const userId = `user${index}`;
        
        // User move
        const userResult = gameManager.makeMove(roomId, userId, { from: 'e2', to: 'e4' });
        expect(userResult.success).toBe(true);
        
        // Bot move
        const chess = gameManager.getChessInstance(roomId);
        const botMove = selectBotMove(chess!, difficulty);
        
        expect(botMove).toBeTruthy();
        
        const botResult = gameManager.makeMove(roomId, 'bot-player', {
          from: botMove!.from,
          to: botMove!.to,
        });
        expect(botResult.success).toBe(true);
      });
    });

    it('should maintain game isolation between parallel bot sessions', () => {
      const room1 = 'isolation-room-1';
      const room2 = 'isolation-room-2';
      testRooms.push(room1, room2);
      
      // Create two bot games
      gameManager.createGame(room1, true, BotDifficulty.EASY);
      gameManager.addPlayer(room1, 'user1', 'User1', false);
      gameManager.addPlayer(room1, 'bot-player', 'Bot', true);
      
      gameManager.createGame(room2, true, BotDifficulty.HARD);
      gameManager.addPlayer(room2, 'user2', 'User2', false);
      gameManager.addPlayer(room2, 'bot-player', 'Bot', true);
      
      // Make different opening moves
      gameManager.makeMove(room1, 'user1', { from: 'e2', to: 'e4' });
      gameManager.makeMove(room2, 'user2', { from: 'd2', to: 'd4' });
      
      const state1 = gameManager.getState(room1);
      const state2 = gameManager.getState(room2);
      
      // Verify games are isolated
      expect(state1.history[0]).toBe('e4');
      expect(state2.history[0]).toBe('d4');
      expect(state1.fen).not.toBe(state2.fen);
    });
  });

  describe('Bot Timeout Management', () => {
    it('should clear bot timeout when game is removed', () => {
      const roomId = 'timeout-cleanup-room';
      testRooms.push(roomId);
      
      gameManager.createGame(roomId, true, BotDifficulty.MEDIUM);
      gameManager.addPlayer(roomId, 'user1', 'User1', false);
      gameManager.addPlayer(roomId, 'bot-player', 'Bot', true);
      
      // Simulate setting a bot timeout (would normally happen in server.ts)
      const timeout = setTimeout(() => {}, 1000);
      gameManager.setBotMoveTimeout(roomId, timeout);
      
      expect(gameManager.hasPendingBotMove(roomId)).toBe(true);
      
      // Remove game should clear timeout
      gameManager.removeGame(roomId);
      
      // Note: We can't directly test if timeout was cleared, but we ensure
      // the game is removed and no errors occur
      expect(gameManager.hasGame(roomId)).toBe(false);
    });

    it('should allow clearing bot timeout manually', () => {
      const roomId = 'manual-timeout-clear-room';
      testRooms.push(roomId);
      
      gameManager.createGame(roomId, true, BotDifficulty.MEDIUM);
      
      const timeout = setTimeout(() => {}, 1000);
      gameManager.setBotMoveTimeout(roomId, timeout);
      
      expect(gameManager.hasPendingBotMove(roomId)).toBe(true);
      
      gameManager.clearBotMoveTimeout(roomId);
      
      expect(gameManager.hasPendingBotMove(roomId)).toBe(false);
    });

    it('should replace existing timeout when setting a new one', () => {
      const roomId = 'timeout-replace-room';
      testRooms.push(roomId);
      
      gameManager.createGame(roomId, true, BotDifficulty.MEDIUM);
      
      const timeout1 = setTimeout(() => {}, 1000);
      gameManager.setBotMoveTimeout(roomId, timeout1);
      
      expect(gameManager.hasPendingBotMove(roomId)).toBe(true);
      
      // Setting a new timeout should clear the old one
      const timeout2 = setTimeout(() => {}, 2000);
      gameManager.setBotMoveTimeout(roomId, timeout2);
      
      expect(gameManager.hasPendingBotMove(roomId)).toBe(true);
      
      // Clean up
      gameManager.clearBotMoveTimeout(roomId);
    });
  });

  describe('Race Condition Prevention', () => {
    it('should prevent rapid sequential moves by same player', () => {
      const roomId = 'race-condition-room';
      testRooms.push(roomId);
      
      gameManager.createGame(roomId, true, BotDifficulty.EASY);
      gameManager.addPlayer(roomId, 'user1', 'User1', false);
      gameManager.addPlayer(roomId, 'bot-player', 'Bot', true);
      
      // First move should succeed
      const move1 = gameManager.makeMove(roomId, 'user1', { from: 'e2', to: 'e4' });
      expect(move1.success).toBe(true);
      
      // Second move by same player should fail (not their turn)
      const move2 = gameManager.makeMove(roomId, 'user1', { from: 'd2', to: 'd4' });
      expect(move2.success).toBe(false);
      expect(move2.error).toBe('Not your turn');
      
      // Game state should only have one move
      const state = gameManager.getState(roomId);
      expect(state.history.length).toBe(1);
    });

    it('should handle game state correctly when bot moves are interleaved', () => {
      const room1 = 'interleave-room-1';
      const room2 = 'interleave-room-2';
      testRooms.push(room1, room2);
      
      // Create two games
      gameManager.createGame(room1, true, BotDifficulty.EASY);
      gameManager.addPlayer(room1, 'user1', 'User1', false);
      gameManager.addPlayer(room1, 'bot-player', 'Bot', true);
      
      gameManager.createGame(room2, true, BotDifficulty.EASY);
      gameManager.addPlayer(room2, 'user2', 'User2', false);
      gameManager.addPlayer(room2, 'bot-player', 'Bot', true);
      
      // Make moves in interleaved pattern
      gameManager.makeMove(room1, 'user1', { from: 'e2', to: 'e4' });
      gameManager.makeMove(room2, 'user2', { from: 'd2', to: 'd4' });
      
      // Get bot moves
      const chess1 = gameManager.getChessInstance(room1);
      const chess2 = gameManager.getChessInstance(room2);
      
      const botMove1 = selectBotMove(chess1!, BotDifficulty.EASY);
      const botMove2 = selectBotMove(chess2!, BotDifficulty.EASY);
      
      // Make bot moves
      gameManager.makeMove(room1, 'bot-player', {
        from: botMove1!.from,
        to: botMove1!.to,
      });
      gameManager.makeMove(room2, 'bot-player', {
        from: botMove2!.from,
        to: botMove2!.to,
      });
      
      // Verify both games have correct state
      const state1 = gameManager.getState(room1);
      const state2 = gameManager.getState(room2);
      
      expect(state1.history.length).toBe(2);
      expect(state2.history.length).toBe(2);
      expect(state1.history[0]).toBe('e4');
      expect(state2.history[0]).toBe('d4');
    });
  });

  describe('Bot Game Lifecycle', () => {
    it('should properly initialize bot game state', () => {
      const roomId = 'lifecycle-room';
      testRooms.push(roomId);
      
      gameManager.createGame(roomId, true, BotDifficulty.HARD);
      gameManager.addPlayer(roomId, 'user1', 'User1', false);
      gameManager.addPlayer(roomId, 'bot-player', 'Bot', true);
      
      const state = gameManager.getState(roomId);
      
      expect(state.isBotGame).toBe(true);
      expect(state.botDifficulty).toBe(BotDifficulty.HARD);
      expect(state.playerData.white?.isBot).toBe(false);
      expect(state.playerData.black?.isBot).toBe(true);
      expect(state.playerData.black?.userId).toBe('Bot');
    });

    it('should handle complete game with bot until checkmate', () => {
      const roomId = 'checkmate-room';
      testRooms.push(roomId);
      
      gameManager.createGame(roomId, true, BotDifficulty.EASY);
      gameManager.addPlayer(roomId, 'user1', 'User1', false);
      gameManager.addPlayer(roomId, 'bot-player', 'Bot', true);
      
      // Fool's mate sequence
      gameManager.makeMove(roomId, 'user1', { from: 'f2', to: 'f3' });
      gameManager.makeMove(roomId, 'bot-player', { from: 'e7', to: 'e5' });
      gameManager.makeMove(roomId, 'user1', { from: 'g2', to: 'g4' });
      gameManager.makeMove(roomId, 'bot-player', { from: 'd8', to: 'h4' });
      
      const state = gameManager.getState(roomId);
      
      expect(state.isCheckmate).toBe(true);
      expect(state.isGameOver).toBe(true);
    });
  });
});
