import { model, Schema, Types } from 'mongoose';

export interface User {
  displayName: string;
  email: string;
  bio?: string;
  team?: Types.ObjectId;
}

const userSchema = new Schema<User>(
  {
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
  },
  { timestamps: true },
);

export const UserModel = model<User>('User', userSchema);
