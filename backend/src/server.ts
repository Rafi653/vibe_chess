import express, { Request, Response } from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { gameManager } from './gameManager'
import { connectDatabase } from './config/database'
import authRoutes from './routes/auth'
import gameHistoryRoutes from './routes/gameHistory'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to database
connectDatabase()

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// API routes
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ 
    message: 'Vibe Chess Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// Auth and user routes
app.use('/api/auth', authRoutes)

// Game history routes
app.use('/api/games', gameHistoryRoutes)

// Room management routes
app.post('/create-room', (req: Request, res: Response) => {
  const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  console.log(`[POST /create-room] Creating room: ${roomId}`)
  
  res.json({ 
    success: true,
    roomId,
    message: 'Room created successfully',
    timestamp: new Date().toISOString()
  })
})

app.post('/join-room', (req: Request, res: Response) => {
  const { roomId, playerId } = req.body
  
  if (!roomId) {
    return res.status(400).json({ 
      success: false,
      error: 'roomId is required' 
    })
  }
  
  console.log(`[POST /join-room] Player ${playerId || 'anonymous'} joining room: ${roomId}`)
  
  res.json({ 
    success: true,
    roomId,
    playerId: playerId || `player-${Math.random().toString(36).substr(2, 9)}`,
    message: 'Joined room successfully',
    timestamp: new Date().toISOString()
  })
})

// Create HTTP server
const server = http.createServer(app)

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client connected: ${socket.id}`)
  
  // Send welcome message
  socket.emit('welcome', { 
    message: 'Connected to Vibe Chess WebSocket server',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  })

  // Join room event
  socket.on('joinRoom', ({ roomId, playerId, userId }) => {
    if (!roomId) {
      socket.emit('error', { message: 'Room ID is required' })
      return
    }

    // Join the socket room
    socket.join(roomId)
    console.log(`[Socket.IO] Player ${playerId || socket.id} (user: ${userId}) joined room: ${roomId}`)

    // Create game if it doesn't exist
    if (!gameManager.hasGame(roomId)) {
      gameManager.createGame(roomId)
    }

    // Add player to the game with user ID
    const result = gameManager.addPlayer(roomId, playerId || socket.id, userId)
    const gameState = gameManager.getState(roomId)

    // Notify the player
    socket.emit('joinedRoom', {
      roomId,
      playerId: playerId || socket.id,
      color: result.color,
      gameState,
      timestamp: new Date().toISOString()
    })

    // Notify other players in the room
    socket.to(roomId).emit('playerJoined', {
      playerId: playerId || socket.id,
      color: result.color,
      gameState,
      timestamp: new Date().toISOString()
    })
  })

  // Move event
  socket.on('move', ({ roomId, playerId, move }) => {
    if (!roomId || !move) {
      socket.emit('error', { message: 'Room ID and move are required' })
      return
    }

    const result = gameManager.makeMove(roomId, playerId || socket.id, move)

    if (result.success) {
      // Broadcast the move to all players in the room
      io.to(roomId).emit('moveMade', {
        playerId: playerId || socket.id,
        move,
        gameState: result.gameState,
        timestamp: new Date().toISOString()
      })
    } else {
      // Send error back to the player
      socket.emit('moveError', {
        error: result.error,
        timestamp: new Date().toISOString()
      })
    }
  })

  // Reset game event
  socket.on('reset', ({ roomId }) => {
    if (!roomId) {
      socket.emit('error', { message: 'Room ID is required' })
      return
    }

    const success = gameManager.resetGame(roomId)
    
    if (success) {
      const gameState = gameManager.getState(roomId)
      
      // Broadcast reset to all players in the room
      io.to(roomId).emit('gameReset', {
        gameState,
        timestamp: new Date().toISOString()
      })
    } else {
      socket.emit('error', { message: 'Game not found' })
    }
  })

  // Disconnect event
  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`)
    
    // Note: In a production app, you'd want to track which rooms the socket was in
    // and clean up appropriately. For now, we'll leave games in memory.
  })
  
  // Legacy message handler for backward compatibility
  socket.on('message', (data) => {
    console.log(`[Socket.IO] Message from ${socket.id}:`, data)
    socket.emit('message', { 
      type: 'echo',
      data,
      timestamp: new Date().toISOString()
    })
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
