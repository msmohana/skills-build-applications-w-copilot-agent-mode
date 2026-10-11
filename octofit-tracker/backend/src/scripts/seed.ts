import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { ActivityModel } from '../models/activity.js';
import { LeaderboardModel } from '../models/leaderboard.js';
import { TeamModel } from '../models/team.js';
import { UserModel } from '../models/user.js';
import { WorkoutModel } from '../models/workout.js';

/**
 * Seed sample users, teams, activities, leaderboard entries, and workouts.
 * Run with `npm run seed` from the backend package.
 */
const users = [
  { displayName: 'Alex Morgan', email: 'alex.morgan@example.com', bio: 'Enjoys running and weekend hikes.', team: 'Trailblazers' },
  { displayName: 'Jordan Lee', email: 'jordan.lee@example.com', bio: 'Building strength one workout at a time.', team: 'Trailblazers' },
  { displayName: 'Sam Rivera', email: 'sam.rivera@example.com', bio: 'Cycling enthusiast and swim fan.', team: 'Pulse Crew' },
  { displayName: 'Taylor Kim', email: 'taylor.kim@example.com', bio: 'Focused on consistency and recovery.', team: 'Pulse Crew' },
] as const;

const teams = [
  { name: 'Trailblazers', description: 'A team for outdoor miles and steady progress.' },
  { name: 'Pulse Crew', description: 'A team that keeps every workout moving.' },
] as const;

const workouts = [
  {
    title: 'Steady Start Run',
    description: 'An approachable aerobic session at a conversational pace.',
    category: 'cardio' as const,
    difficulty: 'beginner' as const,
    durationMinutes: 25,
    exercises: [{ name: 'Easy run' }],
  },
  {
    title: 'Full-Body Strength',
    description: 'A balanced bodyweight routine for building foundational strength.',
    category: 'strength' as const,
    difficulty: 'beginner' as const,
    durationMinutes: 30,
    exercises: [
      { name: 'Squats', sets: 3, reps: 12 },
      { name: 'Push-ups', sets: 3, reps: 8 },
      { name: 'Glute bridges', sets: 3, reps: 12 },
    ],
  },
  {
    title: 'Recovery Flow',
    description: 'Gentle mobility to help you recover between training days.',
    category: 'recovery' as const,
    difficulty: 'beginner' as const,
    durationMinutes: 15,
    exercises: [{ name: 'Full-body mobility' }],
  },
] as const;

async function seedDatabase(): Promise<void> {
  try {
    await connectDatabase();

    const teamRecords = new Map<string, mongoose.Types.ObjectId>();
    for (const team of teams) {
      const record = await TeamModel.findOneAndUpdate(
        { name: team.name },
        { $set: team, $setOnInsert: { members: [] } },
        { upsert: true, returnDocument: 'after', runValidators: true },
      );
      teamRecords.set(team.name, record._id);
    }

    const userRecords = new Map<string, mongoose.Types.ObjectId>();
    for (const user of users) {
      const teamId = teamRecords.get(user.team);
      if (!teamId) {
        throw new Error(`Seed team not found: ${user.team}`);
      }

      const record = await UserModel.findOneAndUpdate(
        { email: user.email },
        {
          $set: { displayName: user.displayName, bio: user.bio, team: teamId },
          $setOnInsert: { email: user.email },
        },
        { upsert: true, returnDocument: 'after', runValidators: true },
      );
      userRecords.set(user.email, record._id);
    }

    for (const team of teams) {
      const teamId = teamRecords.get(team.name);
      if (!teamId) {
        throw new Error(`Seed team not found: ${team.name}`);
      }
      const memberIds = users
        .filter((user) => user.team === team.name)
        .map((user) => userRecords.get(user.email))
        .filter((id): id is mongoose.Types.ObjectId => id !== undefined);

      await TeamModel.updateOne({ _id: teamId }, { $set: { members: memberIds } });
    }

    const weekStart = getUtcWeekStart(new Date());
    const activityFixtures = users.flatMap((user, userIndex) => {
      const userId = userRecords.get(user.email);
      if (!userId) {
        throw new Error(`Seed user not found: ${user.email}`);
      }

      return [
        {
          user: userId,
          type: (['running', 'strength', 'cycling', 'walking'] as const)[userIndex],
          durationMinutes: 25 + userIndex * 5,
          distanceKm: userIndex % 2 === 0 ? 3 + userIndex : undefined,
          points: 40 + userIndex * 10,
          performedAt: new Date(weekStart.getTime() + (userIndex * 2 + 1) * 60 * 60 * 1000),
        },
        {
          user: userId,
          type: (['strength', 'walking', 'swimming', 'running'] as const)[userIndex],
          durationMinutes: 20 + userIndex * 5,
          distanceKm: userIndex % 2 === 1 ? 2 + userIndex : undefined,
          points: 30 + userIndex * 10,
          performedAt: new Date(weekStart.getTime() + (userIndex * 2 + 2) * 60 * 60 * 1000),
        },
      ];
    });

    for (const activity of activityFixtures) {
      await ActivityModel.findOneAndUpdate(
        { user: activity.user, type: activity.type, performedAt: activity.performedAt },
        { $set: activity },
        { upsert: true, returnDocument: 'after', runValidators: true },
      );
    }

    const activityTotals = new Map<string, number>();
    for (const activity of activityFixtures) {
      const key = activity.user.toString();
      activityTotals.set(key, (activityTotals.get(key) ?? 0) + activity.points);
    }

    const rankedUsers = users
      .map((user) => {
        const userId = userRecords.get(user.email);
        if (!userId) {
          throw new Error(`Seed user not found: ${user.email}`);
        }
        return {
          userId,
          teamId: teamRecords.get(user.team),
          points: activityTotals.get(userId.toString()) ?? 0,
        };
      })
      .sort((a, b) => b.points - a.points);

    for (const [index, entry] of rankedUsers.entries()) {
      await LeaderboardModel.findOneAndUpdate(
        { user: entry.userId, period: 'weekly', periodStart: weekStart },
        {
          $set: {
            team: entry.teamId,
            points: entry.points,
            rank: index + 1,
            period: 'weekly',
            periodStart: weekStart,
          },
        },
        { upsert: true, returnDocument: 'after', runValidators: true },
      );
    }

    for (const workout of workouts) {
      await WorkoutModel.findOneAndUpdate(
        { title: workout.title },
        { $set: workout },
        { upsert: true, returnDocument: 'after', runValidators: true },
      );
    }

    console.log(
      `Seed complete: ${users.length} users, ${teams.length} teams, ${activityFixtures.length} activities, ${rankedUsers.length} leaderboard entries, ${workouts.length} workouts.`,
    );
  } catch (error) {
    console.error('Error seeding octofit_db:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

function getUtcWeekStart(date: Date): Date {
  const weekStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (weekStart.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
  return weekStart;
}

seedDatabase();
