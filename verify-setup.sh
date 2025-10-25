#!/bin/bash
# Verification script for Docker setup

echo "=== Vibe Chess Docker Setup Verification ==="
echo ""

echo "1. Checking Docker Compose status..."
docker compose ps
echo ""

echo "2. Testing Backend API Health..."
curl -s http://localhost:5000/api/health | jq . 2>/dev/null || curl -s http://localhost:5000/api/health
echo ""

echo "3. Testing Backend API Welcome..."
curl -s http://localhost:5000/api | jq . 2>/dev/null || curl -s http://localhost:5000/api
echo ""

echo "4. Testing Frontend (first 10 lines of HTML)..."
curl -s http://localhost:5173 | head -10
echo ""

echo "5. Checking Backend logs (last 5 lines)..."
docker logs vibe-chess-backend 2>&1 | tail -5
echo ""

echo "6. Checking Frontend logs (last 5 lines)..."
docker logs vibe-chess-frontend 2>&1 | tail -5
echo ""

echo "=== Verification Complete ==="
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:5000/api"
echo "Backend WebSocket: ws://localhost:5000/ws"
