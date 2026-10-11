import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Report from "@/models/Report";
import Conversation from "@/models/Conversation";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();

    const [totalUsers, activeUsers, totalListings, activeListings, soldListings, pendingReports, totalChats] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: "active" }),
        Listing.countDocuments(),
        Listing.countDocuments({ status: "active" }),
        Listing.countDocuments({ status: "sold" }),
        Report.countDocuments({ status: "pending" }),
        Conversation.countDocuments(),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalListings,
        activeListings,
        soldListings,
        pendingReports,
        totalChats,
      },
    });
  } catch (error: unknown) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to load admin stats" }, { status: 500 });
  }
}
