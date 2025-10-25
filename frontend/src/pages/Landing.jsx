import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4"
      >
        <h1 className="text-6xl font-bold text-white mb-4">
          Vibe Chess
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          A modern web-based chess application
        </p>
        <div className="space-x-4">
          <Link
            to="/lobby"
            className="inline-block bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Enter Lobby
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Landing;
