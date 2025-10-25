import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useGameStore from '../store/gameStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocket = (roomId) => {
  const socketRef = useRef(null);
  const {
    setConnected,
    setPlayerId,
    setPlayerColor,
    updateGameState,
    setPlayers,
  } = useGameStore();

  useEffect(() => {
    if (!roomId) return;

    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to socket server:', socket.id);
      setConnected(true);

      // Join the room
      const playerId = socket.id;
      setPlayerId(playerId);
      
      socket.emit('joinRoom', { roomId, playerId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
    });

    // Game events
    socket.on('joinedRoom', (data) => {
      console.log('Joined room:', data);
      setPlayerColor(data.color);
      if (data.gameState) {
        updateGameState(data.gameState);
      }
    });

    socket.on('playerJoined', (data) => {
      console.log('Player joined:', data);
      if (data.gameState) {
        updateGameState(data.gameState);
      }
    });

    socket.on('moveMade', (data) => {
      console.log('Move made:', data);
      if (data.gameState) {
        updateGameState(data.gameState);
      }
    });

    socket.on('moveError', (data) => {
      console.error('Move error:', data.error);
    });

    socket.on('gameReset', (data) => {
      console.log('Game reset:', data);
      if (data.gameState) {
        updateGameState(data.gameState);
      }
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      socket.disconnect();
    };
  }, [roomId, setConnected, setPlayerId, setPlayerColor, updateGameState, setPlayers]);

  const emitMove = (move) => {
    if (socketRef.current && roomId) {
      const playerId = socketRef.current.id;
      socketRef.current.emit('move', {
        roomId,
        playerId,
        move: {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        },
      });
    }
  };

  const emitReset = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('reset', { roomId });
    }
  };

  return {
    socket: socketRef.current,
    emitMove,
    emitReset,
  };
};

export default useSocket;
