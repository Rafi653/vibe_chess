import { Router, Request, Response } from 'express';
import { GameHistory } from '../models/GameHistory';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = Router();

// Save a completed game
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { roomId, blackPlayerId, winner, pgn, fen, moveHistory, result } = req.body;
    const whitePlayerId = req.user._id;

    // Validate required fields
    if (!roomId || !blackPlayerId || !pgn || !fen || !moveHistory) {
      return res.status(400).json({ error: 'Missing required game data' });
    }

    // Create game history record
    const gameHistory = new GameHistory({
      roomId,
      whitePlayer: whitePlayerId,
      blackPlayer: blackPlayerId,
      winner,
      pgn,
      fen,
      moveHistory,
      endTime: new Date(),
      result: result || 'checkmate',
    });

    await gameHistory.save();

    // Update player statistics
    const updateStats = async (userId: string, isWinner: boolean, isDraw: boolean) => {
      const user = await User.findById(userId);
      if (user) {
        user.stats.gamesPlayed += 1;
        if (isDraw) {
          user.stats.gamesDrawn += 1;
        } else if (isWinner) {
          user.stats.gamesWon += 1;
        } else {
          user.stats.gamesLost += 1;
        }
        await user.save();
      }
    };

    const isDraw = winner === 'draw';
    await updateStats(whitePlayerId, winner === 'white', isDraw);
    await updateStats(blackPlayerId, winner === 'black', isDraw);

    res.status(201).json({
      message: 'Game saved successfully',
      gameId: gameHistory._id,
    });
  } catch (error: any) {
    console.error('Save game error:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// Get user's game history
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Find games where user was either white or black
    const games = await GameHistory.find({
      $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
    })
      .populate('whitePlayer', 'username avatar')
      .populate('blackPlayer', 'username avatar')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const totalGames = await GameHistory.countDocuments({
      $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
    });

    res.json({
      games,
      pagination: {
        page,
        limit,
        totalGames,
        totalPages: Math.ceil(totalGames / limit),
      },
    });
  } catch (error: any) {
    console.error('Get game history error:', error);
    res.status(500).json({ error: 'Failed to get game history' });
  }
});

// Get a specific game by ID
router.get('/:gameId', auth, async (req: Request, res: Response) => {
  try {
    const game = await GameHistory.findById(req.params.gameId)
      .populate('whitePlayer', 'username avatar')
      .populate('blackPlayer', 'username avatar');

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user has access to this game
    const userId = req.user._id.toString();
    if (
      game.whitePlayer._id.toString() !== userId &&
      game.blackPlayer._id.toString() !== userId
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ game });
  } catch (error: any) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Failed to get game' });
  }
});

// Get user statistics
router.get('/stats/summary', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent games
    const recentGames = await GameHistory.find({
      $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
    })
      .populate('whitePlayer', 'username avatar')
      .populate('blackPlayer', 'username avatar')
      .sort({ startTime: -1 })
      .limit(5);

    res.json({
      stats: user.stats,
      recentGames,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;
