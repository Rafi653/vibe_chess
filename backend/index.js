import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import http from 'http'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Vibe Chess Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// Create HTTP server
const server = http.createServer(app)

// WebSocket server setup
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected')
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString())
    ws.send(JSON.stringify({ 
      type: 'echo',
      data: message.toString(),
      timestamp: new Date().toISOString()
    }))
  })
  
  ws.on('close', () => {
    console.log('Client disconnected')
  })
  
  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'welcome',
    message: 'Connected to Vibe Chess WebSocket server'
  }))
})

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📡 WebSocket server ready`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
