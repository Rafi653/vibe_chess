import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SavedGames from '../components/chess/SavedGames';

function SavedGamesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-6">
            <Link
              to="/lobby"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Lobby
            </Link>
          </div>

          <SavedGames />
        </motion.div>
      </div>
    </div>
  );
}

export default SavedGamesPage;
