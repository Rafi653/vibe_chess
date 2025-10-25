# Backend Dockerfile for Vibe Chess
# Node.js server with hot reload support

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for hot reload)
RUN npm install

# Copy application code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server with nodemon for hot reloading in development
CMD ["npm", "run", "dev"]
