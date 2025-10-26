import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import useUserStore from '../store/userStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function Matchmaking() {
  const [isSearching, setIsSearching] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const navigate = useNavigate();
  const { user, isGuest } = useUserStore();
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('[Matchmaking] Connected to server');
    });

    socket.on('matchFound', ({ roomId, color, opponent }) => {
      console.log('[Matchmaking] Match found!', { roomId, color, opponent });
      setIsSearching(false);
      navigate(`/game/${roomId}`);
    });

    socket.on('matchmakingQueued', ({ queueSize }) => {
      console.log('[Matchmaking] Queued, queue size:', queueSize);
      setQueueSize(queueSize);
    });

    socket.on('matchmakingLeft', () => {
      console.log('[Matchmaking] Left queue');
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinMatchmaking = () => {
    setIsSearching(true);
    
    if (socketRef.current) {
      socketRef.current.emit('joinMatchmaking', {
        userId: user?._id,
        username: user?.username || 'Guest'
      });
    }
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    
    if (socketRef.current) {
      socketRef.current.emit('leaveMatchmaking');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Online Matchmaking
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Find a random opponent to play against
        </p>

        {!isSearching ? (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click "Find Opponent" to join the matchmaking queue</li>
                <li>• You'll be matched with another waiting player</li>
                <li>• Game starts automatically when a match is found</li>
                <li>• Colors are assigned randomly</li>
              </ul>
            </div>

            <button
              onClick={handleJoinMatchmaking}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🎯 Find Opponent
            </button>

            <button
              onClick={() => navigate('/lobby')}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back to Lobby
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
              />
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Searching for opponent...
              </h2>
              
              <div className="text-gray-600 space-y-1 text-center">
                <p>Time searching: <span className="font-mono font-bold text-blue-600">{formatTime(searchTime)}</span></p>
                {queueSize > 0 && (
                  <p className="text-sm">
                    {queueSize} player{queueSize !== 1 ? 's' : ''} in queue
                  </p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
              <p className="text-sm text-yellow-900 text-center">
                ⏳ Please wait while we find you an opponent.
                <br />
                This usually takes less than a minute.
              </p>
            </div>

            <button
              onClick={handleCancelSearch}
              className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
            >
              ✖ Cancel Search
            </button>
          </div>
        )}

        {!isGuest && user && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Playing as <span className="font-semibold text-gray-900">{user.username}</span>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Matchmaking;
