import { useDrop } from 'react-dnd';
import Piece from './Piece';
import useGameStore from '../../store/gameStore';

const Square = ({ position, piece, isLight, onDrop, playerColor, currentTurn }) => {
  const { selectedSquare, validMoves, selectSquare } = useGameStore();
  
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'piece',
    drop: (item) => {
      onDrop(item.position, position);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [position, onDrop]);

  // Check if this square is selected or a valid move destination
  const isSelected = selectedSquare === position;
  const isValidMove = validMoves.includes(position);

  // Handle click/tap on the square
  const handleSquareClick = () => {
    const move = selectSquare(position);
    // If a move was made, propagate it up
    if (move && onDrop) {
      onDrop(move.from, move.to);
    }
  };

  const bgColor = isLight ? 'bg-amber-100' : 'bg-amber-700';
  const hoverColor = isOver && canDrop ? 'bg-green-400' : '';
  // Use different visual indicators to avoid conflicts
  const selectedColor = isSelected ? 'ring-4 ring-blue-500 ring-inset' : '';
  const validMoveIndicator = isValidMove && !isSelected ? 'ring-4 ring-green-400 ring-inset' : '';

  return (
    <div
      ref={drop}
      onClick={handleSquareClick}
      className={`
        ${bgColor} 
        ${hoverColor}
        ${selectedColor}
        ${validMoveIndicator}
        w-full h-full 
        flex items-center justify-center
        relative
        cursor-pointer
        ${isOver && !canDrop ? 'bg-red-400' : ''}
      `}
    >
      {/* Valid move indicator dot */}
      {isValidMove && !piece && (
        <div className="absolute w-4 h-4 bg-green-500 rounded-full opacity-60" />
      )}
      {/* Valid capture indicator */}
      {isValidMove && piece && (
        <div className="absolute inset-0 border-4 border-red-500 rounded-sm opacity-60" />
      )}
      
      {piece && (
        <Piece 
          piece={piece} 
          position={position} 
          playerColor={playerColor}
          currentTurn={currentTurn}
        />
      )}
    </div>
  );
};

export default Square;
