import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

function Navbar() {
  const { user, isAuthenticated, isGuest, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-purple-600">
            Vibe Chess
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/lobby"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Lobby
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/game-history"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  My Games
                </Link>
                <Link
                  to="/friends"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Friends
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Profile
                </Link>
                <div className="flex items-center space-x-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-sm font-bold text-purple-700">
                      {user?.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-gray-700">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : isGuest ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-sm font-bold text-green-700">
                    G
                  </div>
                  <span className="text-gray-700">Guest</span>
                </div>
                <Link
                  to="/login"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Login to Save Games
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
