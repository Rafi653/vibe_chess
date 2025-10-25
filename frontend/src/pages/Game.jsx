import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';

function Game() {
  const { roomId } = useParams();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4">
            <Link
              to="/lobby"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Lobby
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Chess Game
              </h1>
              <p className="text-gray-600">
                Room ID: <span className="font-mono font-semibold">{roomId}</span>
              </p>
            </div>

            <div className="aspect-square max-w-2xl mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-lg">
                Chess board will be rendered here
              </p>
            </div>

            <div className="mt-6 text-center text-gray-600">
              <p>Game functionality coming soon!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Game;
