import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        college: user.college,
        course: user.course,
        branch: user.branch,
        academicYear: user.academicYear,
        profileImage: user.profileImage,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve authenticated user",
      },
      { status: 500 }
    );
  }
}
