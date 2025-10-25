import { useState, useEffect } from 'react';
import useGameStore from '../../store/gameStore';

const PlayerNames = () => {
  const { players, playerColor, currentTurn, playerData, isBotGame } = useGameStore();
  const [localNames, setLocalNames] = useState({ white: '', black: '' });
  
  // Load names from localStorage
  useEffect(() => {
    const savedWhiteName = localStorage.getItem('chess_white_name') || '';
    const savedBlackName = localStorage.getItem('chess_black_name') || '';
    setLocalNames({ white: savedWhiteName, black: savedBlackName });
  }, []);

  const handleNameChange = (color, name) => {
    setLocalNames(prev => ({ ...prev, [color]: name }));
    localStorage.setItem(`chess_${color}_name`, name);
  };

  const getDisplayName = (color) => {
    // Check if it's a bot
    if (playerData && playerData[color]?.isBot) {
      return `🤖 Bot (${playerData[color]?.userId || 'Bot'})`;
    }
    return localNames[color] || players[color] || `${color === 'white' ? 'White' : 'Black'} Player`;
  };

  const isWhiteTurn = currentTurn === 'w';
  const isBot = (color) => playerData && playerData[color]?.isBot;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Players</h3>
      
      {/* Black Player (displayed on top as they're at top of board) */}
      <div className={`mb-3 p-3 rounded-lg ${
        !isWhiteTurn ? 'bg-blue-50 border-2 border-blue-400' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold">⚫</span>
          <span className={`text-xs px-2 py-1 rounded ${
            !isWhiteTurn ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {!isWhiteTurn ? 'Playing' : 'Waiting'}
          </span>
        </div>
        {isBot('black') ? (
          <div className="font-semibold text-green-700 flex items-center gap-1">
            {getDisplayName('black')}
          </div>
        ) : (playerColor === 'black' || !players.black) ? (
          <input
            type="text"
            value={localNames.black}
            onChange={(e) => handleNameChange('black', e.target.value)}
            placeholder="Black Player Name"
            className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={20}
          />
        ) : (
          <div className="font-semibold text-gray-900">{getDisplayName('black')}</div>
        )}
      </div>

      {/* White Player (displayed on bottom as they're at bottom of board) */}
      <div className={`p-3 rounded-lg ${
        isWhiteTurn ? 'bg-blue-50 border-2 border-blue-400' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold">⚪</span>
          <span className={`text-xs px-2 py-1 rounded ${
            isWhiteTurn ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {isWhiteTurn ? 'Playing' : 'Waiting'}
          </span>
        </div>
        {isBot('white') ? (
          <div className="font-semibold text-green-700 flex items-center gap-1">
            {getDisplayName('white')}
          </div>
        ) : (playerColor === 'white' || !players.white) ? (
          <input
            type="text"
            value={localNames.white}
            onChange={(e) => handleNameChange('white', e.target.value)}
            placeholder="White Player Name"
            className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={20}
          />
        ) : (
          <div className="font-semibold text-gray-900">{getDisplayName('white')}</div>
        )}
      </div>
    </div>
  );
};

export default PlayerNames;
