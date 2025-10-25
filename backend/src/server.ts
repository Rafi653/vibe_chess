import express, { Request, Response } from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const PORT = process.env.PORT || 5000

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
  
  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`)
  })
  
  socket.on('message', (data) => {
    console.log(`[Socket.IO] Message from ${socket.id}:`, data)
    socket.emit('message', { 
      type: 'echo',
      data,
      timestamp: new Date().toISOString()
    })
  })
  
  // Send welcome message
  socket.emit('welcome', { 
    message: 'Connected to Vibe Chess WebSocket server',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
