import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// GET all content for search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const contentCollection = db.collection("content");

    // Build search query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchQuery: any = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { topic: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    };

    if (category) {
      searchQuery.category = category;
    }

    const results = await contentCollection
      .find(searchQuery)
      .limit(20)
      .toArray();

    // Calculate relevance scores
    const scoredResults = results.map((item) => {
      let score = 0;
      const queryLower = query.toLowerCase();
      
      if (item.title?.toLowerCase().includes(queryLower)) score += 10;
      if (item.topic?.toLowerCase().includes(queryLower)) score += 8;
      if (item.description?.toLowerCase().includes(queryLower)) score += 5;
      if (item.content?.toLowerCase().includes(queryLower)) score += 3;
      if (item.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))) score += 4;

      return {
        ...item,
        _id: item._id.toString(),
        relevanceScore: score,
      };
    });

    // Sort by relevance
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      success: true,
      data: scoredResults,
      query,
      total: scoredResults.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
