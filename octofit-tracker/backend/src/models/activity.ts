import { model, Schema, Types, type Model } from 'mongoose';

export interface Activity {
  user: Types.ObjectId;
  type: 'walking' | 'running' | 'cycling' | 'swimming' | 'strength' | 'other';
  durationMinutes: number;
  distanceKm?: number;
  points: number;
  performedAt: Date;
}

const activitySchema: Schema<Activity> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['walking', 'running', 'cycling', 'swimming', 'strength', 'other'],
      required: true,
    },
    durationMinutes: { type: Number, required: true, min: 1 },
    distanceKm: { type: Number, min: 0 },
    points: { type: Number, default: 0, min: 0 },
    performedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const ActivityModel: Model<Activity> = model('Activity', activitySchema);
