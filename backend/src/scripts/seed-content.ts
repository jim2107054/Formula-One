/**
 * Database Seeder for CMS Content
 * Run with: ts-node src/scripts/seed-content.ts
 * Or: npm run seed:content
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { ContentModel } from "../models/content.model";
import { CategoryModel } from "../models/category.model";
import { TagModel } from "../models/tag.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/formula-one";

// Sample content data
const theoryContent = [
  {
    title: "Introduction to Data Structures",
    description: "Learn the fundamentals of data structures including arrays, linked lists, stacks, and queues. This comprehensive guide covers basic concepts and their real-world applications.",
    category: "theory" as const,
    metadata: {
      topic: "Data Structures",
      week: 1,
      tags: ["data-structures", "fundamentals", "arrays", "linked-lists"],
      contentType: "slides" as const,
    },
    filePath: "/uploads/theory/intro-data-structures.pdf",
    fileName: "intro-data-structures.pdf",
  },
  {
    title: "Algorithm Analysis and Big O Notation",
    description: "Understanding time and space complexity, Big O notation, and how to analyze algorithm efficiency. Includes examples and practice problems.",
    category: "theory" as const,
    metadata: {
      topic: "Algorithms",
      week: 2,
      tags: ["algorithms", "big-o", "complexity", "analysis"],
      contentType: "pdf" as const,
    },
    filePath: "/uploads/theory/big-o-notation.pdf",
    fileName: "big-o-notation.pdf",
  },
  {
    title: "Binary Trees and BST Complete Guide",
    description: "Comprehensive guide to binary trees, binary search trees, and tree traversal methods. Covers in-order, pre-order, and post-order traversals.",
    category: "theory" as const,
    metadata: {
      topic: "Trees",
      week: 3,
      tags: ["trees", "binary-trees", "bst", "traversal"],
      contentType: "slides" as const,
    },
    filePath: "/uploads/theory/binary-trees.pdf",
    fileName: "binary-trees.pdf",
  },
  {
    title: "Graph Algorithms Study Notes",
    description: "Detailed notes on BFS, DFS, Dijkstra's algorithm, and minimum spanning trees. Includes pseudocode and step-by-step explanations.",
    category: "theory" as const,
    metadata: {
      topic: "Graphs",
      week: 4,
      tags: ["graphs", "bfs", "dfs", "dijkstra", "algorithms"],
      contentType: "notes" as const,
    },
    filePath: "/uploads/theory/graph-algorithms-notes.md",
    fileName: "graph-algorithms-notes.md",
  },
  {
    title: "Dynamic Programming Fundamentals",
    description: "Introduction to dynamic programming, memoization, tabulation, and solving optimization problems. Real-world examples included.",
    category: "theory" as const,
    metadata: {
      topic: "Dynamic Programming",
      week: 5,
      tags: ["dynamic-programming", "dp", "memoization", "optimization"],
      contentType: "pdf" as const,
    },
    filePath: "/uploads/theory/dynamic-programming.pdf",
    fileName: "dynamic-programming.pdf",
  },
  {
    title: "Sorting Algorithms Reference",
    description: "Quick reference guide for all major sorting algorithms with complexity analysis. Covers bubble sort, merge sort, quick sort, and more.",
    category: "theory" as const,
    metadata: {
      topic: "Sorting",
      week: 2,
      tags: ["sorting", "algorithms", "complexity", "reference"],
      contentType: "notes" as const,
    },
    filePath: "/uploads/theory/sorting-reference.pdf",
    fileName: "sorting-reference.pdf",
  },
  {
    title: "Hash Tables and Hashing",
    description: "Complete guide to hash tables, hash functions, collision resolution, and performance characteristics.",
    category: "theory" as const,
    metadata: {
      topic: "Hashing",
      week: 3,
      tags: ["hashing", "hash-tables", "data-structures"],
      contentType: "slides" as const,
    },
    filePath: "/uploads/theory/hash-tables.pdf",
    fileName: "hash-tables.pdf",
  },
];

const labContent = [
  {
    title: "Linked List Implementation",
    description: "Complete implementation of singly and doubly linked lists with all operations. Includes insert, delete, search, and reverse operations.",
    category: "lab" as const,
    metadata: {
      topic: "Data Structures",
      week: 1,
      tags: ["linked-list", "implementation", "python", "lab"],
      contentType: "code" as const,
    },
    filePath: "/uploads/lab/linked_list.py",
    fileName: "linked_list.py",
  },
  {
    title: "Binary Search Tree Lab",
    description: "Hands-on lab implementing BST operations: insert, delete, search, and traversal methods. Includes test cases.",
    category: "lab" as const,
    metadata: {
      topic: "Trees",
      week: 3,
      tags: ["bst", "trees", "implementation", "python"],
      contentType: "code" as const,
    },
    filePath: "/uploads/lab/binary_search_tree.py",
    fileName: "binary_search_tree.py",
  },
  {
    title: "Sorting Algorithms Implementation",
    description: "Java implementation of bubble sort, merge sort, quick sort, and heap sort with performance benchmarks.",
    category: "lab" as const,
    metadata: {
      topic: "Sorting",
      week: 2,
      tags: ["sorting", "java", "algorithms", "implementation"],
      contentType: "code" as const,
    },
    filePath: "/uploads/lab/SortingAlgorithms.java",
    fileName: "SortingAlgorithms.java",
  },
  {
    title: "Graph Traversal Lab",
    description: "Implementation of BFS and DFS graph traversal algorithms with adjacency list representation.",
    category: "lab" as const,
    metadata: {
      topic: "Graphs",
      week: 4,
      tags: ["graphs", "bfs", "dfs", "traversal", "python"],
      contentType: "code" as const,
    },
    filePath: "/uploads/lab/graph_traversal.py",
    fileName: "graph_traversal.py",
  },
  {
    title: "Dynamic Programming Problems",
    description: "C++ solutions for classic DP problems: Fibonacci, Knapsack, LCS, and coin change.",
    category: "lab" as const,
    metadata: {
      topic: "Dynamic Programming",
      week: 5,
      tags: ["dp", "dynamic-programming", "cpp", "problems"],
      contentType: "code" as const,
    },
    filePath: "/uploads/lab/dynamic_programming.cpp",
    fileName: "dynamic_programming.cpp",
  },
  {
    title: "Hash Table Implementation Lab",
    description: "Build a hash table from scratch with collision handling using chaining and open addressing.",
    category: "lab" as const,
    metadata: {
      topic: "Hashing",
      week: 3,
      tags: ["hashing", "hash-table", "implementation", "typescript"],
      contentType: "code" as const,
    },
    filePath: "/uploads/lab/hash_table.ts",
    fileName: "hash_table.ts",
  },
];

// Categories
const categories = [
  {
    title: "Data Structures",
    slug: "data-structures",
    description: "Fundamental data structures and their implementations",
    is_published: true,
    order: 1,
  },
  {
    title: "Algorithms",
    slug: "algorithms",
    description: "Algorithm design and analysis",
    is_published: true,
    order: 2,
  },
  {
    title: "Trees",
    slug: "trees",
    description: "Tree-based data structures",
    is_published: true,
    order: 3,
  },
  {
    title: "Graphs",
    slug: "graphs",
    description: "Graph algorithms and applications",
    is_published: true,
    order: 4,
  },
  {
    title: "Dynamic Programming",
    slug: "dynamic-programming",
    description: "Dynamic programming techniques",
    is_published: true,
    order: 5,
  },
];

// Tags
const tags = [
  { title: "Fundamentals", slug: "fundamentals", is_published: true, color: "#3b82f6" },
  { title: "Arrays", slug: "arrays", is_published: true, color: "#10b981" },
  { title: "Linked Lists", slug: "linked-lists", is_published: true, color: "#8b5cf6" },
  { title: "Trees", slug: "trees", is_published: true, color: "#f59e0b" },
  { title: "Graphs", slug: "graphs", is_published: true, color: "#ef4444" },
  { title: "Sorting", slug: "sorting", is_published: true, color: "#06b6d4" },
  { title: "Searching", slug: "searching", is_published: true, color: "#ec4899" },
  { title: "Python", slug: "python", is_published: true, color: "#3776ab" },
  { title: "Java", slug: "java", is_published: true, color: "#007396" },
  { title: "C++", slug: "cpp", is_published: true, color: "#00599c" },
  { title: "TypeScript", slug: "typescript", is_published: true, color: "#3178c6" },
];

async function seedDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("\n🗑️  Clearing existing data...");
    await ContentModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await TagModel.deleteMany({});
    console.log("✅ Existing data cleared");

    // Insert categories
    console.log("\n📁 Creating categories...");
    const createdCategories = await CategoryModel.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Insert tags
    console.log("\n🏷️  Creating tags...");
    const createdTags = await TagModel.insertMany(tags);
    console.log(`✅ Created ${createdTags.length} tags`);

    // Insert theory content
    console.log("\n📚 Creating theory content...");
    const createdTheory = await ContentModel.insertMany(theoryContent);
    console.log(`✅ Created ${createdTheory.length} theory materials`);

    // Insert lab content
    console.log("\n🧪 Creating lab content...");
    const createdLab = await ContentModel.insertMany(labContent);
    console.log(`✅ Created ${createdLab.length} lab materials`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✨ DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Tags: ${createdTags.length}`);
    console.log(`   - Theory Materials: ${createdTheory.length}`);
    console.log(`   - Lab Materials: ${createdLab.length}`);
    console.log(`   - Total Content: ${createdTheory.length + createdLab.length}`);
    console.log("=".repeat(50));

    // Display sample data
    console.log("\n📋 Sample Theory Content:");
    createdTheory.slice(0, 3).forEach((content, index) => {
      console.log(`   ${index + 1}. ${content.title}`);
      console.log(`      - Topic: ${content.metadata.topic}`);
      console.log(`      - Week: ${content.metadata.week}`);
      console.log(`      - Type: ${content.metadata.contentType}`);
      console.log(`      - ID: ${content._id}`);
    });

    console.log("\n🧪 Sample Lab Content:");
    createdLab.slice(0, 3).forEach((content, index) => {
      console.log(`   ${index + 1}. ${content.title}`);
      console.log(`      - Topic: ${content.metadata.topic}`);
      console.log(`      - Week: ${content.metadata.week}`);
      console.log(`      - Type: ${content.metadata.contentType}`);
      console.log(`      - ID: ${content._id}`);
    });

    console.log("\n✅ Data has been successfully inserted into the database!");
    console.log("🔍 You can verify by accessing the API endpoints\n");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();
