# Vibe Chess

A modern web-based chess application with user profiles, game tracking, and social features. Built with Node.js backend and React frontend.

## Features

### 🎮 Core Chess Gameplay
- Real-time multiplayer chess using WebSocket (Socket.IO)
- Drag-and-drop piece movement
- Move validation and game state management
- Check, checkmate, and stalemate detection
- Move history and captured pieces display

### 👤 User Profile System
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
   
   # The frontend will connect to http://localhost:5000 by default
   # To change this, set VITE_API_URL and VITE_SOCKET_URL in .env
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

Run linting:
```bash
# In backend or frontend directory
npm run lint  # (if configured)
```

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
- **Chess.js** - Chess logic
- **Dotenv** - Environment variables

## Usage Guide

### Creating an Account

1. Navigate to the application homepage
2. Click "Sign Up"
3. Enter username, email, and password
4. Click "Create Account"

### Playing a Game

1. Log in to your account
2. Click "Enter Lobby"
3. Either:
   - Click "Create Game" to start a new game
   - Enter a Room ID to join an existing game
4. Share the Room ID with your opponent
5. Play chess by dragging pieces
6. Games are automatically saved when completed

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
- **Move Analysis**: AI-powered move suggestions and analysis
- **Themes**: Customizable board and piece themes
- **Mobile App**: Native mobile applications

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