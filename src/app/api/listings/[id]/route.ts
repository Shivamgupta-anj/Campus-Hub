import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { getAuthenticatedUser } from "@/lib/auth";
import { listingUpdateSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Increment views atomically
    const listing = await Listing.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("sellerId", "name email college course branch academicYear profileImage bio createdAt")
      .lean();

    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    // Fetch up to 4 related listings from the same category or college
    const relatedListings = await Listing.find({
      _id: { $ne: listing._id },
      category: listing.category,
      status: "active",
    })
      .limit(4)
      .populate("sellerId", "name college")
      .lean();

    return NextResponse.json({
      success: true,
      listing,
      relatedListings,
    });
  } catch (error: unknown) {
    console.error("Get listing error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch listing" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    // Check ownership or admin
    const isOwner = listing.sellerId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to edit this listing" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = listingUpdateSchema.safeParse(body);

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

    Object.assign(listing, validatedData.data);
    await listing.save();

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully",
      listing,
    });
  } catch (error: unknown) {
    console.error("Update listing error:", error);
    return NextResponse.json({ success: false, error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    const isOwner = listing.sellerId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to delete this listing" },
        { status: 403 }
      );
    }

    await Listing.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete listing error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete listing" }, { status: 500 });
  }
}
