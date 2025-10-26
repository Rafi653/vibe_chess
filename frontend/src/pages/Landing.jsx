import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

function Landing() {
  const { isAuthenticated, user, setGuestMode } = useUserStore();
  const navigate = useNavigate();

  const handlePlayAsGuest = () => {
    setGuestMode();
    navigate('/lobby');
  };

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
        {isAuthenticated && (
          <p className="text-lg text-gray-200 mb-6">
            Welcome back, {user?.username}!
          </p>
        )}
        <div className="space-x-4">
          <Link
            to="/lobby"
            className="inline-block bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Enter Lobby
          </Link>
          {!isAuthenticated && (
            <>
              <button
                onClick={handlePlayAsGuest}
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors border-2 border-white"
              >
                Play as Guest
              </button>
              <Link
                to="/login"
                className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors border-2 border-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-block bg-transparent text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-900 transition-colors border-2 border-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Landing;
