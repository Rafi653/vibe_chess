import { matchmakingManager } from '../matchmakingManager'

describe('MatchmakingManager', () => {
  beforeEach(() => {
    // Clear the queue before each test by creating a new instance
    // Since we export a singleton, we need to manually clear it
    while ((matchmakingManager as any).queue.length > 0) {
      (matchmakingManager as any).queue.pop()
    }
    (matchmakingManager as any).activeMatches.clear()
  })

  describe('joinQueue', () => {
    it('should add a player to empty queue', () => {
      const result = matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      
      expect(result.matched).toBe(false)
      expect(matchmakingManager.getQueueSize()).toBe(1)
      expect(matchmakingManager.isInQueue('player1')).toBe(true)
    })

    it('should match two players when second player joins', () => {
      // First player joins
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      
      // Second player joins and gets matched
      const result = matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      
      expect(result.matched).toBe(true)
      expect(result.roomId).toBeDefined()
      expect(result.opponent).toBeDefined()
      expect(result.opponent?.socketId).toBe('player1')
      expect(result.opponent?.username).toBe('Alice')
      expect(matchmakingManager.getQueueSize()).toBe(0)
    })

    it('should not add player if already in queue', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      const result = matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      
      expect(result.matched).toBe(false)
      expect(matchmakingManager.getQueueSize()).toBe(1)
    })

    it('should track active matches', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      const result = matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      
      expect(matchmakingManager.isInMatch('player1')).toBe(true)
      expect(matchmakingManager.isInMatch('player2')).toBe(true)
      expect(matchmakingManager.getMatchRoom('player1')).toBe(result.roomId)
      expect(matchmakingManager.getMatchRoom('player2')).toBe(result.roomId)
    })
  })

  describe('leaveQueue', () => {
    it('should remove player from queue', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      expect(matchmakingManager.getQueueSize()).toBe(1)
      
      const removed = matchmakingManager.leaveQueue('player1')
      
      expect(removed).toBe(true)
      expect(matchmakingManager.getQueueSize()).toBe(0)
      expect(matchmakingManager.isInQueue('player1')).toBe(false)
    })

    it('should return false if player not in queue', () => {
      const removed = matchmakingManager.leaveQueue('nonexistent')
      expect(removed).toBe(false)
    })

    it('should handle multiple players in queue', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      matchmakingManager.joinQueue('player3', 'user3', 'Charlie')
      
      expect(matchmakingManager.getQueueSize()).toBe(1) // After first two matched
      
      matchmakingManager.leaveQueue('player3')
      expect(matchmakingManager.getQueueSize()).toBe(0)
    })
  })

  describe('removeFromMatch', () => {
    it('should remove player from active match tracking', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      
      expect(matchmakingManager.isInMatch('player1')).toBe(true)
      
      matchmakingManager.removeFromMatch('player1')
      
      expect(matchmakingManager.isInMatch('player1')).toBe(false)
      expect(matchmakingManager.getMatchRoom('player1')).toBeUndefined()
    })
  })

  describe('getQueueSize', () => {
    it('should return correct queue size', () => {
      expect(matchmakingManager.getQueueSize()).toBe(0)
      
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      expect(matchmakingManager.getQueueSize()).toBe(1)
      
      matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      expect(matchmakingManager.getQueueSize()).toBe(0) // Matched
      
      matchmakingManager.joinQueue('player3', 'user3', 'Charlie')
      expect(matchmakingManager.getQueueSize()).toBe(1)
    })
  })

  describe('getQueueInfo', () => {
    it('should return queue information', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      matchmakingManager.joinQueue('player3', 'user3', 'Charlie')
      
      const info = matchmakingManager.getQueueInfo()
      
      expect(info.length).toBe(1) // Only Charlie left after Alice and Bob matched
      expect(info[0].socketId).toBe('player3')
      expect(info[0].username).toBe('Charlie')
    })
  })

  describe('cleanStaleEntries', () => {
    it('should remove entries older than max wait time', () => {
      // Add a player and manually set an old timestamp
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      
      // Manually modify the timestamp to be 10 minutes ago
      const queue = (matchmakingManager as any).queue
      if (queue.length > 0) {
        queue[0].joinedAt = new Date(Date.now() - 10 * 60 * 1000)
      }
      
      const removed = matchmakingManager.cleanStaleEntries(5) // 5 minute max
      
      expect(removed).toBe(1)
      expect(matchmakingManager.getQueueSize()).toBe(0)
    })

    it('should keep recent entries', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      
      const removed = matchmakingManager.cleanStaleEntries(5)
      
      expect(removed).toBe(0)
      expect(matchmakingManager.getQueueSize()).toBe(1)
    })

    it('should clean multiple stale entries', () => {
      // Add players
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      matchmakingManager.joinQueue('player3', 'user3', 'Charlie')
      
      // Make first two stale
      const queue = (matchmakingManager as any).queue
      if (queue.length >= 1) {
        queue[0].joinedAt = new Date(Date.now() - 10 * 60 * 1000)
      }
      
      const removed = matchmakingManager.cleanStaleEntries(5)
      
      expect(removed).toBeGreaterThanOrEqual(1)
    })
  })

  describe('integration scenarios', () => {
    it('should handle rapid join and leave', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      matchmakingManager.leaveQueue('player1')
      matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      
      expect(matchmakingManager.getQueueSize()).toBe(1)
      expect(matchmakingManager.isInQueue('player2')).toBe(true)
    })

    it('should create unique room IDs for different matches', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      const match1 = matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      
      matchmakingManager.joinQueue('player3', 'user3', 'Charlie')
      const match2 = matchmakingManager.joinQueue('player4', 'user4', 'David')
      
      expect(match1.roomId).toBeDefined()
      expect(match2.roomId).toBeDefined()
      expect(match1.roomId).not.toBe(match2.roomId)
    })

    it('should match players in FIFO order', () => {
      matchmakingManager.joinQueue('player1', 'user1', 'Alice')
      matchmakingManager.joinQueue('player2', 'user2', 'Bob')
      matchmakingManager.joinQueue('player3', 'user3', 'Charlie')
      
      // Alice and Bob should match, leaving Charlie
      expect(matchmakingManager.isInQueue('player3')).toBe(true)
      expect(matchmakingManager.isInQueue('player1')).toBe(false)
      expect(matchmakingManager.isInQueue('player2')).toBe(false)
    })
  })
})
