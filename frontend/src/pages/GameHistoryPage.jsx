import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { gameHistoryAPI } from '../services/api';

function GameHistoryPage() {
  const { user, isAuthenticated } = useUserStore();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      loadGames(currentPage);
    }
  }, [isAuthenticated, currentPage]);

  const loadGames = async (page) => {
    try {
      setLoading(true);
      const data = await gameHistoryAPI.getGames(page, 10);
      setGames(data.games);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getResultText = (game) => {
    if (!game.winner) {
      return game.result || 'Ongoing';
    }
    const isWhite = game.whitePlayer._id === user?.id;
    const isBlack = game.blackPlayer._id === user?.id;
    
    if (game.winner === 'draw') {
      return 'Draw';
    }
    
    if ((isWhite && game.winner === 'white') || (isBlack && game.winner === 'black')) {
      return '✓ Won';
    }
    
    return '✗ Lost';
  };

  const getResultColor = (game) => {
    if (!game.winner || game.winner === 'draw') {
      return 'text-gray-600';
    }
    
    const isWhite = game.whitePlayer._id === user?.id;
    const isBlack = game.blackPlayer._id === user?.id;
    
    if ((isWhite && game.winner === 'white') || (isBlack && game.winner === 'black')) {
      return 'text-green-600';
    }
    
    return 'text-red-600';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your game history</p>
          <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
            <Link to="/lobby" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Lobby
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Game History</h1>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading games...</p>
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No games played yet</p>
                <Link
                  to="/lobby"
                  className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Start a New Game
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {games.map((game) => (
                    <div
                      key={game._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {game.whitePlayer.username} vs {game.blackPlayer.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(game.startTime)}
                          </div>
                        </div>
                        <div className={`font-semibold ${getResultColor(game)}`}>
                          {getResultText(game)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span>Moves: {game.moveHistory?.length || 0}</span>
                        <span className="mx-2">•</span>
                        <span>Result: {game.result}</span>
                      </div>
                      {game.pgn && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                            Show PGN
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {game.pgn}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 flex justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default GameHistoryPage;
