import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "formula-one-learning-platform-secret-key-2026";

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password, role = 0 } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      username: username || email.split("@")[0],
      name,
      email,
      password, // In production, hash this
      role,
      imageUrl: "/images/avatars/default.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email,
        role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: result.insertedId.toString(),
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        imageUrl: newUser.imageUrl,
      },
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
