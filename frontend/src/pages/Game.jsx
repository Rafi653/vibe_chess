import { motion } from 'framer-motion';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
import useSocket from '../hooks/useSocket';
import ChessBoard from '../components/chess/ChessBoard';
import GameInfo from '../components/chess/GameInfo';
import MoveHistory from '../components/chess/MoveHistory';
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
  
  const { setRoomId, makeMove, resetGame, setIsBotGame, setBotDifficulty, playerColor, gameOver } = useGameStore();
  const { emitMove, emitReset } = useSocket(roomId, isBotGame, botDifficulty);
  const [isMobileView, setIsMobileView] = useState(false);

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

  // Determine opponent color
  const opponentColor = playerColor === 'white' ? 'black' : playerColor === 'black' ? 'white' : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Mobile Layout */}
      {isMobileView ? (
        <div className="flex flex-col h-screen">
          {/* Header - Opponent's Info */}
          {opponentColor && <MobilePlayerBar color={opponentColor} isOpponent={true} />}
          
          {/* Central Chess Board */}
          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
            <div className="w-full max-w-md">
              <ChessBoard onMove={handleMove} />
            </div>
          </div>
          
          {/* Footer - Player's Info */}
          {playerColor && <MobilePlayerBar color={playerColor} isOpponent={false} />}
          
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
        /* Desktop Layout - Original */
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              <Link
                to="/lobby"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Lobby
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Vibe Chess {isBotGame && <span className="text-lg text-green-600">🤖 vs Bot ({botDifficulty})</span>}
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex justify-center">
                <ChessBoard onMove={handleMove} />
              </div>
              
              <div className="lg:col-span-1 space-y-4">
                <GameInfo onReset={handleReset} />
                <PlayerNames />
                <CapturedPieces />
                <MoveHistory />
                {!isBotGame && <GameSharing />}
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Drag and drop pieces to make your move</p>
              {!isBotGame && <p className="mt-2">Share the room ID with your opponent to play together</p>}
              {isBotGame && <p className="mt-2">The bot will respond automatically after your move</p>}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Game;
