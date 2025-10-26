import { create } from 'zustand';
import { Chess } from 'chess.js';
import { gameHistoryAPI } from '../services/api';

// Helper function to calculate captured pieces from move history
const calculateCapturedPieces = (history) => {
  const capturedPieces = { white: [], black: [] };
  history.forEach((move) => {
    if (move.captured) {
      const capturedBy = move.color === 'w' ? 'white' : 'black';
      capturedPieces[capturedBy].push(move.captured);
    }
  });
  return capturedPieces;
};

const useGameStore = create((set, get) => ({
  // Game state
  chess: new Chess(),
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  gameOver: false,
  winner: null,
  gameSaved: false,
  
  // Player state
  roomId: null,
  playerId: null,
  playerColor: null,
  currentTurn: 'w',
  
  // Connection state
  connected: false,
  
  // Bot game state
  isBotGame: false,
  botDifficulty: 'medium',
  
  // Game info
  gameStatus: 'waiting', // 'waiting', 'playing', 'finished'
  players: {
    white: null,
    black: null,
  },
  playerData: {}, // Store full player data with user IDs
  
  // Move history
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  
  // Selection state for tap-to-move
  selectedSquare: null,
  validMoves: [],
  
  // Actions
  setRoomId: (roomId) => set({ roomId }),
  
  setPlayerId: (playerId) => set({ playerId }),
  
  setPlayerColor: (color) => set({ playerColor: color }),
  
  setConnected: (connected) => set({ connected }),
  
  setGameStatus: (status) => set({ gameStatus: status }),
  
  setPlayers: (players) => set({ players }),
  
  setIsBotGame: (isBotGame) => set({ isBotGame }),
  
  setBotDifficulty: (difficulty) => set({ botDifficulty: difficulty }),
  
  // Tap-to-move actions
  selectSquare: (square) => {
    const { chess, selectedSquare, playerColor, currentTurn, gameOver, makeMove } = get();
    
    // Don't allow selection if game is over
    if (gameOver) {
      return;
    }
    
    // Check if it's the player's turn
    const playerTurn = playerColor === 'white' ? 'w' : 'b';
    if (currentTurn !== playerTurn) {
      return;
    }
    
    // If clicking the same square, deselect
    if (selectedSquare === square) {
      set({ selectedSquare: null, validMoves: [] });
      return;
    }
    
    // Get the piece at the clicked square
    const piece = chess.get(square);
    
    // If there's no piece, or it's not the player's piece
    if (!piece || piece.color !== playerTurn) {
      // If a square was previously selected, this might be a move
      if (selectedSquare) {
        // Try to make the move
        const move = makeMove(selectedSquare, square);
        if (move) {
          // Move was successful, clear selection
          set({ selectedSquare: null, validMoves: [] });
          return move;
        }
      }
      // Invalid square clicked, clear selection
      set({ selectedSquare: null, validMoves: [] });
      return;
    }
    
    // Select the square and calculate valid moves
    const moves = chess.moves({ square, verbose: true });
    const validMoves = moves.map(m => m.to);
    
    set({ 
      selectedSquare: square,
      validMoves 
    });
  },
  
  clearSelection: () => {
    set({ selectedSquare: null, validMoves: [] });
  },
  
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
    
    // Update move history and calculate captured pieces
    const history = chess.history({ verbose: true });
    const capturedPieces = calculateCapturedPieces(history);
    
    // Store full player data for saving games
    const playerData = gameState.playerData || {};
    
    set({
      fen: gameState.fen,
      currentTurn: gameState.turn,
      gameOver: gameState.isGameOver,
      winner,
      players: gameState.players || get().players,
      playerData, // Store the full player data with user IDs
      moveHistory: history,
      capturedPieces,
      isBotGame: gameState.isBotGame || get().isBotGame,
      botDifficulty: gameState.botDifficulty || get().botDifficulty,
      selectedSquare: null, // Clear selection on update
      validMoves: [],
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
        // Update move history and calculate captured pieces
        const history = chess.history({ verbose: true });
        const capturedPieces = calculateCapturedPieces(history);
        
        // Update local state optimistically
        set({
          fen: chess.fen(),
          currentTurn: chess.turn(),
          moveHistory: history,
          capturedPieces,
          selectedSquare: null, // Clear selection after move
          validMoves: [],
        });
        
        return move;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    
    return null;
  },
  
  saveGameToBackend: async () => {
    const state = get();
    
    // Check if game is over and not already saved
    if (!state.gameOver || state.gameSaved) {
      return { success: false, error: 'Game not over or already saved' };
    }
    
    // Get user IDs from playerData
    const whiteUserId = state.playerData?.white?.userId;
    const blackUserId = state.playerData?.black?.userId;
    
    // Both players must be authenticated to save
    if (!whiteUserId || !blackUserId) {
      console.log('Cannot save game: one or both players are not authenticated');
      return { success: false, error: 'Both players must be logged in to save game' };
    }
    
    try {
      // Determine the result type
      let result = 'checkmate';
      if (state.chess.isStalemate()) {
        result = 'stalemate';
      } else if (state.chess.isDraw()) {
        result = 'draw';
      }
      
      const gameData = {
        roomId: state.roomId,
        blackPlayerId: blackUserId,
        winner: state.winner,
        pgn: state.chess.pgn(),
        fen: state.fen,
        moveHistory: state.moveHistory,
        result,
      };
      
      await gameHistoryAPI.saveGame(gameData);
      set({ gameSaved: true });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save game:', error);
      return { success: false, error: error.message };
    }
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
      gameSaved: false,
      selectedSquare: null, // Clear selection on reset
      validMoves: [],
    });
  },
}));

export default useGameStore;
