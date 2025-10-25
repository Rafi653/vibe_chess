import mongoose, { Document, Schema } from 'mongoose';

export interface IGameHistory extends Document {
  roomId: string;
  whitePlayer: mongoose.Types.ObjectId;
  blackPlayer: mongoose.Types.ObjectId;
  winner?: 'white' | 'black' | 'draw';
  pgn: string;
  fen: string;
  moveHistory: any[];
  startTime: Date;
  endTime?: Date;
  result: 'ongoing' | 'checkmate' | 'stalemate' | 'draw' | 'resignation';
}

const gameHistorySchema = new Schema<IGameHistory>(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    whitePlayer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    blackPlayer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    winner: {
      type: String,
      enum: ['white', 'black', 'draw'],
    },
    pgn: {
      type: String,
      required: true,
    },
    fen: {
      type: String,
      required: true,
    },
    moveHistory: {
      type: Schema.Types.Mixed,
      default: [],
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    result: {
      type: String,
      enum: ['ongoing', 'checkmate', 'stalemate', 'draw', 'resignation'],
      default: 'ongoing',
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying user's games
gameHistorySchema.index({ whitePlayer: 1, startTime: -1 });
gameHistorySchema.index({ blackPlayer: 1, startTime: -1 });

export const GameHistory = mongoose.model<IGameHistory>('GameHistory', gameHistorySchema);
