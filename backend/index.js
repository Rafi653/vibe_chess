import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// HTTP Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vibe Chess API is running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Vibe Chess API' });
});

// Create HTTP server
const server = createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    
    // Echo the message back (for testing)
    ws.send(JSON.stringify({
      type: 'echo',
      data: message.toString(),
      timestamp: new Date().toISOString()
    }));
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Vibe Chess WebSocket server',
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}/ws`);
});
