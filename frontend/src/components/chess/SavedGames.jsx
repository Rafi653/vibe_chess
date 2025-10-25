import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SavedGames = () => {
  const [savedGames, setSavedGames] = useState([]);

  useEffect(() => {
    loadSavedGames();
  }, []);

  const loadSavedGames = () => {
    const games = JSON.parse(localStorage.getItem('chess_saved_games') || '[]');
    setSavedGames(games);
  };

  const handleDeleteGame = (index) => {
    const games = [...savedGames];
    games.splice(index, 1);
    localStorage.setItem('chess_saved_games', JSON.stringify(games));
    setSavedGames(games);
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

  const handleViewGame = (game) => {
    // Currently just for viewing inline PGN
    // Future: Could navigate to a replay page
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Saved Games</h3>
      
      {savedGames.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No saved games yet</p>
          <Link
            to="/lobby"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start a New Game
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedGames.map((game, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-gray-900">
                    Game #{savedGames.length - index}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(game.timestamp)}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2 flex justify-between items-center">
                <span>{game.moveHistory?.length || 0} moves</span>
                <button
                  onClick={() => handleDeleteGame(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
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
      )}
    </div>
  );
};

export default SavedGames;
