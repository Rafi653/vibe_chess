import { Chess } from 'chess.js'

/**
 * Bot difficulty levels
 */
export enum BotDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

/**
 * Piece value table for material evaluation
 */
const PIECE_VALUES: { [key: string]: number } = {
  p: 100,   // pawn
  n: 320,   // knight
  b: 330,   // bishop
  r: 500,   // rook
  q: 900,   // queen
  k: 20000  // king
}

/**
 * Position bonuses for piece placement (from white's perspective)
 */
const PIECE_SQUARE_TABLES: { [key: string]: number[][] } = {
  p: [ // pawn
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [ // knight
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [ // bishop
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ]
}

/**
 * Evaluate board position for given color
 */
function evaluatePosition(chess: Chess, color: 'w' | 'b'): number {
  const board = chess.board()
  let score = 0

  // Material and position evaluation
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type] || 0
        const positionTable = PIECE_SQUARE_TABLES[piece.type]
        const positionBonus = positionTable ? positionTable[row][col] : 0
        
        const totalValue = pieceValue + positionBonus
        
        if (piece.color === color) {
          score += totalValue
        } else {
          score -= totalValue
        }
      }
    }
  }

  // Add bonuses for game state
  if (chess.isCheck()) {
    score += chess.turn() === color ? -50 : 50
  }
  
  if (chess.isCheckmate()) {
    score += chess.turn() === color ? -100000 : 100000
  }

  return score
}

/**
 * Get all legal moves with their evaluation scores
 */
function getMoveScores(chess: Chess, color: 'w' | 'b', depth: number = 1): Array<{move: any, score: number}> {
  const moves = chess.moves({ verbose: true })
  const moveScores: Array<{move: any, score: number}> = []

  for (const move of moves) {
    const chessClone = new Chess(chess.fen())
    chessClone.move(move)
    
    let score = evaluatePosition(chessClone, color)
    
    // For harder difficulties, look ahead
    if (depth > 1) {
      const opponentColor = color === 'w' ? 'b' : 'w'
      const opponentMoves = chessClone.moves({ verbose: true })
      
      let worstScore = Infinity
      for (const oppMove of opponentMoves.slice(0, 10)) { // Limit opponent moves to check
        const oppChessClone = new Chess(chessClone.fen())
        oppChessClone.move(oppMove)
        const oppScore = evaluatePosition(oppChessClone, color)
        worstScore = Math.min(worstScore, oppScore)
      }
      score = worstScore !== Infinity ? worstScore : score
    }
    
    moveScores.push({ move, score })
  }

  return moveScores
}

/**
 * Select bot move based on difficulty level
 */
export function selectBotMove(chess: Chess, difficulty: BotDifficulty): any {
  const color = chess.turn()
  
  switch (difficulty) {
    case BotDifficulty.EASY:
      return selectEasyMove(chess, color)
    
    case BotDifficulty.MEDIUM:
      return selectMediumMove(chess, color)
    
    case BotDifficulty.HARD:
      return selectHardMove(chess, color)
    
    default:
      return selectMediumMove(chess, color)
  }
}

/**
 * Easy bot: Random moves with 70% chance, occasionally good moves
 */
function selectEasyMove(chess: Chess, color: 'w' | 'b'): any {
  const moves = chess.moves({ verbose: true })
  
  if (moves.length === 0) return null
  
  // 70% chance of random move, 30% chance of evaluating
  if (Math.random() < 0.7) {
    return moves[Math.floor(Math.random() * moves.length)]
  }
  
  const moveScores = getMoveScores(chess, color, 1)
  moveScores.sort((a, b) => b.score - a.score)
  
  // Pick from top 5 moves randomly
  const topMoves = moveScores.slice(0, Math.min(5, moveScores.length))
  return topMoves[Math.floor(Math.random() * topMoves.length)].move
}

/**
 * Medium bot: Evaluates positions and picks good moves
 */
function selectMediumMove(chess: Chess, color: 'w' | 'b'): any {
  const moveScores = getMoveScores(chess, color, 1)
  
  if (moveScores.length === 0) return null
  
  moveScores.sort((a, b) => b.score - a.score)
  
  // Pick from top 3 moves with weighted randomness
  const topMoves = moveScores.slice(0, Math.min(3, moveScores.length))
  const weights = [0.6, 0.3, 0.1]
  const random = Math.random()
  let cumulativeWeight = 0
  
  for (let i = 0; i < topMoves.length; i++) {
    cumulativeWeight += weights[i]
    if (random < cumulativeWeight) {
      return topMoves[i].move
    }
  }
  
  return topMoves[0].move
}

/**
 * Hard bot: Deeper evaluation with look-ahead
 */
function selectHardMove(chess: Chess, color: 'w' | 'b'): any {
  const moveScores = getMoveScores(chess, color, 2)
  
  if (moveScores.length === 0) return null
  
  moveScores.sort((a, b) => b.score - a.score)
  
  // Always pick the best move with occasional second-best
  if (Math.random() < 0.9 || moveScores.length === 1) {
    return moveScores[0].move
  }
  
  return moveScores[1].move
}

/**
 * Calculate bot thinking delay based on difficulty
 */
export function getBotDelay(difficulty: BotDifficulty): number {
  switch (difficulty) {
    case BotDifficulty.EASY:
      return 500 + Math.random() * 500 // 500-1000ms
    
    case BotDifficulty.MEDIUM:
      return 800 + Math.random() * 700 // 800-1500ms
    
    case BotDifficulty.HARD:
      return 1200 + Math.random() * 800 // 1200-2000ms
    
    default:
      return 1000
  }
}
