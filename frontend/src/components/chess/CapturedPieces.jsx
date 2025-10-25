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

const CapturedPieces = () => {
  const { capturedPieces, playerColor } = useGameStore();

  // Calculate material advantage
  const calculateMaterialAdvantage = () => {
    const whiteValue = capturedPieces.white.reduce((sum, piece) => sum + pieceValues[piece], 0);
    const blackValue = capturedPieces.black.reduce((sum, piece) => sum + pieceValues[piece], 0);
    const advantage = whiteValue - blackValue;
    
    return {
      advantage,
      leader: advantage > 0 ? 'white' : advantage < 0 ? 'black' : 'even',
      value: Math.abs(advantage),
    };
  };

  const materialAdvantage = calculateMaterialAdvantage();

  // Count pieces by type
  const countPieces = (pieces) => {
    const counts = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    pieces.forEach(piece => {
      counts[piece] = (counts[piece] || 0) + 1;
    });
    return counts;
  };

  const whiteCaptured = countPieces(capturedPieces.white);
  const blackCaptured = countPieces(capturedPieces.black);

  const renderPieces = (counts, color) => {
    const pieces = [];
    Object.keys(counts).forEach((pieceType) => {
      for (let i = 0; i < counts[pieceType]; i++) {
        pieces.push(
          <img
            key={`${pieceType}-${i}`}
            src={pieceImages[pieceType][color]}
            alt={`${color} ${pieceType}`}
            className="w-6 h-6"
          />
        );
      }
    });
    return pieces;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Captured Pieces</h3>
      
      {/* Material Advantage */}
      {materialAdvantage.leader !== 'even' && (
        <div className="mb-3 text-center">
          <span className={`font-bold text-lg ${
            materialAdvantage.leader === 'white' ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {materialAdvantage.leader === 'white' ? '⚪' : '⚫'} +{materialAdvantage.value}
          </span>
        </div>
      )}

      {/* Captured by White */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-600 mb-2">
          Captured by White:
        </div>
        <div className="flex flex-wrap gap-1 min-h-[32px] p-2 bg-gray-50 rounded">
          {capturedPieces.white.length > 0 ? (
            renderPieces(whiteCaptured, 'black')
          ) : (
            <span className="text-gray-400 text-xs">None</span>
          )}
        </div>
      </div>

      {/* Captured by Black */}
      <div>
        <div className="text-xs font-semibold text-gray-600 mb-2">
          Captured by Black:
        </div>
        <div className="flex flex-wrap gap-1 min-h-[32px] p-2 bg-gray-50 rounded">
          {capturedPieces.black.length > 0 ? (
            renderPieces(blackCaptured, 'white')
          ) : (
            <span className="text-gray-400 text-xs">None</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapturedPieces;
