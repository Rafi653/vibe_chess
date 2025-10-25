# 🌐 Cloudflare Tunnel Guide: Host Locally & Share with Friends

This guide shows you how to host your Vibe Chess application locally on your laptop and share it securely with friends anywhere using Cloudflare Tunnel. No port forwarding or complex networking required!

## 📋 Table of Contents

- [What is Cloudflare Tunnel?](#what-is-cloudflare-tunnel)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Guide](#configuration-guide)
- [Sharing with Friends](#sharing-with-friends)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## What is Cloudflare Tunnel?

Cloudflare Tunnel creates a secure outbound connection from your local machine to Cloudflare's network, making your local application accessible from the internet without exposing your IP address or opening firewall ports. It's perfect for:

- **Quick demos** to friends and colleagues
- **Testing** your app from different networks
- **Temporary sharing** without deploying to a server

## Prerequisites

Before you start:

- ✅ Vibe Chess app running locally (see [README.md](README.md) for setup)
- ✅ A Cloudflare account (free account works fine)
- ✅ `cloudflared` CLI installed on your machine

## Installation

### Install Cloudflared

Choose your platform:

#### macOS (Homebrew)
```bash
brew install cloudflare/cloudflare/cloudflared
```

#### Windows (via Chocolatey)
```bash
choco install cloudflared
```

#### Windows (Manual)
Download from [Cloudflare Tunnel Downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)

#### Linux (Debian/Ubuntu)
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

#### Linux (Other)
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

### Verify Installation
```bash
cloudflared --version
```

## Quick Start

### Step 1: Authenticate with Cloudflare

Run this command once to link cloudflared with your Cloudflare account:

```bash
cloudflared tunnel login
```

This opens your browser for authentication. Follow the prompts to authorize cloudflared.

### Step 2: Start Your Vibe Chess Application

Make sure your application is running locally:

#### Using Docker Compose (Recommended)
```bash
cd /path/to/vibe_chess
docker-compose up
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

#### Using Manual Setup
Start both backend and frontend in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 3: Create Tunnels

You need **two tunnels** - one for the frontend and one for the backend:

#### Terminal 3 - Frontend Tunnel
```bash
cloudflared tunnel --url http://localhost:5173
```

You'll see output like:
```
Your quick Tunnel has been created! Visit it at:
https://random-abc123.trycloudflare.com
```

**Copy this URL** - this is your **public frontend URL**.

#### Terminal 4 - Backend Tunnel
```bash
cloudflared tunnel --url http://localhost:5000
```

You'll see output like:
```
Your quick Tunnel has been created! Visit it at:
https://different-xyz789.trycloudflare.com
```

**Copy this URL** - this is your **public backend URL**.

### Step 4: Configure Your Application

Now you need to tell the frontend where to find the backend using the public URLs.

## Configuration Guide

### Option A: Using Docker Compose

Edit `docker-compose.yml` and update the frontend environment variables:

```yaml
  frontend:
    # ... other config ...
    environment:
      - NODE_ENV=development
      - VITE_API_URL=https://your-backend-xyz789.trycloudflare.com
      - VITE_SOCKET_URL=https://your-backend-xyz789.trycloudflare.com
```

Replace `your-backend-xyz789.trycloudflare.com` with your actual backend tunnel URL.

**Then restart the frontend container:**
```bash
docker-compose restart frontend
```

### Option B: Using Manual Setup with .env File

1. Create or edit `frontend/.env`:

```env
# Frontend Environment Variables for Cloudflare Tunnel

# Backend API URL (from your backend cloudflared tunnel)
VITE_API_URL=https://your-backend-xyz789.trycloudflare.com

# Backend WebSocket URL (usually same as API URL)
VITE_SOCKET_URL=https://your-backend-xyz789.trycloudflare.com
```

2. Replace `your-backend-xyz789.trycloudflare.com` with your actual backend tunnel URL

3. Restart the frontend:
```bash
# Stop the frontend (Ctrl+C) and restart it
npm run dev
```

### Option C: Using Environment Variables Directly

```bash
# In your frontend terminal
cd frontend
VITE_API_URL=https://your-backend-xyz789.trycloudflare.com \
VITE_SOCKET_URL=https://your-backend-xyz789.trycloudflare.com \
npm run dev
```

### Backend CORS Configuration

Your backend also needs to allow requests from the frontend tunnel URL.

Edit `backend/.env` and add your frontend tunnel URL:

```env
CORS_ORIGIN=https://your-frontend-abc123.trycloudflare.com
```

Then restart the backend:
```bash
# Stop the backend (Ctrl+C) and restart it
npm run dev
```

Or with Docker:
```bash
docker-compose restart backend
```

## Sharing with Friends

### Share the Frontend URL

Give your friends the **frontend tunnel URL** (e.g., `https://your-frontend-abc123.trycloudflare.com`).

They can:
1. Open the URL in any web browser
2. Create an account or log in
3. Play chess with you in real-time!

### Important Notes

⚠️ **Keep all terminals running**: Your app is only accessible while:
- The backend server is running
- The frontend server is running  
- Both cloudflared tunnels are active

🔄 **URLs change on restart**: Each time you run `cloudflared tunnel --url`, you get a NEW random URL. You'll need to:
1. Update your configuration files with the new URLs
2. Restart the servers
3. Share the new frontend URL with friends

💡 **Pro Tip**: Keep a text file or note with your current tunnel URLs so you can easily share them.

## Security Best Practices

### 1. Only Run When Needed
- **Start tunnels** only when you want to share your app
- **Stop tunnels** (Ctrl+C) when done to close access

### 2. Use Authentication
The app already includes JWT-based authentication:
- Friends must create accounts to play
- All API endpoints are protected
- This prevents unauthorized access

### 3. Monitor Access
- Check your terminal output for connection logs
- Watch for unusual activity or errors
- Stop tunnels immediately if you see suspicious behavior

### 4. Temporary Sharing
- Quick tunnels (`cloudflared tunnel --url`) are designed for temporary use
- URLs expire after the tunnel is stopped
- For permanent hosting, consider proper deployment

### 5. Don't Share Sensitive Data
- Use a secure `JWT_SECRET` in backend/.env
- Don't commit `.env` files to version control
- Never share your Cloudflare credentials

### 6. Network Bandwidth
- Multiple users will consume your local bandwidth
- Monitor your internet connection performance
- Consider player limits based on your connection

## Troubleshooting

### Problem: Frontend can't connect to backend

**Symptoms**: Error messages like "Network Error" or "Failed to connect"

**Solutions**:
1. Verify backend tunnel is running
2. Check `VITE_API_URL` and `VITE_SOCKET_URL` in frontend configuration
3. Ensure URLs don't have trailing slashes
4. Check backend CORS_ORIGIN includes frontend tunnel URL

### Problem: WebSocket connection fails

**Symptoms**: Real-time game updates don't work, moves don't sync

**Solutions**:
1. Confirm `VITE_SOCKET_URL` matches your backend tunnel URL
2. Check that backend tunnel is active
3. Some networks block WebSockets - try a different network
4. Verify backend is running on expected port (5000)

### Problem: "Connection Refused" error

**Symptoms**: cloudflared shows "connection refused"

**Solutions**:
1. Verify the local service is actually running
2. Check you're using the correct port (5173 for frontend, 5000 for backend)
3. Try accessing localhost:5173 and localhost:5000 in your browser first

### Problem: Tunnel disconnects frequently

**Symptoms**: URLs stop working after a while

**Solutions**:
1. Check your internet connection stability
2. Look for error messages in cloudflared terminal
3. Restart the tunnel: Ctrl+C then run the command again
4. Update cloudflared: `brew upgrade cloudflared` (macOS)

### Problem: New tunnel URL every time

**This is expected behavior** for quick tunnels. If you need persistent URLs:

1. Create a named tunnel (more setup required):
```bash
# Create a named tunnel
cloudflared tunnel create my-vibe-chess

# Configure it with a config file
# See: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
```

2. Use a custom domain with Cloudflare Tunnel (requires a domain)

### Problem: CORS errors in browser console

**Symptoms**: Browser shows "blocked by CORS policy"

**Solutions**:
1. Add frontend tunnel URL to backend CORS_ORIGIN
2. Restart backend after changing .env
3. Check backend terminal for CORS-related errors
4. Verify CORS_ORIGIN format (no trailing slash)

### Problem: MongoDB connection fails

**Symptoms**: Backend crashes with "MongoDB connection error"

**Solutions**:
1. If using Docker: ensure MongoDB container is running (`docker-compose ps`)
2. If using local MongoDB: start the MongoDB service
3. Check MONGODB_URI in backend/.env
4. Verify MongoDB is accessible on localhost:27017

## Advanced: Named Tunnels (Optional)

For persistent URLs that don't change, you can create named tunnels:

### 1. Create Named Tunnels
```bash
cloudflared tunnel create vibe-chess-frontend
cloudflared tunnel create vibe-chess-backend
```

### 2. Create Configuration File

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: vibe-chess-frontend
credentials-file: /path/to/.cloudflared/UUID.json

ingress:
  - hostname: vibe-chess.yourdomain.com
    service: http://localhost:5173
  - service: http_status:404
```

### 3. Route DNS
```bash
cloudflared tunnel route dns vibe-chess-frontend vibe-chess.yourdomain.com
```

### 4. Run Named Tunnel
```bash
cloudflared tunnel run vibe-chess-frontend
```

**Note**: Named tunnels require more setup but provide:
- ✅ Persistent URLs
- ✅ Custom domain support  
- ✅ Better for long-term sharing

See [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) for detailed instructions.

## Summary Checklist

Before sharing with friends:

- [ ] Vibe Chess app running locally (both frontend and backend)
- [ ] `cloudflared` installed and authenticated
- [ ] Frontend tunnel running → note the URL
- [ ] Backend tunnel running → note the URL
- [ ] Updated `VITE_API_URL` and `VITE_SOCKET_URL` with backend tunnel URL
- [ ] Updated `CORS_ORIGIN` with frontend tunnel URL  
- [ ] Restarted frontend and backend services
- [ ] Tested the app by accessing the frontend tunnel URL
- [ ] Verified game functionality (create game, make moves)
- [ ] Shared frontend tunnel URL with friends

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Cloudflare Tunnel logs in your terminal
3. Check browser console for errors (F12 → Console tab)
4. Review backend logs for API errors
5. Consult [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

## Related Documentation

- [Main README](README.md) - General setup and usage
- [Backend Configuration](backend/.env.example) - Backend environment variables
- [Docker Compose](docker-compose.yml) - Container orchestration setup
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) - Official documentation

---

**Happy hosting! 🎉 Now you can play chess with friends from anywhere!**
