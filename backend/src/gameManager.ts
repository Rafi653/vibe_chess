import { Chess } from 'chess.js'
import { BotDifficulty } from './botPlayer'

interface GameState {
  chess: Chess
  players: {
    white?: {
      socketId: string
      userId?: string
      isBot?: boolean
    }
    black?: {
      socketId: string
      userId?: string
      isBot?: boolean
    }
  }
  createdAt: Date
  isBotGame?: boolean
  botDifficulty?: BotDifficulty
  botMoveTimeout?: NodeJS.Timeout
}

class GameManager {
  private games: Map<string, GameState>

  constructor() {
    this.games = new Map()
  }

  /**
   * Create a new game for a room
   */
  createGame(roomId: string, isBotGame?: boolean, botDifficulty?: BotDifficulty): void {
    if (!this.games.has(roomId)) {
      this.games.set(roomId, {
        chess: new Chess(),
        players: {},
        createdAt: new Date(),
        isBotGame: isBotGame || false,
        botDifficulty: botDifficulty || BotDifficulty.MEDIUM
      })
      console.log(`[GameManager] Created new game for room: ${roomId}${isBotGame ? ' (vs Bot)' : ''}`)
    }
  }

  /**
   * Add a player to a room
   */
  addPlayer(roomId: string, playerId: string, userId?: string, isBot?: boolean): { color: 'white' | 'black' | null } {
    const game = this.games.get(roomId)
    if (!game) {
      return { color: null }
    }

    // Assign player to first available color
    if (!game.players.white) {
      game.players.white = { socketId: playerId, userId, isBot }
      console.log(`[GameManager] Player ${playerId} (user: ${userId}${isBot ? ' - BOT' : ''}) assigned as white in room ${roomId}`)
      return { color: 'white' }
    } else if (!game.players.black) {
      game.players.black = { socketId: playerId, userId, isBot }
      console.log(`[GameManager] Player ${playerId} (user: ${userId}${isBot ? ' - BOT' : ''}) assigned as black in room ${roomId}`)
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
    const playerColor = game.players.white?.socketId === playerId ? 'white' : 
                       game.players.black?.socketId === playerId ? 'black' : null

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
      players: {
        white: game.players.white?.socketId,
        black: game.players.black?.socketId,
      },
      playerData: game.players,
      isBotGame: game.isBotGame,
      botDifficulty: game.botDifficulty
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
    // Clear any pending bot move timeout before removing the game
    this.clearBotMoveTimeout(roomId)
    
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

    if (game.players.white?.socketId === playerId) {
      delete game.players.white
      console.log(`[GameManager] Removed white player ${playerId} from room ${roomId}`)
    }
    if (game.players.black?.socketId === playerId) {
      delete game.players.black
      console.log(`[GameManager] Removed black player ${playerId} from room ${roomId}`)
    }
  }

  /**
   * Check if a game is a bot game
   */
  isBotGame(roomId: string): boolean {
    const game = this.games.get(roomId)
    return game?.isBotGame || false
  }

  /**
   * Get bot difficulty for a game
   */
  getBotDifficulty(roomId: string): BotDifficulty | undefined {
    const game = this.games.get(roomId)
    return game?.botDifficulty
  }

  /**
   * Get the Chess instance for a room (for bot move calculation)
   */
  getChessInstance(roomId: string): Chess | null {
    const game = this.games.get(roomId)
    return game?.chess || null
  }

  /**
   * Set bot move timeout for a game
   */
  setBotMoveTimeout(roomId: string, timeout: NodeJS.Timeout): void {
    const game = this.games.get(roomId)
    if (game) {
      // Clear any existing timeout first
      if (game.botMoveTimeout) {
        clearTimeout(game.botMoveTimeout)
      }
      game.botMoveTimeout = timeout
    }
  }

  /**
   * Clear bot move timeout for a game
   */
  clearBotMoveTimeout(roomId: string): void {
    const game = this.games.get(roomId)
    if (game?.botMoveTimeout) {
      clearTimeout(game.botMoveTimeout)
      game.botMoveTimeout = undefined
    }
  }

  /**
   * Check if a game has a pending bot move timeout
   */
  hasPendingBotMove(roomId: string): boolean {
    const game = this.games.get(roomId)
    return !!game?.botMoveTimeout
  }
}

// Export a singleton instance
export const gameManager = new GameManager()
