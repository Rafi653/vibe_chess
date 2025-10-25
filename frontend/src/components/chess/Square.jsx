import { useDrop } from 'react-dnd';
import Piece from './Piece';

const Square = ({ position, piece, isLight, onDrop, playerColor, currentTurn }) => {
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

  const bgColor = isLight ? 'bg-amber-100' : 'bg-amber-700';
  const hoverColor = isOver && canDrop ? 'bg-green-400' : '';

  return (
    <div
      ref={drop}
      className={`
        ${bgColor} 
        ${hoverColor}
        w-full h-full 
        flex items-center justify-center
        relative
        ${isOver && !canDrop ? 'bg-red-400' : ''}
      `}
    >
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
