import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all content items or filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // "theory" or "lab"
    const topic = searchParams.get("topic");
    const week = searchParams.get("week");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const { db } = await connectToDatabase();
    const contentCollection = db.collection("content");

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (category) query.category = category;
    if (topic) query.topic = topic;
    if (week) query.week = parseInt(week);
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const total = await contentCollection.countDocuments(query);
    const items = await contentCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: items.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      content,
      category, // "theory" or "lab"
      type, // "slide", "pdf", "code", "note", "reference"
      topic,
      week,
      tags = [],
      fileUrl,
      language, // for code files
    } = body;

    if (!title || !category || !type) {
      return NextResponse.json(
        { success: false, error: "Title, category, and type are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const contentCollection = db.collection("content");

    const newContent = {
      title,
      description: description || "",
      content: content || "",
      category,
      type,
      topic: topic || "",
      week: week || null,
      tags,
      fileUrl: fileUrl || null,
      language: language || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await contentCollection.insertOne(newContent);

    return NextResponse.json({
      success: true,
      data: {
        ...newContent,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Create content error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Content ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const contentCollection = db.collection("content");

    const result = await contentCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update content error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Content ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const contentCollection = db.collection("content");

    const result = await contentCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete content error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
