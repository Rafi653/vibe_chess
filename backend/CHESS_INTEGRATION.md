# Chess Logic Integration

This document describes the chess game logic integration implemented using chess.js.

## Overview

The backend now includes a complete chess game engine that manages game state, validates moves, and enforces chess rules. Games are managed in-memory and connected via WebSocket events.

## Architecture

### Game Manager (`src/gameManager.ts`)

The `GameManager` class handles all chess logic:

- **In-memory storage**: Uses a Map to store active games by room ID
- **Chess.js integration**: Each game has a Chess instance from chess.js library
- **Player management**: Tracks white and black players per game

#### Key Methods:

- `createGame(roomId)`: Initialize a new chess game
- `addPlayer(roomId, playerId)`: Assign a player to white or black
- `makeMove(roomId, playerId, move)`: Validate and execute a move
- `getState(roomId)`: Get comprehensive game state
- `resetGame(roomId)`: Reset game to initial position
- `removePlayer(roomId, playerId)`: Remove a player from a game
- `hasGame(roomId)`: Check if a game exists
- `removeGame(roomId)`: Delete a game

### WebSocket Events (`src/server.ts`)

The server handles the following WebSocket events:

#### Client → Server Events:

1. **`joinRoom`**: Join a game room
   ```javascript
   socket.emit('joinRoom', { roomId, playerId })
   ```

2. **`move`**: Make a chess move
   ```javascript
   socket.emit('move', { 
     roomId, 
     playerId, 
     move: { from: 'e2', to: 'e4', promotion?: 'q' }
   })
   ```

3. **`reset`**: Reset the game
   ```javascript
   socket.emit('reset', { roomId })
   ```

#### Server → Client Events:

1. **`joinedRoom`**: Confirmation of joining
   ```javascript
   {
     roomId: string,
     playerId: string,
     color: 'white' | 'black' | null,
     gameState: GameState,
     timestamp: string
   }
   ```

2. **`playerJoined`**: Broadcast when another player joins
   ```javascript
   {
     playerId: string,
     color: 'white' | 'black' | null,
     gameState: GameState,
     timestamp: string
   }
   ```

3. **`moveMade`**: Broadcast when a move is made
   ```javascript
   {
     playerId: string,
     move: { from: string, to: string },
     gameState: GameState,
     timestamp: string
   }
   ```

4. **`moveError`**: Error when move is invalid
   ```javascript
   {
     error: string,
     timestamp: string
   }
   ```

5. **`gameReset`**: Broadcast when game is reset
   ```javascript
   {
     gameState: GameState,
     timestamp: string
   }
   ```

6. **`error`**: General error message
   ```javascript
   {
     message: string
   }
   ```

## Game State Structure

The `gameState` object returned by various events contains:

```javascript
{
  fen: string,                      // Board position in FEN notation
  pgn: string,                      // Game in PGN notation
  turn: 'w' | 'b',                  // Current turn
  isGameOver: boolean,              // Is the game over?
  isCheckmate: boolean,             // Is it checkmate?
  isCheck: boolean,                 // Is the king in check?
  isDraw: boolean,                  // Is it a draw?
  isStalemate: boolean,             // Is it stalemate?
  isThreefoldRepetition: boolean,   // Threefold repetition?
  isInsufficientMaterial: boolean,  // Insufficient material?
  moves: string[],                  // Array of legal moves
  history: string[],                // Move history
  players: {                        // Player assignments
    white?: string,
    black?: string
  }
}
```

## Features

### ✅ Implemented

- ✅ Valid move enforcement using chess.js rules
- ✅ Turn alternation (players can only move on their turn)
- ✅ Checkmate detection
- ✅ Check detection
- ✅ Draw conditions (stalemate, threefold repetition, insufficient material)
- ✅ Game reset functionality
- ✅ Real-time game state synchronization via WebSocket
- ✅ Player assignment (white/black)
- ✅ Spectator support (more than 2 players can join)

### 🚧 Future Enhancements

- Room cleanup on disconnect (currently games remain in memory)
- Persistent storage (database integration)
- Game history/replay functionality
- Time controls (chess clocks)
- Player authentication
- Matchmaking system
- ELO rating system

## Testing

To test the implementation manually:

1. Start the server:
   ```bash
   cd backend
   npm run dev
   ```

2. Connect two clients via WebSocket to `http://localhost:5000`

3. Both clients join the same room:
   ```javascript
   socket.emit('joinRoom', { roomId: 'test-room', playerId: 'player1' })
   ```

4. Make moves alternating between the two clients:
   ```javascript
   socket.emit('move', { 
     roomId: 'test-room', 
     playerId: 'player1', 
     move: { from: 'e2', to: 'e4' } 
   })
   ```

## Dependencies

- **chess.js** (^1.4.0): Chess logic and move validation
- **socket.io** (^4.8.1): WebSocket communication
- **express** (^4.21.2): HTTP server
- **cors** (^2.8.5): Cross-origin resource sharing

## Security

- All moves are validated server-side using chess.js
- Players can only move pieces of their assigned color
- Turn enforcement prevents out-of-turn moves
- No known vulnerabilities in dependencies (checked via GitHub Advisory Database)
- CodeQL security analysis passed with 0 alerts
