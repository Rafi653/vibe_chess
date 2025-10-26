/**
 * Matchmaking Manager
 * 
 * Handles pairing players who want to play against random opponents.
 * Players join a queue and are automatically matched with another waiting player.
 */

interface QueuedPlayer {
  socketId: string
  userId?: string
  username?: string
  joinedAt: Date
}

class MatchmakingManager {
  private queue: QueuedPlayer[]
  private activeMatches: Map<string, string> // socketId -> roomId

  constructor() {
    this.queue = []
    this.activeMatches = new Map()
  }

  /**
   * Add a player to the matchmaking queue
   * Returns match info if a match is found immediately
   */
  joinQueue(socketId: string, userId?: string, username?: string): {
    matched: boolean
    roomId?: string
    opponent?: QueuedPlayer
  } {
    // Check if player is already in queue
    if (this.isInQueue(socketId)) {
      console.log(`[Matchmaking] Player ${socketId} is already in queue`)
      return { matched: false }
    }

    // Check if there's a waiting player
    if (this.queue.length > 0) {
      // Match with the first player in queue
      const opponent = this.queue.shift()!
      
      // Create a unique room ID for this match
      const roomId = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Store the match
      this.activeMatches.set(socketId, roomId)
      this.activeMatches.set(opponent.socketId, roomId)
      
      console.log(`[Matchmaking] Matched ${socketId} with ${opponent.socketId} in room ${roomId}`)
      
      return {
        matched: true,
        roomId,
        opponent
      }
    }

    // No match found, add to queue
    const player: QueuedPlayer = {
      socketId,
      userId,
      username,
      joinedAt: new Date()
    }
    
    this.queue.push(player)
    console.log(`[Matchmaking] Player ${socketId} joined queue. Queue size: ${this.queue.length}`)
    
    return { matched: false }
  }

  /**
   * Remove a player from the matchmaking queue
   */
  leaveQueue(socketId: string): boolean {
    const initialLength = this.queue.length
    this.queue = this.queue.filter(p => p.socketId !== socketId)
    
    if (this.queue.length < initialLength) {
      console.log(`[Matchmaking] Player ${socketId} left queue. Queue size: ${this.queue.length}`)
      return true
    }
    
    return false
  }

  /**
   * Remove player from active match tracking
   */
  removeFromMatch(socketId: string): void {
    this.activeMatches.delete(socketId)
  }

  /**
   * Check if a player is in the queue
   */
  isInQueue(socketId: string): boolean {
    return this.queue.some(p => p.socketId === socketId)
  }

  /**
   * Check if a player is in an active match
   */
  isInMatch(socketId: string): boolean {
    return this.activeMatches.has(socketId)
  }

  /**
   * Get the room ID for a player's active match
   */
  getMatchRoom(socketId: string): string | undefined {
    return this.activeMatches.get(socketId)
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length
  }

  /**
   * Get queue information (for debugging/admin)
   */
  getQueueInfo(): QueuedPlayer[] {
    return [...this.queue]
  }

  /**
   * Clean up stale queue entries (players who waited too long)
   * Call this periodically to remove players who may have disconnected
   */
  cleanStaleEntries(maxWaitMinutes: number = 5): number {
    const now = new Date()
    const initialLength = this.queue.length
    
    this.queue = this.queue.filter(player => {
      const waitTime = (now.getTime() - player.joinedAt.getTime()) / 1000 / 60
      return waitTime < maxWaitMinutes
    })
    
    const removed = initialLength - this.queue.length
    if (removed > 0) {
      console.log(`[Matchmaking] Cleaned ${removed} stale entries from queue`)
    }
    
    return removed
  }
}

// Export singleton instance
export const matchmakingManager = new MatchmakingManager()
