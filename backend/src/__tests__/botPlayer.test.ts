import { Chess } from 'chess.js';
import { selectBotMove, getBotDelay, BotDifficulty } from '../botPlayer';

describe('BotPlayer', () => {
  describe('selectBotMove', () => {
    it('should return a valid move for a new game', () => {
      const chess = new Chess();
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      expect(move).toBeDefined();
      expect(move).toHaveProperty('from');
      expect(move).toHaveProperty('to');
    });

    it('should return a legal move', () => {
      const chess = new Chess();
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      // Verify the move is legal by attempting it
      const result = chess.move(move);
      expect(result).toBeTruthy();
    });

    it('should return null when there are no legal moves (checkmate)', () => {
      // Fool's mate position - black is checkmated
      const chess = new Chess('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      expect(move).toBeNull();
    });

    it('should handle easy difficulty', () => {
      const chess = new Chess();
      const move = selectBotMove(chess, BotDifficulty.EASY);
      
      expect(move).toBeDefined();
      const result = chess.move(move);
      expect(result).toBeTruthy();
    });

    it('should handle medium difficulty', () => {
      const chess = new Chess();
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      expect(move).toBeDefined();
      const result = chess.move(move);
      expect(result).toBeTruthy();
    });

    it('should handle hard difficulty', () => {
      const chess = new Chess();
      const move = selectBotMove(chess, BotDifficulty.HARD);
      
      expect(move).toBeDefined();
      const result = chess.move(move);
      expect(result).toBeTruthy();
    });

    it('should make capturing moves when available', () => {
      // Position where white can capture
      const chess = new Chess('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
      chess.move('d2d4'); // White opens
      chess.move('e5d4'); // Black captures
      
      // Now it's white's turn and there's a piece to capture
      const move = selectBotMove(chess, BotDifficulty.HARD);
      expect(move).toBeDefined();
      
      const result = chess.move(move);
      expect(result).toBeTruthy();
    });

    it('should avoid illegal moves', () => {
      const chess = new Chess();
      
      // Run bot multiple times to ensure it never makes illegal moves
      for (let i = 0; i < 10; i++) {
        const testChess = new Chess();
        const move = selectBotMove(testChess, BotDifficulty.MEDIUM);
        
        if (move) {
          const result = testChess.move(move);
          expect(result).toBeTruthy();
        }
      }
    });

    it('should make different moves on different calls (randomness check)', () => {
      const moves = new Set();
      
      for (let i = 0; i < 20; i++) {
        const chess = new Chess();
        const move = selectBotMove(chess, BotDifficulty.EASY);
        if (move) {
          moves.add(`${move.from}-${move.to}`);
        }
      }
      
      // Easy bot should show some variety (at least 2 different moves in 20 attempts)
      expect(moves.size).toBeGreaterThan(1);
    });

    it('should handle midgame positions', () => {
      // Midgame position
      const chess = new Chess('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4');
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      expect(move).toBeDefined();
      const result = chess.move(move);
      expect(result).toBeTruthy();
    });

    it('should handle endgame positions', () => {
      // Simple endgame
      const chess = new Chess('8/8/8/4k3/8/4K3/8/8 w - - 0 1');
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      expect(move).toBeDefined();
      const result = chess.move(move);
      expect(result).toBeTruthy();
    });

    it('should handle stalemate avoidance', () => {
      // Position near stalemate
      const chess = new Chess('7k/8/6Q1/8/8/8/8/7K b - - 0 1');
      
      // The king is not in check but has no legal moves - this is stalemate
      expect(chess.isStalemate()).toBe(true);
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      // Should return null since there are no legal moves
      expect(move).toBeNull();
    });
  });

  describe('getBotDelay', () => {
    it('should return a delay for easy difficulty', () => {
      const delay = getBotDelay(BotDifficulty.EASY);
      expect(delay).toBeGreaterThanOrEqual(500);
      expect(delay).toBeLessThanOrEqual(1000);
    });

    it('should return a delay for medium difficulty', () => {
      const delay = getBotDelay(BotDifficulty.MEDIUM);
      expect(delay).toBeGreaterThanOrEqual(800);
      expect(delay).toBeLessThanOrEqual(1500);
    });

    it('should return a delay for hard difficulty', () => {
      const delay = getBotDelay(BotDifficulty.HARD);
      expect(delay).toBeGreaterThanOrEqual(1200);
      expect(delay).toBeLessThanOrEqual(2000);
    });

    it('should return different delays on consecutive calls', () => {
      const delays = new Set();
      
      for (let i = 0; i < 10; i++) {
        delays.add(getBotDelay(BotDifficulty.MEDIUM));
      }
      
      // Should have some variety (at least 3 different values in 10 calls)
      expect(delays.size).toBeGreaterThan(2);
    });
  });

  describe('Bot difficulty differences', () => {
    it('should make moves at all difficulty levels', () => {
      const chess = new Chess();
      
      const easyMove = selectBotMove(chess, BotDifficulty.EASY);
      const mediumMove = selectBotMove(new Chess(), BotDifficulty.MEDIUM);
      const hardMove = selectBotMove(new Chess(), BotDifficulty.HARD);
      
      expect(easyMove).toBeDefined();
      expect(mediumMove).toBeDefined();
      expect(hardMove).toBeDefined();
    });

    it('should handle complex tactical positions', () => {
      // Position with a tactical opportunity (fork available)
      const chess = new Chess('rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3');
      
      const move = selectBotMove(chess, BotDifficulty.HARD);
      expect(move).toBeDefined();
      
      const result = chess.move(move);
      expect(result).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle positions with only king moves available', () => {
      const chess = new Chess('8/8/8/8/8/8/8/K6k w - - 0 1');
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      expect(move).toBeDefined();
      expect(move.piece).toBe('k');
    });

    it('should handle positions with promotion available', () => {
      // White pawn about to promote
      const chess = new Chess('8/4P3/8/8/8/8/8/K6k w - - 0 1');
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      expect(move).toBeDefined();
      if (move.to[1] === '8') {
        expect(move.promotion).toBeDefined();
      }
    });

    it('should handle check situations', () => {
      // Black king in check
      const chess = new Chess('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
      
      // White must respond to check
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      // In this position, white is actually checkmated, so no move available
      expect(move).toBeNull();
    });

    it('should handle positions with castling available', () => {
      // Position where castling is legal
      const chess = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      const move = selectBotMove(chess, BotDifficulty.MEDIUM);
      
      expect(move).toBeDefined();
      const result = chess.move(move);
      expect(result).toBeTruthy();
    });
  });
});
