import { model, Schema, Types, type Model } from 'mongoose';

export interface User {
  displayName: string;
  email: string;
  bio?: string;
  team?: Types.ObjectId;
}

const userSchema: Schema<User> = new Schema(
  {
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
  },
  { timestamps: true },
);

export const UserModel: Model<User> = model('User', userSchema);
