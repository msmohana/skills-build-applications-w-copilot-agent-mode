import { model, Schema, Types } from 'mongoose';

export interface LeaderboardEntry {
  user: Types.ObjectId;
  team?: Types.ObjectId;
  points: number;
  rank: number;
  period: 'weekly' | 'monthly' | 'all-time';
  periodStart: Date;
}

const leaderboardSchema = new Schema<LeaderboardEntry>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    points: { type: Number, required: true, min: 0 },
    rank: { type: Number, required: true, min: 1 },
    period: { type: String, enum: ['weekly', 'monthly', 'all-time'], default: 'weekly' },
    periodStart: { type: Date, required: true },
  },
  { timestamps: true },
);

leaderboardSchema.index({ user: 1, period: 1, periodStart: 1 }, { unique: true });

export const LeaderboardModel = model<LeaderboardEntry>('Leaderboard', leaderboardSchema);
