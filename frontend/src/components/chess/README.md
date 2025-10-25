# Chess Components

This directory contains the React components for the chess game interface with drag-and-drop functionality.

## Components

### ChessBoard.jsx
The main chess board component that renders an 8x8 grid with pieces based on FEN notation.

**Features:**
- Renders board from FEN string
- Supports board orientation flip for black player
- Integrates with react-dnd for drag-and-drop
- Automatically updates when game state changes

**Props:**
- `onMove(from, to)`: Callback function when a piece is moved

### Piece.jsx
Individual chess piece component with drag-and-drop support.

**Features:**
- Unicode chess symbols (♔ ♕ ♖ ♗ ♘ ♙)
- Conditional dragging based on turn and player color
- Visual feedback during drag
- Styled with text shadows for better visibility

**Props:**
- `piece`: Piece identifier (e.g., 'wp', 'bn')
- `position`: Square position (e.g., 'e4')
- `playerColor`: Current player's color ('white' or 'black')
- `currentTurn`: Whose turn it is ('w' or 'b')

### Square.jsx
Individual board square component that serves as a drop target.

**Features:**
- Light/dark square coloring
- Drop target for pieces
- Visual feedback (green for valid, red for invalid)
- Contains piece if occupied

**Props:**
- `position`: Square position (e.g., 'e4')
- `piece`: Piece on this square (null if empty)
- `isLight`: Boolean for square color
- `onDrop(from, to)`: Callback when piece dropped
- `playerColor`: Current player's color
- `currentTurn`: Whose turn it is

### GameInfo.jsx
Side panel showing game information and status.

**Features:**
- Displays room ID
- Shows player color assignment
- Connection status indicator
- Turn indicator with emoji
- Player list
- New game button (when game is over)

**Props:**
- `onReset()`: Callback to reset/start new game

## Usage

```jsx
import ChessBoard from './components/chess/ChessBoard';
import GameInfo from './components/chess/GameInfo';
import useGameStore from './store/gameStore';
import useSocket from './hooks/useSocket';

function Game() {
  const { makeMove, resetGame } = useGameStore();
  const { emitMove, emitReset } = useSocket(roomId);

  const handleMove = (from, to) => {
    const move = makeMove(from, to);
    if (move) {
      emitMove(move);
    }
  };

  const handleReset = () => {
    resetGame();
    emitReset();
  };

  return (
    <div>
      <ChessBoard onMove={handleMove} />
      <GameInfo onReset={handleReset} />
    </div>
  );
}
```

## Styling

The components use Tailwind CSS classes for styling:
- Board dimensions: `w-[480px] h-[480px]`
- Square colors: `bg-amber-100` (light) and `bg-amber-700` (dark)
- Hover effects: `bg-green-400` (valid drop) and `bg-red-400` (invalid drop)

## Dependencies

- `react-dnd`: Drag and drop functionality
- `react-dnd-html5-backend`: HTML5 backend for react-dnd
- `zustand`: State management
- `chess.js`: Chess logic and FEN parsing

## Board Representation

The board uses standard chess notation:
- Files: a-h (left to right)
- Ranks: 1-8 (bottom to top from white's perspective)
- Squares: e.g., 'e4', 'a1', 'h8'

Pieces are represented as two characters:
- First character: color ('w' for white, 'b' for black)
- Second character: piece type ('p', 'n', 'b', 'r', 'q', 'k')
- Examples: 'wp' (white pawn), 'bn' (black knight)

## Board Orientation

The board automatically flips for the black player:
- White sees ranks 1-8 from bottom to top
- Black sees ranks 8-1 from bottom to top
- This provides the correct perspective for each player
