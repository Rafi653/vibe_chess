# Vibe Chess

A modern chess application with React frontend and Node.js backend, fully dockerized for local development.

## Features

- **Frontend**: React + Vite with hot module replacement
- **Backend**: Node.js + Express with WebSocket support
- **Dockerized**: Complete Docker Compose setup for local development
- **Hot Reload**: Both frontend and backend support live code updates

## Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibe_chess
   ```

2. **Start the application with Docker Compose**
   ```bash
   docker-compose up
   ```

   This will:
   - Build both frontend and backend Docker images
   - Start the frontend on http://localhost:5173
   - Start the backend on http://localhost:5000
   - Set up hot reload for both services

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Backend Health Check: http://localhost:5000/api/health
   - WebSocket: ws://localhost:5000/ws

4. **Stop the application**
   ```bash
   docker-compose down
   ```

## Development

### Running in Development Mode

The default `docker-compose up` command runs both services in development mode with hot reload enabled.

### Making Changes

- **Frontend**: Edit files in `frontend/src/` - changes will be reflected immediately
- **Backend**: Edit files in `backend/` - the server will restart automatically

### Environment Variables

#### Frontend
Create or modify `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

#### Backend
Create or modify `backend/.env`:
```env
PORT=5000
NODE_ENV=development
```

## Project Structure

```
vibe_chess/
├── frontend/
│   ├── src/                 # React source code
│   ├── public/              # Static assets
│   ├── Dockerfile           # Multi-stage frontend build
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Frontend dependencies
├── backend/
│   ├── index.js             # Express + WebSocket server
│   ├── Dockerfile           # Backend container setup
│   └── package.json         # Backend dependencies
├── docker-compose.yml       # Docker Compose configuration
└── README.md                # This file
```

## Architecture

### Frontend (Port 5173)
- **Framework**: React 18
- **Build Tool**: Vite
- **Features**: Hot Module Replacement (HMR), WebSocket client

### Backend (Port 5000)
- **Runtime**: Node.js 20
- **Framework**: Express 5
- **Features**: REST API, WebSocket server, CORS enabled
- **Hot Reload**: Nodemon for automatic restarts

### Docker Network
Both services communicate through a shared Docker bridge network (`vibe-chess-network`).

## API Endpoints

### REST API
- `GET /api` - Welcome message
- `GET /api/health` - Health check endpoint

### WebSocket
- `ws://localhost:5000/ws` - WebSocket connection for real-time communication

## Building for Production

To build production-ready images:

```bash
# Build frontend production image
docker build --target production -t vibe-chess-frontend:prod ./frontend

# Run production frontend (serves on port 80)
docker run -p 8080:80 vibe-chess-frontend:prod
```

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose up --build
```

### Port conflicts
If ports 5173 or 5000 are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3000:5173"  # Map to different host port
```

### Hot reload not working
Ensure volume mounts are properly configured in `docker-compose.yml` and that file watching is enabled in `vite.config.js`.

## License

MIT
A modern web-based chess application with a Node.js backend and frontend.

## Architecture

This project follows a client-server architecture:

- **Frontend**: User interface for the chess application
- **Backend**: API server handling game logic, user management, and data persistence

## Project Structure

```plaintext
chess-app/
├── frontend/          # Frontend application
│   └── package.json   # Frontend dependencies
├── backend/           # Backend API server
│   └── package.json   # Backend dependencies
├── docker-compose.yml # Docker orchestration
├── .gitignore         # Git ignore rules
├── .prettierrc        # Code formatting config
├── .eslintrc          # Code linting config
└── README.md          # This file
```

## Local Development Workflow

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Docker & Docker Compose (optional, for containerized development)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rafi653/vibe_chess.git
   cd vibe_chess
   ```

2. **Install dependencies**

   For frontend:
   ```bash
   cd frontend
   npm install
   ```

   For backend:
   ```bash
   cd backend
   npm install
   ```

3. **Run the application**

   > **Note**: Docker configuration and npm scripts will be added in future development phases.
   > The current setup provides the base structure for development to begin.

   **Coming Soon:**
   - Docker Compose for containerized development
   - npm start scripts for frontend and backend
   - Development servers with hot-reloading

4. **Development**
   - Frontend code goes in `./frontend`
   - Backend code goes in `./backend`
   - Add your application code and scripts as development progresses

### Code Quality

Configuration files for ESLint and Prettier are included:
- `.eslintrc` - Linting rules
- `.prettierrc` - Code formatting rules

> **Note**: Linting and formatting scripts can be added to package.json as needed during development.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure code passes linting and formatting checks
4. Submit a pull request

## License

ISC
