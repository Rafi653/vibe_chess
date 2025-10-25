import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import useGameStore from '../store/gameStore';
import useSocket from '../hooks/useSocket';
import ChessBoard from '../components/chess/ChessBoard';
import GameInfo from '../components/chess/GameInfo';
import MoveHistory from '../components/chess/MoveHistory';
import CapturedPieces from '../components/chess/CapturedPieces';
import PlayerNames from '../components/chess/PlayerNames';
import GameSharing from '../components/chess/GameSharing';

function Game() {
  const { roomId } = useParams();
  const { setRoomId, makeMove, resetGame } = useGameStore();
  const { emitMove, emitReset } = useSocket(roomId);

  useEffect(() => {
    if (roomId) {
      setRoomId(roomId);
    }
  }, [roomId, setRoomId]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
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
              Vibe Chess
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
              <GameSharing />
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Drag and drop pieces to make your move</p>
            <p className="mt-2">Share the room ID with your opponent to play together</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Game;
