import { useState } from 'react';
import useGameStore from '../../store/gameStore';

const GameAnalysis = () => {
  const { moveHistory, gameOver, chess } = useGameStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Only show analysis after game ends
  if (!gameOver || moveHistory.length === 0) {
    return null;
  }

  const analyzeGame = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis with a delay (in real implementation, 
    // this would call backend or use Stockfish.js)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create basic analysis based on move history
    const totalMoves = moveHistory.length;
    const whiteMovesCount = Math.ceil(totalMoves / 2);
    const blackMovesCount = Math.floor(totalMoves / 2);
    
    // Detect potential blunders (moves with captures)
    const captures = moveHistory.filter(move => move.captured);
    const whiteCapturesCount = captures.filter(move => move.color === 'w').length;
    const blackCapturesCount = captures.filter(move => move.color === 'b').length;
    
    // Detect checks
    const checks = moveHistory.filter(move => move.san.includes('+'));
    const whiteChecksCount = checks.filter(move => move.color === 'w').length;
    const blackChecksCount = checks.filter(move => move.color === 'b').length;
    
    // Calculate approximate accuracy (simplified)
    const whiteAccuracy = Math.min(95, 70 + whiteCapturesCount * 3 + whiteChecksCount * 2);
    const blackAccuracy = Math.min(95, 70 + blackCapturesCount * 3 + blackChecksCount * 2);
    
    // Find opening moves (first 10 moves)
    const openingMoves = moveHistory.slice(0, Math.min(10, totalMoves));
    
    const analysisData = {
      totalMoves,
      whiteMovesCount,
      blackMovesCount,
      whiteCapturesCount,
      blackCapturesCount,
      whiteChecksCount,
      blackChecksCount,
      whiteAccuracy,
      blackAccuracy,
      openingMoves,
      result: chess.isCheckmate() ? 'Checkmate' : 
              chess.isStalemate() ? 'Stalemate' :
              chess.isDraw() ? 'Draw' : 'Finished'
    };
    
    setAnalysis(analysisData);
    setIsAnalyzing(false);
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-blue-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyLabel = (accuracy) => {
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 80) return 'Good';
    if (accuracy >= 70) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Post-Game Analysis</h3>
      
      {!analysis ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Analyze your game to see move quality, accuracy, and insights.
          </p>
          <button
            onClick={analyzeGame}
            disabled={isAnalyzing}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
              isAnalyzing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Analyzing...
              </span>
            ) : (
              '🔍 Analyze Game'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Game Result */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="text-sm font-semibold text-gray-700 mb-1">Game Result</div>
            <div className="text-lg font-bold text-gray-900">{analysis.result}</div>
            <div className="text-xs text-gray-600">{analysis.totalMoves} moves played</div>
          </div>

          {/* Player Statistics */}
          <div className="grid grid-cols-2 gap-3">
            {/* White Stats */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs font-semibold text-gray-700 mb-2">⚪ White</div>
              <div className="space-y-1">
                <div>
                  <div className="text-xs text-gray-600">Accuracy</div>
                  <div className={`text-lg font-bold ${getAccuracyColor(analysis.whiteAccuracy)}`}>
                    {analysis.whiteAccuracy}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {getAccuracyLabel(analysis.whiteAccuracy)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  <div>Captures: {analysis.whiteCapturesCount}</div>
                  <div>Checks: {analysis.whiteChecksCount}</div>
                </div>
              </div>
            </div>

            {/* Black Stats */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs font-semibold text-gray-700 mb-2">⚫ Black</div>
              <div className="space-y-1">
                <div>
                  <div className="text-xs text-gray-600">Accuracy</div>
                  <div className={`text-lg font-bold ${getAccuracyColor(analysis.blackAccuracy)}`}>
                    {analysis.blackAccuracy}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {getAccuracyLabel(analysis.blackAccuracy)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  <div>Captures: {analysis.blackCapturesCount}</div>
                  <div>Checks: {analysis.blackChecksCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Opening Analysis */}
          {analysis.openingMoves.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-sm font-semibold text-blue-900 mb-2">📖 Opening Phase</div>
              <div className="text-xs text-blue-800">
                {analysis.openingMoves.slice(0, 6).map((move, idx) => (
                  <span key={idx} className="mr-2">
                    {idx % 2 === 0 && `${Math.floor(idx / 2) + 1}.`} {move.san}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="text-sm font-semibold text-yellow-900 mb-2">💡 Tips</div>
            <ul className="text-xs text-yellow-800 space-y-1">
              {analysis.whiteAccuracy < 80 && (
                <li>• White: Focus on piece development and center control</li>
              )}
              {analysis.blackAccuracy < 80 && (
                <li>• Black: Consider defensive positioning and piece safety</li>
              )}
              {analysis.whiteCapturesCount === 0 && analysis.blackCapturesCount === 0 && (
                <li>• Try to create tactical opportunities for captures</li>
              )}
              {analysis.whiteChecksCount + analysis.blackChecksCount > 5 && (
                <li>• Good use of checks to maintain pressure!</li>
              )}
            </ul>
          </div>

          {/* Re-analyze button */}
          <button
            onClick={analyzeGame}
            disabled={isAnalyzing}
            className="w-full py-2 px-4 rounded-lg font-semibold text-purple-600 border-2 border-purple-600 hover:bg-purple-50 transition-colors"
          >
            🔄 Re-analyze
          </button>
        </div>
      )}
    </div>
  );
};

export default GameAnalysis;
