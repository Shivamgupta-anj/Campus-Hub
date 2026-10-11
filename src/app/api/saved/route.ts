import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SavedListing from "@/models/SavedListing";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const savedItems = await SavedListing.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "listingId",
        populate: {
          path: "sellerId",
          select: "name college course profileImage",
        },
      })
      .lean();

    // Filter out any items where the listing was deleted
    const validSaved = savedItems
      .filter((item) => item.listingId)
      .map((item) => item.listingId);

    return NextResponse.json({
      success: true,
      listings: validSaved,
      total: validSaved.length,
    });
  } catch (error: unknown) {
    console.error("Fetch saved listings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch saved listings" }, { status: 500 });
  }
}
