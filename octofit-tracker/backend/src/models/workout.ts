import { model, Schema } from 'mongoose';

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
}

export interface Workout {
  title: string;
  description?: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'recovery';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  exercises: WorkoutExercise[];
}

const workoutSchema = new Schema<Workout>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    category: { type: String, enum: ['cardio', 'strength', 'flexibility', 'recovery'], required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    exercises: [
      {
        name: { type: String, required: true, trim: true },
        sets: { type: Number, min: 1 },
        reps: { type: Number, min: 1 },
      },
    ],
  },
  { timestamps: true },
);

export const WorkoutModel = model<Workout>('Workout', workoutSchema);
