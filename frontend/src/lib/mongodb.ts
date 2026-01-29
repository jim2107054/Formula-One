import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mdjahidhasanjim277_db_user:Z6lzDN2WFib61ib2@cluster0.htzzsvb.mongodb.net/";
const MONGODB_DB = "learning_platform";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Initialize default users if they don't exist
export async function initializeDefaultUsers() {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection("users");

  // Check if admin exists
  const adminExists = await usersCollection.findOne({ email: "admin@learning.com" });
  if (!adminExists) {
    await usersCollection.insertOne({
      username: "admin",
      name: "Platform Admin",
      email: "admin@learning.com",
      password: "admin123", // In production, this should be hashed
      role: 2, // admin
      imageUrl: "/images/avatars/default.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Check if student exists
  const studentExists = await usersCollection.findOne({ email: "student@learning.com" });
  if (!studentExists) {
    await usersCollection.insertOne({
      username: "student",
      name: "Test Student",
      email: "student@learning.com",
      password: "student123", // In production, this should be hashed
      role: 0, // student
      imageUrl: "/images/avatars/default.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
