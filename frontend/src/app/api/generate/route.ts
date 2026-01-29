import { NextRequest, NextResponse } from "next/server";
import { generateLearningMaterial } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { topic, type, format, language } = await request.json();

    if (!topic || !type) {
      return NextResponse.json(
        { success: false, error: "Topic and type are required" },
        { status: 400 }
      );
    }

    const content = await generateLearningMaterial({
      topic,
      type,
      format: format || "notes",
      language: language || "python",
    });

    return NextResponse.json({
      success: true,
      data: {
        topic,
        type,
        format: format || "notes",
        content,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Generate content error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
