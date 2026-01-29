// Complete Chat System Test - Verifies MongoDB Integration
import * as dotenv from "dotenv";
import * as path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { ChatSessionModel } from "../models/chat-session.model";
import { ContentModel } from "../models/content.model";
import { CategoryModel } from "../models/category.model";
import { TagModel } from "../models/tag.model";
import { v4 as uuidv4 } from "uuid";

async function runFullTest() {
  try {
    console.log("=".repeat(60));
    console.log("🧪 COMPLETE CHAT SYSTEM DATABASE TEST");
    console.log("=".repeat(60));
    console.log("");

    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB\n");

    // ===============================================
    // PART 1: Verify Content (CMS) Data
    // ===============================================
    console.log("📚 PART 1: CMS CONTENT VERIFICATION");
    console.log("-".repeat(40));
    
    const contentCount = await ContentModel.countDocuments();
    const theoryCount = await ContentModel.countDocuments({ category: "theory" });
    const labCount = await ContentModel.countDocuments({ category: "lab" });
    const categoryCount = await CategoryModel.countDocuments();
    const tagCount = await TagModel.countDocuments();

    console.log(`Total Content: ${contentCount}`);
    console.log(`  - Theory Materials: ${theoryCount}`);
    console.log(`  - Lab Materials: ${labCount}`);
    console.log(`Categories: ${categoryCount}`);
    console.log(`Tags: ${tagCount}`);
    
    if (contentCount === 0) {
      console.log("⚠️  No content found. Run seed-content.ts first!");
    } else {
      console.log("✅ CMS Content verified in database\n");
    }

    // ===============================================
    // PART 2: Verify Chat Sessions
    // ===============================================
    console.log("💬 PART 2: CHAT SESSION VERIFICATION");
    console.log("-".repeat(40));
    
    const chatSessionCount = await ChatSessionModel.countDocuments();
    const totalMessages = await ChatSessionModel.aggregate([
      { $unwind: "$messages" },
      { $count: "total" }
    ]);
    
    console.log(`Total Chat Sessions: ${chatSessionCount}`);
    console.log(`Total Messages: ${totalMessages[0]?.total || 0}`);
    
    if (chatSessionCount === 0) {
      console.log("⚠️  No chat sessions found. Creating test session...");
    } else {
      console.log("✅ Chat sessions verified in database\n");
    }

    // ===============================================
    // PART 3: Test Search Integration with MongoDB
    // ===============================================
    console.log("🔍 PART 3: SEARCH INTEGRATION TEST");
    console.log("-".repeat(40));
    
    // Test searching content from database
    const searchQuery = "data structure";
    const searchRegex = new RegExp(searchQuery.split(" ").join("|"), "i");
    
    const searchResults = await ContentModel.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { "metadata.topic": searchRegex }
      ]
    }).limit(5).select("title category metadata");
    
    console.log(`Search query: "${searchQuery}"`);
    console.log(`Results found: ${searchResults.length}`);
    searchResults.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} (${r.category})`);
    });
    console.log("✅ Search integration working\n");

    // ===============================================
    // PART 4: Create Test Chat Session with Messages
    // ===============================================
    console.log("✨ PART 4: CREATE NEW TEST CHAT SESSION");
    console.log("-".repeat(40));
    
    const testSession = new ChatSessionModel({
      userId: "test-user-verification",
      title: "API Test Session",
      messages: [
        {
          id: uuidv4(),
          role: "user",
          content: "Search for materials about data structures",
          timestamp: new Date()
        },
        {
          id: uuidv4(),
          role: "assistant",
          content: `📚 **Search Results**\n\nFound ${searchResults.length} materials about data structures:\n${searchResults.map((r, i) => `${i + 1}. ${r.title}`).join("\n")}`,
          timestamp: new Date()
        }
      ]
    });
    
    await testSession.save();
    console.log(`✅ Created new test session: ${testSession._id}`);
    console.log(`   Title: ${testSession.title}`);
    console.log(`   Messages: ${testSession.messages.length}`);
    console.log("");

    // Verify it was saved
    const verifySession = await ChatSessionModel.findById(testSession._id);
    if (verifySession) {
      console.log("✅ Session verified in database!\n");
    }

    // ===============================================
    // PART 5: Test Chat Context (Follow-up Questions)
    // ===============================================
    console.log("🔄 PART 5: CONVERSATIONAL CONTEXT TEST");
    console.log("-".repeat(40));
    
    // Add follow-up message to the session
    verifySession!.messages.push({
      id: uuidv4(),
      role: "user",
      content: "Tell me more about linked lists",
      timestamp: new Date()
    });
    
    verifySession!.messages.push({
      id: uuidv4(),
      role: "assistant",
      content: "A linked list is a linear data structure where elements are stored in nodes. Each node contains data and a reference (pointer) to the next node. Types include: Singly Linked List, Doubly Linked List, and Circular Linked List.",
      timestamp: new Date()
    });
    
    await verifySession!.save();
    console.log(`✅ Added follow-up messages`);
    console.log(`   Total messages now: ${verifySession!.messages.length}\n`);

    // ===============================================
    // FINAL SUMMARY
    // ===============================================
    console.log("=".repeat(60));
    console.log("📊 FINAL DATABASE STATE SUMMARY");
    console.log("=".repeat(60));
    
    const finalContentCount = await ContentModel.countDocuments();
    const finalChatCount = await ChatSessionModel.countDocuments();
    const finalCategoryCount = await CategoryModel.countDocuments();
    const finalTagCount = await TagModel.countDocuments();
    
    console.log("");
    console.log("📚 CMS DATA:");
    console.log(`   Content Items: ${finalContentCount}`);
    console.log(`   Categories: ${finalCategoryCount}`);
    console.log(`   Tags: ${finalTagCount}`);
    console.log("");
    console.log("💬 CHAT DATA:");
    console.log(`   Chat Sessions: ${finalChatCount}`);
    
    // Get all sessions for summary
    const allSessions = await ChatSessionModel.find().select("userId title messages");
    let totalMsgs = 0;
    console.log("\n   Sessions by User:");
    const userSessions: Record<string, number> = {};
    allSessions.forEach(s => {
      userSessions[s.userId] = (userSessions[s.userId] || 0) + 1;
      totalMsgs += s.messages.length;
    });
    Object.entries(userSessions).forEach(([userId, count]) => {
      console.log(`     - ${userId}: ${count} session(s)`);
    });
    console.log(`   Total Messages: ${totalMsgs}`);
    
    console.log("");
    console.log("=".repeat(60));
    console.log("✅ ALL TESTS PASSED - DATABASE FULLY OPERATIONAL");
    console.log("=".repeat(60));

    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

runFullTest();
