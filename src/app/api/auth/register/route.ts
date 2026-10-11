import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, college, course, branch, academicYear } = validatedData.data;

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user with student role strictly enforced
    const user = await User.create({
      name,
      email,
      passwordHash,
      college,
      course,
      branch,
      academicYear,
      role: "student",
      status: "active",
    });

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      college: user.college,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          college: user.college,
          course: user.course,
          branch: user.branch,
          academicYear: user.academicYear,
          role: user.role,
          status: user.status,
        },
        token,
      },
      { status: 201 }
    );

    // Set secure HttpOnly cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error during registration",
      },
      { status: 500 }
    );
  }
}
