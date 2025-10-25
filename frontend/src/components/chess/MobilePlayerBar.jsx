import useGameStore from '../../store/gameStore';

// Import SVG pieces
import wp from '../../assets/pieces/wp.svg';
import wn from '../../assets/pieces/wn.svg';
import wb from '../../assets/pieces/wb.svg';
import wr from '../../assets/pieces/wr.svg';
import wq from '../../assets/pieces/wq.svg';
import bp from '../../assets/pieces/bp.svg';
import bn from '../../assets/pieces/bn.svg';
import bb from '../../assets/pieces/bb.svg';
import br from '../../assets/pieces/br.svg';
import bq from '../../assets/pieces/bq.svg';

const pieceImages = {
  p: { white: wp, black: bp },
  n: { white: wn, black: bn },
  b: { white: wb, black: bb },
  r: { white: wr, black: br },
  q: { white: wq, black: bq },
};

const pieceValues = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

const MobilePlayerBar = ({ color, isOpponent = false }) => {
  const { capturedPieces, playerColor, playerData, players, currentTurn } = useGameStore();
  
  // Determine which pieces to show (captured by this color)
  const capturedByThisColor = capturedPieces[color] || [];
  
  // Calculate material advantage
  const whiteValue = (capturedPieces.white || []).reduce((sum, piece) => sum + pieceValues[piece], 0);
  const blackValue = (capturedPieces.black || []).reduce((sum, piece) => sum + pieceValues[piece], 0);
  
  let advantage = 0;
  let showAdvantage = false;
  
  if (color === 'white') {
    advantage = whiteValue - blackValue;
    showAdvantage = advantage > 0;
  } else {
    advantage = blackValue - whiteValue;
    showAdvantage = advantage > 0;
  }

  // Get player name
  const getPlayerName = () => {
    if (playerData && playerData[color]?.isBot) {
      return `🤖 Bot`;
    }
    
    const savedName = localStorage.getItem(`chess_${color}_name`);
    if (savedName) return savedName;
    
    if (players[color]) return players[color];
    
    return color === playerColor ? 'You' : 'Opponent';
  };

  const isActive = (color === 'white' && currentTurn === 'w') || (color === 'black' && currentTurn === 'b');
  const playerName = getPlayerName();

  // Count pieces by type for compact display
  const countPieces = (pieces) => {
    const counts = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    pieces.forEach(piece => {
      counts[piece] = (counts[piece] || 0) + 1;
    });
    return counts;
  };

  const pieceCounts = countPieces(capturedByThisColor);
  const opponentColor = color === 'white' ? 'black' : 'white';

  return (
    <div 
      className={`px-4 py-3 flex items-center justify-between transition-all ${
        isActive 
          ? 'bg-blue-100 border-l-4 border-blue-600' 
          : 'bg-white border-l-4 border-gray-200'
      }`}
    >
      {/* Player Info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-2xl flex-shrink-0">
          {color === 'white' ? '⚪' : '⚫'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate text-sm">
            {playerName}
          </div>
          {isActive && (
            <div className="text-xs text-blue-600 font-medium">
              {isOpponent ? "Opponent's turn" : 'Your turn'}
            </div>
          )}
        </div>
      </div>

      {/* Captured Pieces Display */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Show captured pieces compactly */}
        {capturedByThisColor.length > 0 && (
          <div className="flex items-center gap-0.5">
            {Object.entries(pieceCounts).map(([pieceType, count]) => {
              if (count === 0) return null;
              return (
                <div key={pieceType} className="flex items-center">
                  <img
                    src={pieceImages[pieceType][opponentColor]}
                    alt={pieceType}
                    className="w-5 h-5"
                  />
                  {count > 1 && (
                    <span className="text-xs font-bold text-gray-700 -ml-1">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Material Advantage */}
        {showAdvantage && (
          <div className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            +{advantage}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePlayerBar;
