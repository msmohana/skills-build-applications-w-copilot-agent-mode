import { createHash } from 'node:crypto';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { ActivityModel, type Activity } from '../models/activity.js';
import { LeaderboardModel, type LeaderboardEntry } from '../models/leaderboard.js';
import { TeamModel } from '../models/team.js';
import { UserModel } from '../models/user.js';
import { WorkoutModel } from '../models/workout.js';

/**
 * Seed the octofit_db database with test data for all OctoFit resources.
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

const activityPlans = [
  [
    { type: 'running' as const, durationMinutes: 32, distanceKm: 5.2, points: 52 },
    { type: 'strength' as const, durationMinutes: 35, points: 35 },
  ],
  [
    { type: 'strength' as const, durationMinutes: 40, points: 40 },
    { type: 'walking' as const, durationMinutes: 42, distanceKm: 3.5, points: 35 },
  ],
  [
    { type: 'cycling' as const, durationMinutes: 48, distanceKm: 18, points: 70 },
    { type: 'swimming' as const, durationMinutes: 35, distanceKm: 1.2, points: 45 },
  ],
  [
    { type: 'walking' as const, durationMinutes: 50, distanceKm: 4, points: 45 },
    { type: 'running' as const, durationMinutes: 24, distanceKm: 3.2, points: 36 },
  ],
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
      { name: 'Plank', sets: 3, reps: 30 },
    ],
  },
  {
    title: 'Recovery Flow',
    description: 'Gentle mobility to help you recover between training days.',
    category: 'recovery' as const,
    difficulty: 'beginner' as const,
    durationMinutes: 15,
    exercises: [
      { name: 'Cat-cow stretch', durationSeconds: 60 },
      { name: 'Standing hamstring stretch', durationSeconds: 45 },
      { name: "Child's pose", durationSeconds: 60 },
    ],
  },
] as const;

const writers = {
  user: {
    create: (data: (typeof users)[number], teamId: mongoose.Types.ObjectId) =>
      UserModel.findOneAndUpdate(
        { email: data.email },
        {
          $set: { displayName: data.displayName, bio: data.bio, team: teamId },
          $setOnInsert: { email: data.email },
        },
        { upsert: true, returnDocument: 'after', runValidators: true },
      ),
  },
  team: {
    create: (data: (typeof teams)[number]) =>
      TeamModel.findOneAndUpdate(
        { name: data.name },
        { $set: data, $setOnInsert: { members: [] } },
        { upsert: true, returnDocument: 'after', runValidators: true },
      ),
  },
  activity: {
    create: (data: Activity & { _id: mongoose.Types.ObjectId }) =>
      ActivityModel.findOneAndUpdate(
        { _id: data._id },
        { $set: data },
        { upsert: true, returnDocument: 'after', runValidators: true },
      ),
  },
  leaderboard: {
    create: (data: LeaderboardEntry) =>
      LeaderboardModel.findOneAndUpdate(
        { user: data.user, period: data.period, periodStart: data.periodStart },
        { $set: data },
        { upsert: true, returnDocument: 'after', runValidators: true },
      ),
  },
  workout: {
    create: (data: (typeof workouts)[number]) =>
      WorkoutModel.findOneAndUpdate(
        { title: data.title },
        { $set: data },
        { upsert: true, returnDocument: 'after', runValidators: true },
      ),
  },
};

async function seedDatabase(): Promise<void> {
  try {
    await connectDatabase();

    const teamRecords = new Map<string, mongoose.Types.ObjectId>();
    for (const team of teams) {
      const record = await writers.team.create(team);
      teamRecords.set(team.name, record._id);
    }

    const userRecords = new Map<string, mongoose.Types.ObjectId>();
    for (const user of users) {
      const teamId = teamRecords.get(user.team);
      if (!teamId) {
        throw new Error(`Seed team not found: ${user.team}`);
      }

      const record = await writers.user.create(user, teamId);
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

    const now = new Date();
    const weekStart = getUtcWeekStart(now);
    const currentWeekday = (now.getUTCDay() + 6) % 7;
    const activityFixtures = users.flatMap((user, userIndex) => {
      const userId = userRecords.get(user.email);
      if (!userId) {
        throw new Error(`Seed user not found: ${user.email}`);
      }

      return activityPlans[userIndex].map((activity, activityIndex) => ({
        user: userId,
        ...activity,
        performedAt: getActivityDate(weekStart, currentWeekday, userIndex, activityIndex),
        _id: createSeedActivityId(user.email, activityIndex),
      }));
    });

    await removePreviousSeedActivities(userRecords, weekStart);

    for (const activity of activityFixtures) {
      await writers.activity.create(activity);
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
      await writers.leaderboard.create({
        user: entry.userId,
        team: entry.teamId,
        points: entry.points,
        rank: index + 1,
        period: 'weekly',
        periodStart: weekStart,
      });
    }

    for (const workout of workouts) {
      await writers.workout.create(workout);
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

function getActivityDate(
  weekStart: Date,
  currentWeekday: number,
  userIndex: number,
  activityIndex: number,
): Date {
  const daysAgo =
    currentWeekday === 0 ? 0 : 1 + ((userIndex + activityIndex * 2) % currentWeekday);
  const dayIndex = currentWeekday - daysAgo;
  const date = new Date(weekStart);
  date.setUTCDate(date.getUTCDate() + dayIndex);

  if (dayIndex === currentWeekday) {
    date.setUTCHours(0, activityIndex * 30, 0, 0);
  } else {
    date.setUTCHours(activityIndex === 0 ? 8 : 18, 0, 0, 0);
  }

  return date;
}

function createSeedActivityId(email: string, activityIndex: number): mongoose.Types.ObjectId {
  const id = createHash('sha256')
    .update(`octofit-seed-activity-v1:${email}:${activityIndex}`)
    .digest('hex')
    .slice(0, 24);
  return new mongoose.Types.ObjectId(id);
}

async function removePreviousSeedActivities(
  userRecords: Map<string, mongoose.Types.ObjectId>,
  weekStart: Date,
): Promise<void> {
  const userIds = [...userRecords.values()];
  const existingActivities = await ActivityModel.find({ user: { $in: userIds } }).lean();
  const stableActivityIds = new Set(
    users.flatMap((user, userIndex) =>
      activityPlans[userIndex].map((_, activityIndex) => createSeedActivityId(user.email, activityIndex).toString()),
    ),
  );
  const legacyFixtures = [
    { email: 'alex.morgan@example.com', type: 'running', durationMinutes: 25, distanceKm: 3, points: 40, hour: 1 },
    { email: 'alex.morgan@example.com', type: 'strength', durationMinutes: 20, points: 30, hour: 2 },
    { email: 'jordan.lee@example.com', type: 'strength', durationMinutes: 30, points: 50, hour: 3 },
    { email: 'jordan.lee@example.com', type: 'walking', durationMinutes: 25, distanceKm: 3, points: 40, hour: 4 },
    { email: 'sam.rivera@example.com', type: 'cycling', durationMinutes: 35, distanceKm: 5, points: 60, hour: 5 },
    { email: 'sam.rivera@example.com', type: 'swimming', durationMinutes: 30, points: 50, hour: 6 },
    { email: 'taylor.kim@example.com', type: 'walking', durationMinutes: 40, points: 70, hour: 7 },
    { email: 'taylor.kim@example.com', type: 'running', durationMinutes: 35, distanceKm: 5, points: 60, hour: 8 },
  ] as const;
  const emailById = new Map([...userRecords].map(([email, id]) => [id.toString(), email]));
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);

  const staleActivityIds = existingActivities
    .filter((activity) => {
      if (stableActivityIds.has(activity._id.toString())) {
        return false;
      }

      const email = emailById.get(activity.user.toString());
      if (!email) {
        return false;
      }

      const matchesCurrentFixture = activityPlans.some((plan, userIndex) => {
        if (users[userIndex].email !== email) {
          return false;
        }

        return plan.some(
          (fixture) =>
            fixture.type === activity.type &&
            fixture.durationMinutes === activity.durationMinutes &&
            fixture.points === activity.points &&
            ('distanceKm' in fixture ? fixture.distanceKm === activity.distanceKm : activity.distanceKm === undefined) &&
            activity.performedAt >= weekStart &&
            activity.performedAt < nextWeekStart,
        );
      });

      const legacyFixture = legacyFixtures.find(
        (fixture) =>
          fixture.email === email &&
          fixture.type === activity.type &&
          fixture.durationMinutes === activity.durationMinutes &&
          fixture.points === activity.points &&
          ('distanceKm' in fixture ? fixture.distanceKm === activity.distanceKm : activity.distanceKm === undefined) &&
          activity.performedAt.getUTCDay() === 1 &&
          activity.performedAt.getUTCHours() === fixture.hour &&
          activity.performedAt.getUTCMinutes() === 0 &&
          activity.performedAt.getUTCSeconds() === 0 &&
          activity.performedAt.getUTCMilliseconds() === 0,
      );

      return matchesCurrentFixture || legacyFixture !== undefined;
    })
    .map((activity) => activity._id);

  if (staleActivityIds.length > 0) {
    await ActivityModel.deleteMany({ _id: { $in: staleActivityIds } });
    console.log(`Removed ${staleActivityIds.length} obsolete sample activities.`);
  }
}

seedDatabase();
