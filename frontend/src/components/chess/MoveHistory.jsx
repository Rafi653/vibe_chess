import useGameStore from '../../store/gameStore';

const MoveHistory = () => {
  const { moveHistory, currentMoveIndex, navigateToMove } = useGameStore();

  // Group moves by pairs (white and black)
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = moveHistory[i];
    const blackMove = moveHistory[i + 1];
    movePairs.push({ moveNumber, whiteMove, blackMove });
  }

  const currentMove = currentMoveIndex !== undefined ? currentMoveIndex : moveHistory.length;

  const handleMoveClick = (index) => {
    navigateToMove(index);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Move History</h3>
      <div className="max-h-[400px] overflow-y-auto">
        {movePairs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No moves yet
          </p>
        ) : (
          <div className="space-y-1">
            {movePairs.map(({ moveNumber, whiteMove, blackMove }) => {
              const whiteIndex = (moveNumber - 1) * 2 + 1;
              const blackIndex = (moveNumber - 1) * 2 + 2;
              const isWhiteActive = currentMove === whiteIndex;
              const isBlackActive = currentMove === blackIndex;

              return (
                <div 
                  key={moveNumber}
                  className="flex items-center text-sm py-1 px-2 hover:bg-gray-50 rounded"
                >
                  <span className="text-gray-500 font-mono w-8 text-right mr-3">
                    {moveNumber}.
                  </span>
                  <div className="flex-1 flex gap-3">
                    <span 
                      className={`font-semibold w-16 cursor-pointer ${
                        isWhiteActive 
                          ? 'text-blue-600 bg-blue-50 px-1 rounded' 
                          : 'text-gray-900 hover:text-blue-600'
                      }`}
                      onClick={() => handleMoveClick(whiteIndex)}
                    >
                      {whiteMove.san}
                    </span>
                    {blackMove && (
                      <span 
                        className={`font-semibold w-16 cursor-pointer ${
                          isBlackActive 
                            ? 'text-blue-600 bg-blue-50 px-1 rounded' 
                            : 'text-gray-700 hover:text-blue-600'
                        }`}
                        onClick={() => handleMoveClick(blackIndex)}
                      >
                        {blackMove.san}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
