import { model, Schema, Types } from 'mongoose';

export interface Team {
  name: string;
  description?: string;
  members: Types.ObjectId[];
}

const teamSchema = new Schema<Team>(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500 },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export const TeamModel = model<Team>('Team', teamSchema);
