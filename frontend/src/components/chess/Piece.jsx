import { useDrag } from 'react-dnd';

const pieceSymbols = {
  wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
};

const Piece = ({ piece, position, playerColor, currentTurn }) => {
  const pieceColor = piece[0];
  const canDrag = 
    playerColor === 'white' && pieceColor === 'w' && currentTurn === 'w' ||
    playerColor === 'black' && pieceColor === 'b' && currentTurn === 'b';

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'piece',
    item: { piece, position },
    canDrag: () => canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [piece, position, canDrag]);

  const symbol = pieceSymbols[piece];

  return (
    <div
      ref={drag}
      className={`piece ${pieceColor === 'w' ? 'text-white' : 'text-gray-800'} ${
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{
        fontSize: '3rem',
        lineHeight: '1',
        textShadow: pieceColor === 'w' 
          ? '0 0 3px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.6)' 
          : '0 0 3px rgba(255,255,255,0.8), 0 0 5px rgba(255,255,255,0.6)',
        userSelect: 'none',
      }}
    >
      {symbol}
    </div>
  );
};

export default Piece;
