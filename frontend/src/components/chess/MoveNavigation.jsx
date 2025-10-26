import { useState, useEffect } from 'react';
import useGameStore from '../../store/gameStore';

const MoveNavigation = () => {
  const { moveHistory, navigateToMove, currentMoveIndex, gameOver } = useGameStore();
  const [isNavigating, setIsNavigating] = useState(false);

  // Show navigation controls only if there are moves and game is over
  if (!gameOver || moveHistory.length === 0) {
    return null;
  }

  const handleFirst = () => {
    navigateToMove(0);
    setIsNavigating(true);
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, (currentMoveIndex || moveHistory.length) - 1);
    navigateToMove(newIndex);
    setIsNavigating(true);
  };

  const handleNext = () => {
    const newIndex = Math.min(moveHistory.length, (currentMoveIndex || 0) + 1);
    navigateToMove(newIndex);
    if (newIndex === moveHistory.length) {
      setIsNavigating(false);
    }
  };

  const handleLast = () => {
    navigateToMove(moveHistory.length);
    setIsNavigating(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Home') {
      handleFirst();
    } else if (e.key === 'End') {
      handleLast();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentMoveIndex, moveHistory.length]);

  const currentMove = currentMoveIndex !== undefined ? currentMoveIndex : moveHistory.length;
  const isAtStart = currentMove === 0;
  const isAtEnd = currentMove === moveHistory.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Move Navigation</h3>
        <span className="text-xs text-gray-500">
          {currentMove} / {moveHistory.length}
        </span>
      </div>
      
      {isNavigating && (
        <div className="text-xs text-blue-600 mb-2">
          Reviewing game • Use arrow keys ← →
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleFirst}
          disabled={isAtStart}
          className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
            isAtStart
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title="First move (Home)"
        >
          ⏮️
        </button>
        
        <button
          onClick={handlePrevious}
          disabled={isAtStart}
          className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
            isAtStart
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title="Previous move (←)"
        >
          ◀️
        </button>
        
        <button
          onClick={handleNext}
          disabled={isAtEnd}
          className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
            isAtEnd
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title="Next move (→)"
        >
          ▶️
        </button>
        
        <button
          onClick={handleLast}
          disabled={isAtEnd}
          className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
            isAtEnd
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title="Last move (End)"
        >
          ⏭️
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-2 text-center">
        Use keyboard: ← → Home End
      </div>
    </div>
  );
};

export default MoveNavigation;
