import useGameStore from '../../store/gameStore';

const MoveHistory = () => {
  const { moveHistory } = useGameStore();

  // Group moves by pairs (white and black)
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = moveHistory[i];
    const blackMove = moveHistory[i + 1];
    movePairs.push({ moveNumber, whiteMove, blackMove });
  }

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
            {movePairs.map(({ moveNumber, whiteMove, blackMove }) => (
              <div 
                key={moveNumber}
                className="flex items-center text-sm py-1 px-2 hover:bg-gray-50 rounded"
              >
                <span className="text-gray-500 font-mono w-8 text-right mr-3">
                  {moveNumber}.
                </span>
                <div className="flex-1 flex gap-3">
                  <span className="text-gray-900 font-semibold w-16">
                    {whiteMove.san}
                  </span>
                  {blackMove && (
                    <span className="text-gray-700 font-semibold w-16">
                      {blackMove.san}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
