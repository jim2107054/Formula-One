import { NextRequest, NextResponse } from "next/server";
import { validateCode } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { success: false, error: "Code and language are required" },
        { status: 400 }
      );
    }

    const validation = await validateCode(code, language);

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("Validate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
