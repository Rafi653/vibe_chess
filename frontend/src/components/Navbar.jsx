import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-purple-600">
            Vibe Chess
          </Link>
          <div className="space-x-6">
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
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
