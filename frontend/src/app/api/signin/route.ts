import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, initializeDefaultUsers } from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "formula-one-learning-platform-secret-key-2026";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Initialize default users if needed
    await initializeDefaultUsers();

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Find user by email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data and token
    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl || "/images/avatars/default.png",
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
