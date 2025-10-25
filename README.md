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

   **Option A: Using Docker Compose (Recommended)**
   ```bash
   docker-compose up
   ```
   - Frontend will be available at `http://localhost:3000`
   - Backend API will be available at `http://localhost:5000`

   **Option B: Run manually**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm start
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

4. **Development**
   - Frontend code goes in `./frontend`
   - Backend code goes in `./backend`
   - Both support hot-reloading during development

### Code Quality

This project uses ESLint and Prettier for code quality and formatting:

- Run linting: `npm run lint` (in frontend or backend)
- Format code: `npm run format` (in frontend or backend)

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure code passes linting and formatting checks
4. Submit a pull request

## License

ISC