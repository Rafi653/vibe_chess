import { create } from 'zustand';
import { Chess } from 'chess.js';

const useGameStore = create((set, get) => ({
  // Game state
  chess: new Chess(),
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  gameOver: false,
  winner: null,
  
  // Player state
  roomId: null,
  playerId: null,
  playerColor: null,
  currentTurn: 'w',
  
  // Connection state
  connected: false,
  
  // Game info
  gameStatus: 'waiting', // 'waiting', 'playing', 'finished'
  players: {
    white: null,
    black: null,
  },
  
  // Move history
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  
  // Actions
  setRoomId: (roomId) => set({ roomId }),
  
  setPlayerId: (playerId) => set({ playerId }),
  
  setPlayerColor: (color) => set({ playerColor: color }),
  
  setConnected: (connected) => set({ connected }),
  
  setGameStatus: (status) => set({ gameStatus: status }),
  
  setPlayers: (players) => set({ players }),
  
  updateGameState: (gameState) => {
    const { chess } = get();
    
    // Load the new position
    chess.load(gameState.fen);
    
    // Determine winner: if game is over and it's checkmate,
    // the player whose turn it is has lost (they can't move)
    let winner = null;
    if (gameState.isCheckmate) {
      winner = gameState.turn === 'w' ? 'black' : 'white';
    }
    
    // Update move history
    const history = chess.history({ verbose: true });
    
    // Calculate captured pieces
    const capturedPieces = { white: [], black: [] };
    history.forEach((move) => {
      if (move.captured) {
        const capturedBy = move.color === 'w' ? 'white' : 'black';
        capturedPieces[capturedBy].push(move.captured);
      }
    });
    
    set({
      fen: gameState.fen,
      currentTurn: gameState.turn,
      gameOver: gameState.isGameOver,
      winner,
      players: gameState.players || get().players,
      moveHistory: history,
      capturedPieces,
    });
    
    // Update game status
    if (gameState.isGameOver) {
      set({ gameStatus: 'finished' });
    } else if (gameState.players?.white && gameState.players?.black) {
      set({ gameStatus: 'playing' });
    }
  },
  
  makeMove: (from, to, promotion) => {
    const { chess, playerId, playerColor, currentTurn } = get();
    
    // Check if it's the player's turn
    const playerTurn = playerColor === 'white' ? 'w' : 'b';
    if (currentTurn !== playerTurn) {
      return null;
    }
    
    // Try to make the move locally first
    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion || 'q',
      });
      
      if (move) {
        // Update move history
        const history = chess.history({ verbose: true });
        
        // Calculate captured pieces
        const capturedPieces = { white: [], black: [] };
        history.forEach((m) => {
          if (m.captured) {
            const capturedBy = m.color === 'w' ? 'white' : 'black';
            capturedPieces[capturedBy].push(m.captured);
          }
        });
        
        // Update local state optimistically
        set({
          fen: chess.fen(),
          currentTurn: chess.turn(),
          moveHistory: history,
          capturedPieces,
        });
        
        return move;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    
    return null;
  },
  
  resetGame: () => {
    const chess = new Chess();
    set({
      chess,
      fen: chess.fen(),
      gameOver: false,
      winner: null,
      currentTurn: 'w',
      gameStatus: get().players.white && get().players.black ? 'playing' : 'waiting',
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
    });
  },
}));

export default useGameStore;
