import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Lobby() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleCreateGame = () => {
    const newRoomId = crypto.randomUUID();
    navigate(`/game/${newRoomId}`);
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/game/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Game Lobby
          </h1>

          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Create New Game
            </h2>
            <p className="text-gray-600 mb-4">
              Start a new chess game and share the room ID with your opponent
            </p>
            <button
              onClick={handleCreateGame}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create Game
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Join Existing Game
            </h2>
            <p className="text-gray-600 mb-4">
              Enter the room ID to join an existing game
            </p>
            <form onSubmit={handleJoinGame} className="space-y-4">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Join Game
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              View Saved Games
            </h2>
            <p className="text-gray-600 mb-4">
              Review your previously played games and their move history
            </p>
            <Link
              to="/saved-games"
              className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
            >
              View Saved Games
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Lobby;
