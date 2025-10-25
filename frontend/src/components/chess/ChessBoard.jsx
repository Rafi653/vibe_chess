import { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Square from './Square';
import useGameStore from '../../store/gameStore';

const ChessBoard = ({ onMove }) => {
  const { fen, playerColor, currentTurn } = useGameStore();

  // Parse FEN to get board position
  const boardPosition = useMemo(() => {
    const position = {};
    const fenParts = fen.split(' ');
    const rows = fenParts[0].split('/');
    
    rows.forEach((row, rowIndex) => {
      let colIndex = 0;
      for (const char of row) {
        if (isNaN(char)) {
          // It's a piece
          const file = String.fromCharCode(97 + colIndex); // a-h
          const rank = 8 - rowIndex; // 8-1
          const square = `${file}${rank}`;
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const piece = char.toLowerCase();
          position[square] = `${color}${piece}`;
          colIndex++;
        } else {
          // It's empty squares
          colIndex += parseInt(char);
        }
      }
    });
    
    return position;
  }, [fen]);

  const handleDrop = (from, to) => {
    if (from !== to) {
      onMove(from, to);
    }
  };

  // Render board with correct orientation
  const renderBoard = () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    // Flip board if playing as black
    const displayFiles = playerColor === 'black' ? [...files].reverse() : files;
    const displayRanks = playerColor === 'black' ? [...ranks].reverse() : ranks;
    
    return displayRanks.map((rank, rankIndex) => (
      <div key={rank} className="flex">
        {displayFiles.map((file, fileIndex) => {
          const position = `${file}${rank}`;
          const piece = boardPosition[position];
          const isLight = (rankIndex + fileIndex) % 2 === 0;
          
          return (
            <Square
              key={position}
              position={position}
              piece={piece}
              isLight={isLight}
              onDrop={handleDrop}
              playerColor={playerColor}
              currentTurn={currentTurn}
            />
          );
        })}
      </div>
    ));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="inline-block border-4 border-gray-800 shadow-2xl">
        <div className="grid grid-rows-8 w-full max-w-[480px] h-auto aspect-square sm:w-[480px] sm:h-[480px]">
          {renderBoard()}
        </div>
      </div>
    </DndProvider>
  );
};

export default ChessBoard;
