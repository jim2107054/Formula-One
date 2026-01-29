// Script to verify database content
import * as dotenv from "dotenv";
import * as path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { ContentModel } from "../models/content.model";
import { CategoryModel } from "../models/category.model";
import { TagModel } from "../models/tag.model";

async function verifyDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB\n");

    // Get counts
    const contentCount = await ContentModel.countDocuments();
    const categoryCount = await CategoryModel.countDocuments();
    const tagCount = await TagModel.countDocuments();
    const theoryCount = await ContentModel.countDocuments({ category: "theory" });
    const labCount = await ContentModel.countDocuments({ category: "lab" });

    console.log("==================================================");
    console.log("📊 DATABASE VERIFICATION");
    console.log("==================================================");
    console.log(`Total Content Items: ${contentCount}`);
    console.log(`  - Theory Materials: ${theoryCount}`);
    console.log(`  - Lab Materials: ${labCount}`);
    console.log(`Total Categories: ${categoryCount}`);
    console.log(`Total Tags: ${tagCount}`);
    console.log("==================================================\n");

    // Get sample theory content
    console.log("📚 THEORY MATERIALS:");
    const theoryMaterials = await ContentModel.find({ category: "theory" })
      .limit(5)
      .select("title metadata category");
    
    theoryMaterials.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   Topic: ${item.metadata.topic}`);
      console.log(`   Week: ${item.metadata.week}`);
      console.log(`   Type: ${item.metadata.contentType}`);
      console.log(`   ID: ${item._id}`);
      console.log("");
    });

    // Get sample lab content
    console.log("🧪 LAB MATERIALS:");
    const labMaterials = await ContentModel.find({ category: "lab" })
      .limit(5)
      .select("title metadata category");
    
    labMaterials.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   Topic: ${item.metadata.topic}`);
      console.log(`   Week: ${item.metadata.week}`);
      console.log(`   Type: ${item.metadata.contentType}`);
      console.log(`   ID: ${item._id}`);
      console.log("");
    });

    // Get categories
    console.log("📁 CATEGORIES:");
    const categories = await CategoryModel.find().select("title slug");
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.title} (${cat.slug})`);
    });
    console.log("");

    // Get tags
    console.log("🏷️  TAGS:");
    const tags = await TagModel.find().select("title color");
    tags.forEach((tag, index) => {
      console.log(`${index + 1}. ${tag.title} (${tag.color})`);
    });
    console.log("");

    console.log("==================================================");
    console.log("✅ DATABASE VERIFICATION COMPLETE");
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

verifyDatabase();
