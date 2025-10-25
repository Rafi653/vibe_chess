# Bug Report & Issues Tracker

## Overview
This document tracks bugs discovered during comprehensive testing of the Vibe Chess application. Each bug includes severity, reproduction steps, expected behavior, actual behavior, and proposed fixes.

---

## Bug #1: Move History Lost on Game State Reload

**Severity:** 🟡 Medium  
**Status:** Confirmed  
**Discovered:** During frontend state management testing  
**Affects:** Frontend - Game reconnection and state restoration

### Description
When a game state is loaded from FEN notation (e.g., after reconnection or loading a saved game), the move history is lost because `chess.history()` only returns moves from the current position, not the full game history.

### Steps to Reproduce
1. Start a new game and make several moves (e.g., e4, e5, Nf3, Nc6)
2. Disconnect from the game
3. Reconnect to the same room
4. Observe the move history panel

### Expected Behavior
Move history should display all previous moves: 1. e4 e5, 2. Nf3 Nc6

### Actual Behavior
Move history panel is empty or shows no moves

### Root Cause
File: `frontend/src/store/gameStore.js`, function: `updateGameState()`

```javascript
// Current implementation
updateGameState: (gameState) => {
  const { chess } = get();
  chess.load(gameState.fen);  // This loads position but not move history
  const history = chess.history({ verbose: true });  // Returns empty for FEN-loaded position
  // ...
}
```

### Proposed Fix
Store and transmit move history separately from FEN:

```javascript
// Backend - gameManager.ts
getState(roomId: string): any {
  const game = this.games.get(roomId);
  if (!game) return null;
  
  return {
    fen: game.chess.fen(),
    pgn: game.chess.pgn(),
    moveHistory: game.chess.history({ verbose: true }),  // Add this
    // ... rest of state
  };
}

// Frontend - gameStore.js
updateGameState: (gameState) => {
  const { chess } = get();
  chess.load(gameState.fen);
  
  // Use move history from server if available, otherwise compute from position
  const history = gameState.moveHistory || chess.history({ verbose: true });
  const capturedPieces = calculateCapturedPieces(history);
  
  set({
    // ...
    moveHistory: history,
    capturedPieces,
  });
}
```

### Impact
- Users lose context of how the game progressed
- Captured pieces calculation may be inaccurate
- Replay functionality would not work properly

### Priority
Medium - Affects user experience but doesn't break core gameplay

---

## Bug #2: No Game Cleanup on Player Disconnect

**Severity:** 🟡 Medium  
**Status:** Confirmed  
**Discovered:** During Socket.IO integration testing  
**Affects:** Backend - Memory management

### Description
Games remain in memory indefinitely after players disconnect. This leads to memory leaks in long-running servers.

### Steps to Reproduce
1. Create a game room
2. Join with two players
3. Both players disconnect
4. Check server memory - game is still stored

### Expected Behavior
Games should be cleaned up after a timeout period (e.g., 30 minutes) of inactivity

### Actual Behavior
Games persist in memory until server restart

### Root Cause
File: `backend/src/server.ts`, Socket.IO disconnect handler

```javascript
socket.on('disconnect', (reason) => {
  console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  // Note: No cleanup performed
});
```

### Proposed Fix
Implement timeout-based cleanup:

```typescript
// Add to gameManager.ts
private gameTimeouts: Map<string, NodeJS.Timeout> = new Map();

scheduleGameCleanup(roomId: string, timeoutMinutes: number = 30): void {
  // Clear existing timeout
  if (this.gameTimeouts.has(roomId)) {
    clearTimeout(this.gameTimeouts.get(roomId)!);
  }
  
  // Schedule new cleanup
  const timeout = setTimeout(() => {
    this.removeGame(roomId);
    this.gameTimeouts.delete(roomId);
    console.log(`[GameManager] Cleaned up inactive game: ${roomId}`);
  }, timeoutMinutes * 60 * 1000);
  
  this.gameTimeouts.set(roomId, timeout);
}

// In server.ts
socket.on('disconnect', (reason) => {
  console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  
  // Track room membership and schedule cleanup if room is empty
  // Implementation depends on tracking which rooms a socket is in
});
```

### Impact
- Memory leaks in production
- Server performance degrades over time
- Potential out-of-memory errors with many abandoned games

### Priority
Medium - Important for production stability

---

## Bug #3: Weak JWT Secret Fallback

**Severity:** 🟡 Medium (Security)  
**Status:** Confirmed  
**Discovered:** During code review of auth routes  
**Affects:** Backend - Authentication security

### Description
JWT secret has a fallback value, allowing the application to start with a known/weak secret.

### Location
File: `backend/src/routes/auth.ts`, lines 45 and 92

```typescript
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
```

### Expected Behavior
Application should fail to start if JWT_SECRET is not set in production

### Actual Behavior
Application starts with default weak secret

### Proposed Fix
```typescript
// Add validation in server startup
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET environment variable is required in production');
  process.exit(1);
}

// Or use in auth routes
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET not configured');
}
```

### Impact
- Security vulnerability: Known secret can be exploited
- Tokens from dev/staging could work in production
- Easier for attackers to forge tokens

### Priority
High - Security issue for production deployment

---

## Bug #4: Unlimited Room Creation/Joining

**Severity:** 🟢 Low  
**Status:** Confirmed  
**Discovered:** During API testing  
**Affects:** Backend - Resource management

### Description
No rate limiting on room creation or joining endpoints allows potential abuse.

### Steps to Reproduce
1. Write a script to rapidly create rooms via POST /create-room
2. Observe unlimited rooms being created
3. Check server memory usage

### Expected Behavior
Rate limiting should prevent abuse (e.g., max 10 rooms per IP per hour)

### Actual Behavior
Unlimited room creation allowed

### Proposed Fix
Add rate limiting middleware:

```typescript
import rateLimit from 'express-rate-limit';

const roomCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many rooms created, please try again later',
});

app.post('/create-room', roomCreationLimiter, (req, res) => {
  // ... existing code
});
```

### Impact
- Potential DoS attack vector
- Memory exhaustion possible
- Server resources can be abused

### Priority
Low-Medium - Important for public deployment

---

## Bug #5: Missing CORS Configuration for Production

**Severity:** 🟡 Medium (Security)  
**Status:** Confirmed  
**Discovered:** During security review  
**Affects:** Backend - API security

### Description
CORS is configured to allow all origins (`origin: "*"`), which is insecure for production.

### Location
Files: `backend/src/server.ts`, Socket.IO configuration

```typescript
// Express CORS
app.use(cors());

// Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
```

### Expected Behavior
Only whitelisted origins should be allowed in production

### Actual Behavior
All origins can access the API

### Proposed Fix
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### Impact
- CSRF vulnerability
- Unauthorized access from any domain
- Potential data exposure

### Priority
Medium - Required for production security

---

## Bug #6: No Error Handling for Database Connection Failures

**Severity:** 🟡 Medium  
**Status:** Confirmed  
**Discovered:** During error handling review  
**Affects:** Backend - Reliability

### Description
If database connection fails, the application continues to run without a working database.

### Location
File: `backend/src/config/database.ts`

### Expected Behavior
Application should exit or enter maintenance mode if database is unavailable

### Actual Behavior
Application runs but auth/game saving fails silently

### Proposed Fix
```typescript
export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: Cannot start without database');
      process.exit(1);
    }
  }
  
  // Handle connection errors after initial connection
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  });
};
```

### Impact
- Confusing user experience (auth appears to work but doesn't)
- Data loss (games not saved)
- Hard to debug issues

### Priority
Medium - Affects reliability

---

## Bug #7: Client-Side Turn Validation Only

**Severity:** 🟢 Low  
**Status:** By Design (Not a bug, but worth noting)  
**Discovered:** During gameStore testing  
**Affects:** Frontend - Move validation

### Description
Turn validation happens on client side before sending to server. While server also validates, client feedback is immediate.

### Location
File: `frontend/src/store/gameStore.js`, `makeMove` function

```javascript
// Check if it's the player's turn
const playerTurn = playerColor === 'white' ? 'w' : 'b';
if (currentTurn !== playerTurn) {
  return null;
}
```

### Observation
This is actually good design - client-side validation provides instant feedback, and server-side validation ensures security.

### Recommendation
Consider adding visual feedback when it's not the player's turn (e.g., disable piece dragging, show "Waiting for opponent" message).

---

## Minor Issues & Enhancements

### Enhancement #1: Verbose Console Logging
**Impact:** Low  
**Recommendation:** Implement log levels and disable debug logs in production

### Enhancement #2: Generic Error Messages
**Impact:** Low  
**Recommendation:** Provide more specific error messages for better debugging

### Enhancement #3: No Loading Indicators
**Impact:** Low  
**Recommendation:** Add loading states for async operations (game saving, API calls)

### Enhancement #4: Missing Input Validation
**Impact:** Low-Medium  
**Recommendation:** Add comprehensive input sanitization for all user inputs

---

## Summary Statistics

- **Total Bugs Identified:** 7
- **Critical:** 0
- **High:** 0
- **Medium:** 6
- **Low:** 1

**By Category:**
- Security: 3 issues
- Memory/Resource Management: 2 issues
- UX/Data Persistence: 1 issue
- Reliability: 1 issue

**Resolution Status:**
- Fixed: 0
- Confirmed & Documented: 7
- Under Investigation: 0

---

## Testing Methodology

Bugs were discovered through:
1. **Unit Testing** - 33 tests for game logic
2. **Integration Testing** - 8 tests for Socket.IO
3. **Component Testing** - 29 tests for React components
4. **Code Review** - Manual inspection of critical paths
5. **Security Review** - Analysis of auth and CORS configurations

---

**Last Updated:** 2025-10-25  
**Next Review:** After implementing fixes
