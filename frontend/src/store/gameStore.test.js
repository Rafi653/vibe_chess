import { describe, it, expect, beforeEach } from 'vitest';
import useGameStore from '../store/gameStore';
import { Chess } from 'chess.js';

describe('gameStore', () => {
  beforeEach(() => {
    const store = useGameStore.getState();
    // Reset to initial state
    store.chess = new Chess();
    store.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    store.gameOver = false;
    store.winner = null;
    store.gameSaved = false;
    store.roomId = null;
    store.playerId = null;
    store.playerColor = null;
    store.currentTurn = 'w';
    store.connected = false;
    store.gameStatus = 'waiting';
    store.players = { white: null, black: null };
    store.playerData = {};
    store.moveHistory = [];
    store.capturedPieces = { white: [], black: [] };
    store.selectedSquare = null;
    store.validMoves = [];
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useGameStore.getState();
      expect(state.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(state.gameOver).toBe(false);
      expect(state.winner).toBeNull();
      expect(state.currentTurn).toBe('w');
      expect(state.gameStatus).toBe('waiting');
    });

    it('should have empty move history', () => {
      const state = useGameStore.getState();
      expect(state.moveHistory).toHaveLength(0);
    });

    it('should have no captured pieces', () => {
      const state = useGameStore.getState();
      expect(state.capturedPieces.white).toHaveLength(0);
      expect(state.capturedPieces.black).toHaveLength(0);
    });
  });

  describe('setRoomId', () => {
    it('should set room ID', () => {
      const { setRoomId } = useGameStore.getState();
      setRoomId('test-room-123');
      expect(useGameStore.getState().roomId).toBe('test-room-123');
    });
  });

  describe('setPlayerId', () => {
    it('should set player ID', () => {
      const { setPlayerId } = useGameStore.getState();
      setPlayerId('player-123');
      expect(useGameStore.getState().playerId).toBe('player-123');
    });
  });

  describe('setPlayerColor', () => {
    it('should set player color to white', () => {
      const { setPlayerColor } = useGameStore.getState();
      setPlayerColor('white');
      expect(useGameStore.getState().playerColor).toBe('white');
    });

    it('should set player color to black', () => {
      const { setPlayerColor } = useGameStore.getState();
      setPlayerColor('black');
      expect(useGameStore.getState().playerColor).toBe('black');
    });
  });

  describe('setConnected', () => {
    it('should set connected status', () => {
      const { setConnected } = useGameStore.getState();
      setConnected(true);
      expect(useGameStore.getState().connected).toBe(true);
    });
  });

  describe('setGameStatus', () => {
    it('should set game status to playing', () => {
      const { setGameStatus } = useGameStore.getState();
      setGameStatus('playing');
      expect(useGameStore.getState().gameStatus).toBe('playing');
    });

    it('should set game status to finished', () => {
      const { setGameStatus } = useGameStore.getState();
      setGameStatus('finished');
      expect(useGameStore.getState().gameStatus).toBe('finished');
    });
  });

  describe('setPlayers', () => {
    it('should set both players', () => {
      const { setPlayers } = useGameStore.getState();
      const players = { white: 'player1', black: 'player2' };
      setPlayers(players);
      expect(useGameStore.getState().players).toEqual(players);
    });
  });

  describe('updateGameState', () => {
    it('should update game state with new FEN', () => {
      const { updateGameState } = useGameStore.getState();
      const newGameState = {
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        turn: 'b',
        isGameOver: false,
        isCheckmate: false,
        players: { white: 'player1', black: 'player2' },
      };
      
      updateGameState(newGameState);
      
      const state = useGameStore.getState();
      expect(state.fen).toBe(newGameState.fen);
      expect(state.currentTurn).toBe('b');
      expect(state.gameOver).toBe(false);
    });

    it('should detect winner when checkmate occurs', () => {
      const { updateGameState } = useGameStore.getState();
      // Fool's mate position - black wins
      const checkmateState = {
        fen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
        turn: 'w',
        isGameOver: true,
        isCheckmate: true,
        players: { white: 'player1', black: 'player2' },
      };
      
      updateGameState(checkmateState);
      
      const state = useGameStore.getState();
      expect(state.gameOver).toBe(true);
      expect(state.winner).toBe('black'); // White's turn and checkmate means black wins
    });

    it('should load FEN position correctly', () => {
      const { updateGameState } = useGameStore.getState();
      const stateAfterMove = {
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        turn: 'b',
        isGameOver: false,
        isCheckmate: false,
        players: { white: 'player1', black: 'player2' },
      };
      
      updateGameState(stateAfterMove);
      
      const state = useGameStore.getState();
      expect(state.fen).toBe(stateAfterMove.fen);
      expect(state.currentTurn).toBe('b');
      // Note: history() only returns moves from the current position, not the full game history
      // when loading from FEN
    });

    it('should change game status to playing when both players present', () => {
      const { updateGameState } = useGameStore.getState();
      const gameState = {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        turn: 'w',
        isGameOver: false,
        isCheckmate: false,
        players: { white: 'player1', black: 'player2' },
      };
      
      updateGameState(gameState);
      
      expect(useGameStore.getState().gameStatus).toBe('playing');
    });

    it('should change game status to finished when game is over', () => {
      const { updateGameState } = useGameStore.getState();
      const gameState = {
        fen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
        turn: 'w',
        isGameOver: true,
        isCheckmate: true,
        players: { white: 'player1', black: 'player2' },
      };
      
      updateGameState(gameState);
      
      expect(useGameStore.getState().gameStatus).toBe('finished');
    });
  });

  describe('makeMove', () => {
    beforeEach(() => {
      const { setPlayerColor, setPlayerId } = useGameStore.getState();
      setPlayerColor('white');
      setPlayerId('player1');
    });

    it('should make valid move and return move object', () => {
      const { makeMove } = useGameStore.getState();
      const move = makeMove('e2', 'e4');
      
      expect(move).toBeDefined();
      expect(move.from).toBe('e2');
      expect(move.to).toBe('e4');
    });

    it('should update FEN after move', () => {
      const { makeMove } = useGameStore.getState();
      makeMove('e2', 'e4');
      
      const state = useGameStore.getState();
      expect(state.fen).not.toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(state.currentTurn).toBe('b');
    });

    it('should not allow move when not player turn', () => {
      const { setPlayerColor, makeMove } = useGameStore.getState();
      setPlayerColor('black'); // Set as black player
      
      const move = makeMove('e2', 'e4'); // Try to move white piece
      
      expect(move).toBeNull();
    });

    it('should reject invalid moves', () => {
      const { makeMove } = useGameStore.getState();
      const move = makeMove('e2', 'e5'); // Pawn can't move 3 squares
      
      expect(move).toBeNull();
    });

    it('should update move history after successful move', () => {
      const { makeMove } = useGameStore.getState();
      makeMove('e2', 'e4');
      
      const state = useGameStore.getState();
      expect(state.moveHistory.length).toBeGreaterThan(0);
    });
  });

  describe('resetGame', () => {
    it('should reset game to initial state', () => {
      const { makeMove, resetGame } = useGameStore.getState();
      
      // Make some moves
      makeMove('e2', 'e4');
      
      // Reset
      resetGame();
      
      const state = useGameStore.getState();
      expect(state.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(state.currentTurn).toBe('w');
      expect(state.moveHistory).toHaveLength(0);
      expect(state.gameOver).toBe(false);
      expect(state.winner).toBeNull();
    });
  });

  describe('selectSquare - Tap to Move', () => {
    beforeEach(() => {
      // Set up a player so they can make moves
      const store = useGameStore.getState();
      store.playerColor = 'white';
      store.currentTurn = 'w';
      store.gameOver = false;
    });

    it('should select a square with a piece', () => {
      const { selectSquare } = useGameStore.getState();
      selectSquare('e2');
      
      const state = useGameStore.getState();
      expect(state.selectedSquare).toBe('e2');
      expect(state.validMoves.length).toBeGreaterThan(0);
    });

    it('should deselect when clicking the same square', () => {
      const store = useGameStore.getState();
      // Ensure clean state
      store.selectedSquare = null;
      store.validMoves = [];
      
      const { selectSquare } = useGameStore.getState();
      selectSquare('e2');
      
      // Verify selection
      let state = useGameStore.getState();
      expect(state.selectedSquare).toBe('e2');
      
      // Click again to deselect
      selectSquare('e2');
      
      state = useGameStore.getState();
      expect(state.selectedSquare).toBeNull();
      expect(state.validMoves).toHaveLength(0);
    });

    it('should make a move when selecting destination after selecting piece', () => {
      const store = useGameStore.getState();
      // Ensure clean state
      store.selectedSquare = null;
      store.validMoves = [];
      
      const { selectSquare } = useGameStore.getState();
      selectSquare('e2'); // Select pawn
      
      // Verify selection
      let state = useGameStore.getState();
      expect(state.selectedSquare).toBe('e2');
      
      const move = selectSquare('e4'); // Move to e4
      
      expect(move).toBeTruthy();
      state = useGameStore.getState();
      expect(state.selectedSquare).toBeNull();
      expect(state.validMoves).toHaveLength(0);
      expect(state.moveHistory.length).toBeGreaterThan(0);
    });

    it('should clear selection on invalid destination', () => {
      const { selectSquare } = useGameStore.getState();
      selectSquare('e2'); // Select pawn
      selectSquare('h8'); // Invalid move
      
      const state = useGameStore.getState();
      expect(state.selectedSquare).toBeNull();
      expect(state.validMoves).toHaveLength(0);
    });

    it('should not allow selection when game is over', () => {
      const store = useGameStore.getState();
      store.gameOver = true;
      
      const { selectSquare } = useGameStore.getState();
      selectSquare('e2');
      
      const state = useGameStore.getState();
      expect(state.selectedSquare).toBeNull();
    });

    it('should not allow selection when not player turn', () => {
      const store = useGameStore.getState();
      store.currentTurn = 'b'; // Black's turn, but player is white
      
      const { selectSquare } = useGameStore.getState();
      selectSquare('e2');
      
      const state = useGameStore.getState();
      expect(state.selectedSquare).toBeNull();
    });

    it('should calculate valid moves for selected piece', () => {
      const { selectSquare } = useGameStore.getState();
      selectSquare('e2');
      
      const state = useGameStore.getState();
      expect(state.validMoves).toContain('e3');
      expect(state.validMoves).toContain('e4');
    });

    it('should clear selection after making a move', () => {
      const { makeMove } = useGameStore.getState();
      const store = useGameStore.getState();
      store.selectedSquare = 'e2';
      store.validMoves = ['e3', 'e4'];
      
      makeMove('e2', 'e4');
      
      const state = useGameStore.getState();
      expect(state.selectedSquare).toBeNull();
      expect(state.validMoves).toHaveLength(0);
    });
  });

  describe('clearSelection', () => {
    it('should clear selected square and valid moves', () => {
      const { selectSquare, clearSelection } = useGameStore.getState();
      const store = useGameStore.getState();
      store.playerColor = 'white';
      store.currentTurn = 'w';
      
      selectSquare('e2');
      clearSelection();
      
      const state = useGameStore.getState();
      expect(state.selectedSquare).toBeNull();
      expect(state.validMoves).toHaveLength(0);
    });
  });
});
