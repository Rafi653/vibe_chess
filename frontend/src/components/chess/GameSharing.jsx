import { useState } from 'react';
import useGameStore from '../../store/gameStore';

const GameSharing = () => {
  const { chess, roomId, moveHistory } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [pgnCopied, setPgnCopied] = useState(false);

  const handleCopyRoomLink = () => {
    const roomUrl = `${window.location.origin}/game/${roomId}`;
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportPGN = () => {
    const pgn = chess.pgn();
    navigator.clipboard.writeText(pgn).then(() => {
      setPgnCopied(true);
      setTimeout(() => setPgnCopied(false), 2000);
    });
  };

  const handleDownloadPGN = () => {
    const pgn = chess.pgn();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chess-game-${roomId}.pgn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveGame = () => {
    const gameData = {
      roomId,
      pgn: chess.pgn(),
      fen: chess.fen(),
      moveHistory,
      timestamp: new Date().toISOString(),
    };

    // Get existing saved games
    const savedGames = JSON.parse(localStorage.getItem('chess_saved_games') || '[]');
    
    // Add new game (limit to last 10 games)
    savedGames.unshift(gameData);
    if (savedGames.length > 10) {
      savedGames.pop();
    }
    
    localStorage.setItem('chess_saved_games', JSON.stringify(savedGames));
    alert('Game saved successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Share & Save</h3>
      
      <div className="space-y-2">
        {/* Copy Room Link */}
        <button
          onClick={handleCopyRoomLink}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {copied ? '✓ Copied!' : '🔗 Copy Room Link'}
        </button>

        {/* Export PGN to Clipboard */}
        {moveHistory.length > 0 && (
          <>
            <button
              onClick={handleExportPGN}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              {pgnCopied ? '✓ Copied!' : '📋 Copy PGN'}
            </button>

            {/* Download PGN */}
            <button
              onClick={handleDownloadPGN}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              💾 Download PGN
            </button>

            {/* Save Game */}
            <button
              onClick={handleSaveGame}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              🎮 Save Game
            </button>
          </>
        )}
      </div>

      {moveHistory.length === 0 && (
        <p className="text-gray-500 text-xs mt-2 text-center">
          Make some moves to enable PGN export and saving
        </p>
      )}
    </div>
  );
};

export default GameSharing;
