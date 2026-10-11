import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SavedListing from "@/models/SavedListing";
import Listing from "@/models/Listing";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: true, saved: false });
    }

    const { id } = await params;
    await connectToDatabase();

    const existing = await SavedListing.findOne({
      userId: user._id,
      listingId: id,
    });

    return NextResponse.json({
      success: true,
      saved: !!existing,
    });
  } catch (error: unknown) {
    console.error("Check saved status error:", error);
    return NextResponse.json({ success: false, error: "Failed to check saved status" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    const existing = await SavedListing.findOne({
      userId: user._id,
      listingId: id,
    });

    if (existing) {
      await SavedListing.findByIdAndDelete(existing._id);
      return NextResponse.json({
        success: true,
        saved: false,
        message: "Removed from saved listings",
      });
    } else {
      await SavedListing.create({
        userId: user._id,
        listingId: id,
      });
      return NextResponse.json({
        success: true,
        saved: true,
        message: "Added to saved listings",
      });
    }
  } catch (error: unknown) {
    console.error("Toggle save listing error:", error);
    return NextResponse.json({ success: false, error: "Failed to toggle save" }, { status: 500 });
  }
}
