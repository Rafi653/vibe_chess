import { Chess } from 'chess.js'

interface GameState {
  chess: Chess
  players: {
    white?: string
    black?: string
  }
  createdAt: Date
}

class GameManager {
  private games: Map<string, GameState>

  constructor() {
    this.games = new Map()
  }

  /**
   * Create a new game for a room
   */
  createGame(roomId: string): void {
    if (!this.games.has(roomId)) {
      this.games.set(roomId, {
        chess: new Chess(),
        players: {},
        createdAt: new Date()
      })
      console.log(`[GameManager] Created new game for room: ${roomId}`)
    }
  }

  /**
   * Add a player to a room
   */
  addPlayer(roomId: string, playerId: string): { color: 'white' | 'black' | null } {
    const game = this.games.get(roomId)
    if (!game) {
      return { color: null }
    }

    // Assign player to first available color
    if (!game.players.white) {
      game.players.white = playerId
      console.log(`[GameManager] Player ${playerId} assigned as white in room ${roomId}`)
      return { color: 'white' }
    } else if (!game.players.black) {
      game.players.black = playerId
      console.log(`[GameManager] Player ${playerId} assigned as black in room ${roomId}`)
      return { color: 'black' }
    }

    console.log(`[GameManager] Room ${roomId} is full, player ${playerId} is spectator`)
    return { color: null }
  }

  /**
   * Make a move in the game
   */
  makeMove(roomId: string, playerId: string, move: { from: string; to: string; promotion?: string }): {
    success: boolean
    error?: string
    gameState?: any
  } {
    const game = this.games.get(roomId)
    if (!game) {
      return { success: false, error: 'Game not found' }
    }

    // Check if it's the player's turn
    const currentTurn = game.chess.turn()
    const playerColor = game.players.white === playerId ? 'white' : 
                       game.players.black === playerId ? 'black' : null

    if (!playerColor) {
      return { success: false, error: 'Player not in this game' }
    }

    const playerTurn = playerColor === 'white' ? 'w' : 'b'
    if (currentTurn !== playerTurn) {
      return { success: false, error: 'Not your turn' }
    }

    try {
      // Attempt to make the move
      const result = game.chess.move(move)
      if (!result) {
        return { success: false, error: 'Invalid move' }
      }

      console.log(`[GameManager] Move made in room ${roomId}: ${move.from} to ${move.to}`)

      return {
        success: true,
        gameState: this.getState(roomId)
      }
    } catch (error) {
      return { success: false, error: 'Invalid move' }
    }
  }

  /**
   * Get the current state of a game
   */
  getState(roomId: string): any {
    const game = this.games.get(roomId)
    if (!game) {
      return null
    }

    return {
      fen: game.chess.fen(),
      pgn: game.chess.pgn(),
      turn: game.chess.turn(),
      isGameOver: game.chess.isGameOver(),
      isCheckmate: game.chess.isCheckmate(),
      isCheck: game.chess.isCheck(),
      isDraw: game.chess.isDraw(),
      isStalemate: game.chess.isStalemate(),
      isThreefoldRepetition: game.chess.isThreefoldRepetition(),
      isInsufficientMaterial: game.chess.isInsufficientMaterial(),
      moves: game.chess.moves(),
      history: game.chess.history(),
      players: game.players
    }
  }

  /**
   * Reset a game to initial position
   */
  resetGame(roomId: string): boolean {
    const game = this.games.get(roomId)
    if (!game) {
      return false
    }

    game.chess.reset()
    console.log(`[GameManager] Game reset for room: ${roomId}`)
    return true
  }

  /**
   * Remove a game
   */
  removeGame(roomId: string): boolean {
    const deleted = this.games.delete(roomId)
    if (deleted) {
      console.log(`[GameManager] Removed game for room: ${roomId}`)
    }
    return deleted
  }

  /**
   * Check if a game exists
   */
  hasGame(roomId: string): boolean {
    return this.games.has(roomId)
  }

  /**
   * Remove a player from a game
   */
  removePlayer(roomId: string, playerId: string): void {
    const game = this.games.get(roomId)
    if (!game) {
      return
    }

    if (game.players.white === playerId) {
      delete game.players.white
      console.log(`[GameManager] Removed white player ${playerId} from room ${roomId}`)
    }
    if (game.players.black === playerId) {
      delete game.players.black
      console.log(`[GameManager] Removed black player ${playerId} from room ${roomId}`)
    }
  }
}

// Export a singleton instance
export const gameManager = new GameManager()
