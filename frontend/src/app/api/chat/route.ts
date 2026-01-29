import { NextRequest, NextResponse } from "next/server";
import { chatWithAssistant } from "@/lib/openai";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { messages, includeContext = true } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get context from course materials if requested
    let context = "";
    if (includeContext) {
      try {
        const { db } = await connectToDatabase();
        const contentCollection = db.collection("content");
        
        // Get recent content for context
        const recentContent = await contentCollection
          .find({})
          .sort({ updatedAt: -1 })
          .limit(5)
          .toArray();

        context = recentContent
          .map((item) => `Title: ${item.title}\nTopic: ${item.topic}\nDescription: ${item.description}`)
          .join("\n\n");
      } catch {
        // Continue without context if DB fails
      }
    }

    const response = await chatWithAssistant(messages, context);

    return NextResponse.json({
      success: true,
      data: {
        message: response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

// Save chat history
export async function PUT(request: NextRequest) {
  try {
    const { userId, messages, sessionId } = await request.json();

    const { db } = await connectToDatabase();
    const chatCollection = db.collection("chat_history");

    await chatCollection.updateOne(
      { sessionId },
      {
        $set: {
          userId,
          messages,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save chat" },
      { status: 500 }
    );
  }
}

// Get chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    const { db } = await connectToDatabase();
    const chatCollection = db.collection("chat_history");

    if (sessionId) {
      const chat = await chatCollection.findOne({ sessionId });
      return NextResponse.json({ success: true, data: chat });
    }

    if (userId) {
      const chats = await chatCollection
        .find({ userId })
        .sort({ updatedAt: -1 })
        .limit(20)
        .toArray();
      return NextResponse.json({ success: true, data: chats });
    }

    return NextResponse.json(
      { success: false, error: "userId or sessionId required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get chat history" },
      { status: 500 }
    );
  }
}
