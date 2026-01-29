import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "formula-one-learning-platform-secret-key-2026";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: number };

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Find user
    const { ObjectId } = await import("mongodb");
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl || "/images/avatars/default.png",
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid token" },
      { status: 401 }
    );
  }
}
