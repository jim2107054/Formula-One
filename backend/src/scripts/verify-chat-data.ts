// Verify Chat Data in Database
import * as dotenv from "dotenv";
import * as path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { ChatSessionModel } from "../models/chat-session.model";

async function verifyChatData() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB\n");

    // Get all chat sessions
    const sessions = await ChatSessionModel.find().sort({ updatedAt: -1 });
    const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);

    console.log("==================================================");
    console.log("📊 CHAT DATABASE VERIFICATION");
    console.log("==================================================");
    console.log(`Total Chat Sessions: ${sessions.length}`);
    console.log(`Total Messages: ${totalMessages}`);
    console.log("==================================================\n");

    // Display all sessions with details
    console.log("💬 CHAT SESSIONS IN DATABASE:\n");
    
    for (const session of sessions) {
      console.log(`📌 Session: "${session.title}"`);
      console.log(`   ID: ${session._id}`);
      console.log(`   User: ${session.userId}`);
      console.log(`   Messages: ${session.messages.length}`);
      console.log("");
      
      // Show messages
      console.log("   Messages:");
      session.messages.forEach((msg, idx) => {
        const preview = msg.content.substring(0, 60).replace(/\n/g, " ");
        console.log(`   ${idx + 1}. [${msg.role.toUpperCase()}] ${preview}...`);
      });
      console.log("");
      console.log("   " + "─".repeat(50));
      console.log("");
    }

    console.log("==================================================");
    console.log("✅ CHAT DATABASE VERIFICATION COMPLETE");
    console.log("==================================================");

    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

verifyChatData();
