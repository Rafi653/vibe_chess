# Backend Dockerfile for Node.js with hot reload
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start the application with nodemon for hot reload
CMD ["npm", "run", "dev"]
