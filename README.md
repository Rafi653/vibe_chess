# Vibe Chess

A modern web-based chess application with user profiles, game tracking, and social features. Built with Node.js backend and React frontend.

## Features

### 🎮 Core Chess Gameplay
- Real-time multiplayer chess using WebSocket (Socket.IO)
- **Guest play mode - no account required to start playing!**
- **Single-player mode vs AI bot with difficulty levels (Easy, Medium, Hard)**
- **Supports multiple parallel bot sessions** - many users can play against bots simultaneously
- Drag-and-drop piece movement
- Move validation and game state management
- Check, checkmate, and stalemate detection
- Move history and captured pieces display

### 👤 User Profile System
- **Guest mode for quick play without registration**
- User registration and authentication (JWT-based)
- Customizable user profiles with avatars
- Personal statistics tracking:
  - Games played
  - Games won/lost/drawn
  - Win rate calculation
- Profile editing capabilities

### ♟️ Game History & Tracking
- Automatic game saving for authenticated users
- Complete game history with PGN notation
- Game replay functionality (view past games)
- Filter and pagination for game history
- Statistics dashboard showing:
  - Total games played
  - Win/loss/draw records
  - Recent games overview

### 🌐 Social Features
- Friend system with friend requests
- User search functionality
- Friends list management
- Friend request notifications
- Accept/decline friend requests
- View friend profiles and statistics

## Architecture

This project follows a client-server architecture:

- **Frontend**: React with Vite, Zustand for state management, TailwindCSS for styling
- **Backend**: Node.js with Express, TypeScript, Socket.IO for real-time communication
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing

## Project Structure

```plaintext
vibe_chess/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── chess/     # Chess-specific components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Lobby.jsx
│   │   │   ├── Game.jsx
│   │   │   ├── GameHistoryPage.jsx
│   │   │   ├── SavedGamesPage.jsx
│   │   │   └── Friends.jsx
│   │   ├── store/         # Zustand state management
│   │   │   ├── gameStore.js
│   │   │   └── userStore.js
│   │   ├── services/      # API service layer
│   │   │   └── api.js
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useSocket.js
│   │   └── App.jsx
│   └── package.json
├── backend/               # Node.js backend API
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── GameHistory.ts
│   │   │   └── Friendship.ts
│   │   ├── routes/        # API route handlers
│   │   │   ├── auth.ts
│   │   │   ├── gameHistory.ts
│   │   │   └── friends.ts
│   │   ├── middleware/    # Express middleware
│   │   │   └── auth.ts
│   │   ├── config/        # Configuration files
│   │   │   └── database.ts
│   │   ├── gameManager.ts # Game state management
│   │   └── server.ts      # Main server file
│   └── package.json
├── docker-compose.yml     # Docker orchestration
├── .gitignore
├── .prettierrc
├── .eslintrc
└── README.md
```

## Local Development Workflow

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- MongoDB (v4.4 or higher) or access to MongoDB Atlas
- Docker & Docker Compose (optional, for containerized development)

### Sharing Your Local App with Friends

Want to let friends play on your locally hosted chess app? Check out our [**Cloudflare Tunnel Guide**](CLOUDFLARE_TUNNEL.md) for step-by-step instructions on:
- 🌐 Making your local app accessible from anywhere
- 🔒 Secure sharing without port forwarding
- ⚙️ Configuration for both Docker and manual setups

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rafi653/vibe_chess.git
   cd vibe_chess
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file from example
   cp .env.example .env
   
   # Edit .env and configure:
   # - MONGODB_URI: Your MongoDB connection string
   # - JWT_SECRET: A secure random string for JWT signing
   # - PORT: Backend server port (default: 5000)
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # (Optional) Create .env file from example
   cp .env.example .env
   
   # The frontend will connect to http://localhost:5000 by default
   # To change this, set VITE_API_URL and VITE_SOCKET_URL in .env
   # For Cloudflare Tunnel setup, see CLOUDFLARE_TUNNEL.md
   ```

### Running the Application

#### Option 1: Using Docker Compose (Recommended)

```bash
# From the root directory
docker-compose up

# The application will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# MongoDB: mongodb://localhost:27017
```

#### Option 2: Running Manually

1. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud database
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm run dev
   # Backend runs on http://localhost:5000
   ```

3. **Start Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Code Quality

Configuration files for ESLint and Prettier are included:
- `.eslintrc` - Linting rules
- `.prettierrc` - Code formatting rules

> **Note**: Linting scripts can be added to package.json as needed. The configuration files are ready to use.

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `GET /api/auth/user/:userId` - Get public user profile

### Game History Endpoints

- `POST /api/games` - Save a completed game (requires auth)
- `GET /api/games` - Get user's game history (requires auth)
- `GET /api/games/:gameId` - Get specific game details (requires auth)
- `GET /api/games/stats/summary` - Get user statistics (requires auth)

### Friends Endpoints

- `POST /api/friends/request` - Send friend request (requires auth)
- `POST /api/friends/accept/:friendshipId` - Accept friend request (requires auth)
- `POST /api/friends/decline/:friendshipId` - Decline friend request (requires auth)
- `GET /api/friends` - Get friends list (requires auth)
- `GET /api/friends/requests` - Get pending friend requests (requires auth)
- `DELETE /api/friends/:friendId` - Remove friend (requires auth)
- `GET /api/friends/search?query=username` - Search users (requires auth)

### WebSocket Events

**Client → Server:**
- `joinRoom` - Join a game room
- `move` - Make a chess move
- `reset` - Reset the game

**Server → Client:**
- `joinedRoom` - Confirmation of joining room
- `playerJoined` - Another player joined
- `moveMade` - A move was made
- `moveError` - Invalid move attempt
- `gameReset` - Game was reset
- `error` - General error message

## Technology Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Chess.js** - Chess logic and validation
- **React DnD** - Drag-and-drop functionality
- **Framer Motion** - Animations
- **TailwindCSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Socket.IO** - WebSocket server
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Chess.js** - Chess logic and validation
- **Custom Chess AI** - JavaScript-based bot with position evaluation
- **Dotenv** - Environment variables

## Usage Guide

### Quick Start - Play as Guest

Want to try the app without creating an account? It's easy!

1. Navigate to the application homepage
2. Click "Play as Guest"
3. You're now in the lobby and ready to play!
4. As a guest, you can:
   - ✅ Create and join multiplayer games
   - ✅ Play against the AI bot
   - ✅ Share room links with friends
   - ❌ Save game history (requires account)
   - ❌ Track statistics (requires account)
   - ❌ Add friends (requires account)

**Note**: Guest games are not saved to your profile. Create an account to track your progress and access all features!

### Creating an Account

1. Navigate to the application homepage
2. Click "Sign Up"
3. Enter username, email, and password
4. Click "Create Account"

### Playing a Game

#### Multiplayer Mode
1. From the homepage, either:
   - Log in to your account, OR
   - Click "Play as Guest"
2. Click "Enter Lobby"
3. Either:
   - Click "Create Game" to start a new game
   - Enter a Room ID to join an existing game
4. Share the Room ID with your opponent
5. Play chess by dragging pieces
6. Games are automatically saved when completed (authenticated users only)

#### Single-Player Mode (vs Bot)
1. From the homepage, either:
   - Log in to your account, OR
   - Click "Play as Guest"
2. Click "Enter Lobby"
3. Click "Play vs Bot"
4. Select difficulty level:
   - **Easy**: Random moves with occasional good moves (beginner-friendly)
   - **Medium**: Evaluates positions and picks good moves (intermediate)
   - **Hard**: Deeper evaluation with look-ahead (advanced)
5. Click "Start Bot Game"
6. Play as white - the bot will automatically respond after your moves
7. The bot provides realistic thinking delays based on difficulty

### Managing Friends

1. Click "Friends" in the navigation
2. Use the search bar to find users
3. Click "Add Friend" to send a request
4. Check "Requests" tab for incoming requests
5. Accept or decline friend requests
6. View your friends list in the "Friends" tab

### Viewing Game History

1. Click "My Games" in the navigation
2. Browse your game history
3. Click on games to see details and PGN notation
4. Use pagination to view older games

### Viewing Profile

1. Click "Profile" in the navigation
2. View your statistics
3. Click "Edit Profile" to update username or avatar
4. Statistics update automatically after each game

## Bot Implementation Details

### Chess AI Architecture

The bot opponent uses a custom JavaScript-based chess engine with the following features:

#### Position Evaluation
- **Material Count**: Values pieces (pawn=100, knight=320, bishop=330, rook=500, queen=900, king=20000)
- **Piece-Square Tables**: Evaluates piece positioning (e.g., central pawns are better)
- **Tactical Bonuses**: Rewards checks and punishes being in check

#### Difficulty Levels
- **Easy (Beginner-Friendly)**:
  - 70% random moves, 30% evaluated moves
  - Good for learning basic chess rules
  - Think time: 500-1000ms
  
- **Medium (Intermediate)**:
  - Evaluates all positions and picks from top 3 moves
  - Weighted selection with some randomness
  - Think time: 800-1500ms
  
- **Hard (Advanced)**:
  - Deeper evaluation with 1-move look-ahead
  - Considers opponent's best responses
  - Picks optimal moves 90% of the time
  - Think time: 1200-2000ms

#### Testing
- 22 comprehensive bot logic tests
- 10 bot integration tests with GameManager
- 10 parallel bot session tests (new)
- Edge case coverage: checkmate, stalemate, promotion, castling
- All tests passing (74 backend tests total)

### Parallel Bot Sessions

The system supports **multiple users playing against bots simultaneously** with:

#### Architecture
- **Complete Game Isolation**: Each bot game runs independently in its own room
- **Robust Timeout Management**: Automatic cleanup of pending bot moves
- **Error Handling**: Comprehensive try-catch blocks and validation
- **Scalability**: Can handle hundreds of parallel bot sessions

#### Key Features
- ✅ Multiple users can play against bots at the same time
- ✅ Each game maintains independent state (position, history, difficulty)
- ✅ Bot moves are calculated per-game based on that game's position
- ✅ Automatic timeout cleanup when games end or reset
- ✅ No blocking or race conditions
- ✅ Tested with 5+ simultaneous bot games

#### Technical Details
See [Bot Session Management Documentation](backend/BOT_SESSION_MANAGEMENT.md) for:
- Complete architecture overview
- API usage examples
- Performance considerations
- Comparison to Chess.com's approach
- Troubleshooting guide

### File Structure
```
backend/src/
├── botPlayer.ts                      # Bot AI logic with difficulty levels
├── gameManager.ts                    # Game state management with bot timeout tracking
├── server.ts                         # Socket handlers for bot moves with error handling
└── __tests__/
    ├── botPlayer.test.ts             # Bot logic tests (22 tests)
    ├── gameManager.test.ts           # Game manager tests (42 tests)
    └── parallelBotSessions.test.ts   # Parallel session tests (10 tests)
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure code passes linting and formatting checks
4. Test your changes thoroughly
5. Submit a pull request with a clear description of changes

## Future Enhancements

Potential features for future development:

- **Chat System**: Real-time in-game chat between players
- **Game Invitations**: Invite friends directly to play
- **Tournaments**: Organized tournament system
- **Ratings & ELO**: Player ranking system
- **Opening Database**: Track and analyze chess openings
- **Time Controls**: Add chess clocks for timed games
- **Spectator Mode**: Watch ongoing games
- **Move Analysis**: AI-powered move suggestions and analysis (using bot engine)
- **Themes**: Customizable board and piece themes
- **Mobile App**: Native mobile applications
- **Advanced Bot Features**: Stronger engine integration (e.g., Stockfish.js), opening books, endgame tablebases

## Troubleshooting

### MongoDB Connection Issues

If you see `MongoDB connection error`:
- Ensure MongoDB is running
- Check your MONGODB_URI in .env
- Verify network connectivity to MongoDB

### Port Already in Use

If port 5000 or 5173 is in use:
- Change PORT in backend/.env
- Change VITE_API_URL in frontend to match

### WebSocket Connection Fails

- Ensure backend is running
- Check VITE_SOCKET_URL points to backend
- Verify firewall/proxy settings

## License

ISC

## Authors

Built with ❤️ by the Vibe Chess team