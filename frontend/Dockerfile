# Frontend Dockerfile for Vibe Chess
# Multi-stage build for Vite-based React application

# Development stage
FROM node:18-alpine as development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose Vite default port
EXPOSE 5173

# Start development server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
