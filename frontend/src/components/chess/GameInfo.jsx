import useGameStore from '../../store/gameStore';

const GameInfo = ({ onReset }) => {
  const { 
    roomId, 
    playerColor, 
    currentTurn, 
    gameStatus, 
    gameOver, 
    winner,
    players,
    connected,
  } = useGameStore();

  const isMyTurn = 
    (playerColor === 'white' && currentTurn === 'w') ||
    (playerColor === 'black' && currentTurn === 'b');

  const getStatusMessage = () => {
    if (!connected) {
      return 'Connecting...';
    }
    
    if (gameStatus === 'waiting') {
      return 'Waiting for opponent...';
    }
    
    if (gameOver) {
      if (winner) {
        return winner === playerColor 
          ? '🎉 You won!' 
          : '😔 You lost';
      }
      return '🤝 Draw';
    }
    
    if (gameStatus === 'playing') {
      return isMyTurn ? '♟️ Your turn' : '⏳ Opponent\'s turn';
    }
    
    return 'Ready';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Game Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Room ID:</span>
            <span className="font-mono font-semibold text-gray-900">{roomId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Your Color:</span>
            <span className={`font-semibold ${playerColor === 'white' ? 'text-gray-900' : 'text-gray-600'}`}>
              {playerColor ? (playerColor === 'white' ? '⚪ White' : '⚫ Black') : '👁️ Spectator'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className={`text-center text-lg font-bold mb-3 ${
          isMyTurn && !gameOver ? 'text-green-600' : 'text-gray-700'
        }`}>
          {getStatusMessage()}
        </div>
        
        {gameStatus === 'playing' && (
          <div className="text-xs text-gray-500 text-center mb-3">
            <div>White: {players.white || 'Waiting...'}</div>
            <div>Black: {players.black || 'Waiting...'}</div>
          </div>
        )}
      </div>

      {gameOver && (
        <button
          onClick={onReset}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          New Game
        </button>
      )}
    </div>
  );
};

export default GameInfo;
