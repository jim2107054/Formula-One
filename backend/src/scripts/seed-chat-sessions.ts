// Chat Session and Test Data Seeder
import * as dotenv from "dotenv";
import * as path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { ChatSessionModel } from "../models/chat-session.model";
import { v4 as uuidv4 } from "uuid";

async function seedChatData() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing chat sessions
    console.log("🗑️  Clearing existing chat sessions...");
    await ChatSessionModel.deleteMany({});
    console.log("✅ Existing chat sessions cleared\n");

    // Create sample chat sessions
    const chatSessions = [
      {
        userId: "student-user-001",
        title: "Data Structures Help",
        messages: [
          {
            id: uuidv4(),
            role: "user" as const,
            content: "Can you explain what data structures are?",
            timestamp: new Date(Date.now() - 3600000),
          },
          {
            id: uuidv4(),
            role: "assistant" as const,
            content:
              "Data structures are fundamental ways to organize and store data in a computer so that it can be accessed and modified efficiently. Common data structures include arrays, linked lists, stacks, queues, trees, graphs, and hash tables. Each has its own strengths and use cases depending on the operations you need to perform.",
            timestamp: new Date(Date.now() - 3590000),
          },
          {
            id: uuidv4(),
            role: "user" as const,
            content: "What's the difference between a stack and a queue?",
            timestamp: new Date(Date.now() - 3580000),
          },
          {
            id: uuidv4(),
            role: "assistant" as const,
            content:
              "Great question! A **Stack** follows LIFO (Last In, First Out) - like a stack of plates, you can only add or remove from the top. Operations: push (add) and pop (remove). A **Queue** follows FIFO (First In, First Out) - like a line at a store, the first person in line gets served first. Operations: enqueue (add to back) and dequeue (remove from front).",
            timestamp: new Date(Date.now() - 3570000),
          },
        ],
      },
      {
        userId: "student-user-001",
        title: "Binary Search Tree...",
        messages: [
          {
            id: uuidv4(),
            role: "user" as const,
            content: "Search for materials about binary search trees",
            timestamp: new Date(Date.now() - 7200000),
          },
          {
            id: uuidv4(),
            role: "assistant" as const,
            content:
              "📚 **Search Results for 'binary search trees'**\n\nI found 3 relevant materials:\n\n**1. Implementing a Binary Search Tree** (Lab)\n   Hands-on lab implementing BST operations: insert, delete, search...\n   📍 Source: Week 3 - Lab Materials | Relevance: 95%\n\n**2. Binary Trees and BST Complete Guide** (Theory)\n   Complete guide to binary trees and binary search trees...\n   📍 Source: Week 3 - Theory Materials | Relevance: 90%\n\nWould you like me to explain any of these topics in more detail?",
            timestamp: new Date(Date.now() - 7190000),
          },
          {
            id: uuidv4(),
            role: "user" as const,
            content: "Yes, explain how BST insertion works",
            timestamp: new Date(Date.now() - 7180000),
          },
          {
            id: uuidv4(),
            role: "assistant" as const,
            content:
              "**BST Insertion Algorithm**\n\n📖 **Overview**\nTo insert a new value into a BST:\n\n1. Start at the root\n2. Compare the new value with current node:\n   - If smaller, go left\n   - If larger, go right\n3. Repeat until you find an empty spot\n4. Insert the new node there\n\n**Time Complexity:**\n- Average: O(log n)\n- Worst case (unbalanced): O(n)\n\n💡 **Tip**: To maintain efficiency, consider using self-balancing trees like AVL or Red-Black trees.",
            timestamp: new Date(Date.now() - 7170000),
          },
        ],
      },
      {
        userId: "student-user-002",
        title: "Generate Sorting Notes",
        messages: [
          {
            id: uuidv4(),
            role: "user" as const,
            content: "Generate notes on sorting algorithms",
            timestamp: new Date(Date.now() - 86400000),
          },
          {
            id: uuidv4(),
            role: "assistant" as const,
            content:
              "✨ **Generated Notes on 'sorting algorithms'**\n\nI've created notes content for you. Here's a preview:\n\n# Notes on Sorting Algorithms\n\n## Overview\nSorting algorithms arrange elements in a specific order, typically ascending or descending.\n\n## Key Points\n1. **Definition**: Understanding sorting algorithms\n2. **Applications**: Database indexing, search optimization\n3. **Common Algorithms**:\n   - Bubble Sort: O(n²)\n   - Merge Sort: O(n log n)\n   - Quick Sort: O(n log n) average\n   - Heap Sort: O(n log n)\n\n💡 _This content is AI-generated and should be reviewed with course materials._\n\nWould you like me to expand on any particular section?",
            timestamp: new Date(Date.now() - 86390000),
          },
        ],
      },
      {
        userId: "admin-user",
        title: "Graph Traversal Help",
        messages: [
          {
            id: uuidv4(),
            role: "user" as const,
            content: "What's the difference between BFS and DFS?",
            timestamp: new Date(Date.now() - 172800000),
          },
          {
            id: uuidv4(),
            role: "assistant" as const,
            content:
              "**Graph Traversal: BFS vs DFS**\n\n📖 **Breadth-First Search (BFS)**\n- Explores neighbors first before going deeper\n- Uses a Queue data structure\n- Good for finding shortest path in unweighted graphs\n- Memory: O(V) where V is vertices\n\n📖 **Depth-First Search (DFS)**\n- Explores as far as possible before backtracking\n- Uses a Stack (or recursion)\n- Good for detecting cycles, topological sorting\n- Memory: O(h) where h is height\n\n💡 **Tip**: BFS is great for finding shortest paths in unweighted graphs, while DFS is useful for detecting cycles and topological sorting.",
            timestamp: new Date(Date.now() - 172790000),
          },
        ],
      },
      {
        userId: "student-user-001",
        title: "Help with Dynamic Prog...",
        messages: [
          {
            id: uuidv4(),
            role: "user" as const,
            content: "I need help with dynamic programming",
            timestamp: new Date(Date.now() - 259200000),
          },
          {
            id: uuidv4(),
            role: "assistant" as const,
            content:
              "**Dynamic Programming**\n\n📖 **Overview**\nDynamic programming (DP) is an optimization technique that solves complex problems by breaking them into smaller subproblems.\n\n📋 **Key Concepts**\n1. **Overlapping Subproblems**: Same subproblems solved multiple times\n2. **Optimal Substructure**: Optimal solution contains optimal solutions to subproblems\n3. **Memoization**: Top-down approach, store computed results\n4. **Tabulation**: Bottom-up approach, build solution iteratively\n\n💡 **Tips**\n- Identify if problem has optimal substructure\n- Look for overlapping subproblems\n- Start with recursion, then optimize\n\nWould you like me to go through a specific DP problem?",
            timestamp: new Date(Date.now() - 259190000),
          },
        ],
      },
    ];

    console.log("💬 Creating chat sessions...");
    const createdSessions = await ChatSessionModel.insertMany(chatSessions);
    console.log(`✅ Created ${createdSessions.length} chat sessions\n`);

    // Display summary
    console.log("==================================================");
    console.log("✨ CHAT DATA SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
    console.log("📊 Summary:");
    console.log(`   - Chat Sessions: ${createdSessions.length}`);
    console.log(`   - Total Messages: ${chatSessions.reduce((acc, s) => acc + s.messages.length, 0)}`);
    console.log("==================================================\n");

    // Display sample sessions
    console.log("📋 Chat Sessions Created:");
    createdSessions.forEach((session, index) => {
      console.log(`${index + 1}. "${session.title}"`);
      console.log(`   - User: ${session.userId}`);
      console.log(`   - Messages: ${session.messages.length}`);
      console.log(`   - Session ID: ${session._id}`);
      console.log("");
    });

    console.log("✅ Chat data has been successfully inserted into the database!");
    console.log("🔍 You can verify by calling the chat API endpoints\n");

    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedChatData();
