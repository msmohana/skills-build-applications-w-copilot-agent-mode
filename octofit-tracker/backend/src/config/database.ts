import mongoose from 'mongoose';

const databaseName = 'octofit_db';
const connectionString = process.env.MONGODB_URI || `mongodb://localhost:27017/${databaseName}`;

export async function connectDatabase(): Promise<typeof mongoose> {
  await mongoose.connect(connectionString, { dbName: databaseName });
  console.log(`Connected to ${databaseName}`);
  return mongoose;
}

export default mongoose.connection;
