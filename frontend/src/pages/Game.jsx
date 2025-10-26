import { motion } from 'framer-motion';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
import useSocket from '../hooks/useSocket';
import ChessBoard from '../components/chess/ChessBoard';
import GameInfo from '../components/chess/GameInfo';
import MoveHistory from '../components/chess/MoveHistory';
import MoveNavigation from '../components/chess/MoveNavigation';
import GameAnalysis from '../components/chess/GameAnalysis';
import CapturedPieces from '../components/chess/CapturedPieces';
import PlayerNames from '../components/chess/PlayerNames';
import GameSharing from '../components/chess/GameSharing';
import MobilePlayerBar from '../components/chess/MobilePlayerBar';
import GameMenu from '../components/chess/GameMenu';
import ShareInviteActions from '../components/chess/ShareInviteActions';

function Game() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const isBotGame = searchParams.get('bot') === 'true';
  const botDifficulty = searchParams.get('difficulty') || 'medium';
  
  const { setRoomId, makeMove, resetGame, setIsBotGame, setBotDifficulty, playerColor, gameOver, currentMoveIndex } = useGameStore();
  const { emitMove, emitReset } = useSocket(roomId, isBotGame, botDifficulty);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Check if user is navigating through history
  const isNavigating = currentMoveIndex !== undefined;

  useEffect(() => {
    if (roomId) {
      setRoomId(roomId);
      if (isBotGame) {
        setIsBotGame(true);
        setBotDifficulty(botDifficulty);
      }
    }
  }, [roomId, isBotGame, botDifficulty, setRoomId, setIsBotGame, setBotDifficulty]);

  // Detect mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const handleMove = (from, to) => {
    // Prevent moves while navigating through history
    if (isNavigating) {
      return;
    }
    
    // Make move locally (optimistic update)
    const move = makeMove(from, to);
    
    if (move) {
      // Emit move to server
      emitMove(move);
    }
  };

  const handleReset = () => {
    resetGame();
    emitReset();
  };

  const handleResign = () => {
    // TODO: Implement resign logic with backend
    if (window.confirm('Are you sure you want to resign?')) {
      console.log('Player resigned');
      // For now, reset the game
      handleReset();
    }
  };

  const handleOfferDraw = () => {
    // TODO: Implement draw offer logic with backend
    if (window.confirm('Offer a draw to your opponent?')) {
      console.log('Draw offered');
      alert('Draw offer sent (feature coming soon)');
    }
  };

  const handleAbort = () => {
    // TODO: Implement abort logic with backend
    if (window.confirm('Abort the game? This action cannot be undone.')) {
      console.log('Game aborted');
      handleReset();
    }
  };

  // Determine opponent color and player color for mobile display
  // When not connected to backend (playerColor is null), default to showing
  // white as player and black as opponent for demo/preview purposes.
  // This ensures the mobile UI is visible even when disconnected.
  const displayPlayerColor = playerColor || 'white';
  const opponentColor = displayPlayerColor === 'white' ? 'black' : 'white';

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      {/* Mobile Layout */}
      {isMobileView ? (
        <div className="flex flex-col h-full">
          {/* Header - Opponent's Info */}
          <MobilePlayerBar color={opponentColor} isOpponent={true} />
          
          {/* Central Chess Board */}
          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
            <div className="w-full max-w-md">
              <ChessBoard onMove={handleMove} />
            </div>
          </div>
          
          {/* Footer - Player's Info */}
          <MobilePlayerBar color={displayPlayerColor} isOpponent={false} />
          
          {/* Floating Action Buttons */}
          <ShareInviteActions 
            roomId={roomId} 
            gameUrl={window.location.href}
            disabled={gameOver}
          />
          
          {/* Game Menu */}
          <GameMenu 
            onResign={handleResign}
            onOfferDraw={handleOfferDraw}
            onAbort={handleAbort}
            disabled={gameOver}
          />
        </div>
      ) : (
        /* Desktop Layout - Single Page, No Scroll */
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-2 flex items-center justify-between bg-white shadow-md">
            <div className="flex items-center gap-4">
              <Link
                to="/lobby"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                Vibe Chess {isBotGame && <span className="text-sm text-green-600">🤖 vs Bot</span>}
              </h1>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex items-center justify-center gap-4 px-4 py-2">
              {/* Chess Board */}
              <div className="flex-shrink-0">
                <ChessBoard onMove={handleMove} />
              </div>
              
              {/* Side Panel - Condensed */}
              <div className="flex flex-col gap-2 h-full py-2 overflow-y-auto w-full max-w-xs lg:w-80">
                <GameInfo onReset={handleReset} />
                <PlayerNames />
                <CapturedPieces />
                <MoveNavigation />
                <GameAnalysis />
                <div className="flex-1 min-h-0">
                  <MoveHistory />
                </div>
                {!isBotGame && <GameSharing />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
