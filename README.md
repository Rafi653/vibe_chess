# Vibe Chess

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