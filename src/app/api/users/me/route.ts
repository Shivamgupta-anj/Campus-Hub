import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
    console.error("Get profile error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.safeParse(body);

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

    // Only allow updating allowed profile fields. NEVER role, status, email, or passwordHash here!
    const allowedUpdates = validatedData.data;

    if (allowedUpdates.name !== undefined) user.name = allowedUpdates.name;
    if (allowedUpdates.college !== undefined) user.college = allowedUpdates.college;
    if (allowedUpdates.course !== undefined) user.course = allowedUpdates.course;
    if (allowedUpdates.branch !== undefined) user.branch = allowedUpdates.branch;
    if (allowedUpdates.academicYear !== undefined) user.academicYear = allowedUpdates.academicYear;
    if (allowedUpdates.bio !== undefined) user.bio = allowedUpdates.bio;
    if (allowedUpdates.phoneNumber !== undefined) user.phoneNumber = allowedUpdates.phoneNumber;
    if (allowedUpdates.profileImage !== undefined) user.profileImage = allowedUpdates.profileImage;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
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
      },
    });
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
