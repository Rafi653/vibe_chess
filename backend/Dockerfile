# Backend Dockerfile for Node.js with hot reload
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for development)
# Use --no-audit and --prefer-offline to avoid npm issues
RUN npm install --no-audit --no-fund --loglevel verbose || npm install --no-audit --no-fund

# Copy application code  
COPY . .

# Expose port
EXPOSE 5000

# Start the application with nodemon for hot reload using npx
CMD ["npx", "nodemon", "index.js"]
