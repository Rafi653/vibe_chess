import { useDrag } from 'react-dnd';

// Import SVG pieces
import wp from '../../assets/pieces/wp.svg';
import wn from '../../assets/pieces/wn.svg';
import wb from '../../assets/pieces/wb.svg';
import wr from '../../assets/pieces/wr.svg';
import wq from '../../assets/pieces/wq.svg';
import wk from '../../assets/pieces/wk.svg';
import bp from '../../assets/pieces/bp.svg';
import bn from '../../assets/pieces/bn.svg';
import bb from '../../assets/pieces/bb.svg';
import br from '../../assets/pieces/br.svg';
import bq from '../../assets/pieces/bq.svg';
import bk from '../../assets/pieces/bk.svg';

const pieceImages = {
  wp, wn, wb, wr, wq, wk,
  bp, bn, bb, br, bq, bk,
};

const Piece = ({ piece, position, playerColor, currentTurn }) => {
  const pieceColor = piece[0];
  const canDrag = 
    (playerColor === 'white' && pieceColor === 'w' && currentTurn === 'w') ||
    (playerColor === 'black' && pieceColor === 'b' && currentTurn === 'b');

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'piece',
    item: { piece, position },
    canDrag: () => canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [piece, position, canDrag]);

  const pieceImage = pieceImages[piece];

  return (
    <div
      ref={drag}
      className={`piece ${
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'
      } ${isDragging ? 'opacity-50' : 'opacity-100'} w-full h-full flex items-center justify-center`}
      style={{
        userSelect: 'none',
      }}
    >
      <img 
        src={pieceImage} 
        alt={piece}
        className="w-[85%] h-[85%] pointer-events-none"
        draggable={false}
      />
    </div>
  );
};

export default Piece;
