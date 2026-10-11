import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Listing from "@/models/Listing";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const user = await User.findById(id).select("-passwordHash");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Also fetch their active listings count
    const activeListingsCount = await Listing.countDocuments({
      sellerId: user._id,
      status: "active",
    });

    const soldListingsCount = await Listing.countDocuments({
      sellerId: user._id,
      status: "sold",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        college: user.college,
        course: user.course,
        branch: user.branch,
        academicYear: user.academicYear,
        profileImage: user.profileImage,
        bio: user.bio,
        createdAt: user.createdAt,
        stats: {
          activeListings: activeListingsCount,
          soldListings: soldListingsCount,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Get user profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve user" }, { status: 500 });
  }
}
