import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { getAuthenticatedUser } from "@/lib/auth";

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
    const body = await request.json();
    const { status } = body;

    if (!["active", "sold", "removed"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    const isOwner = listing.sellerId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to update listing status" },
        { status: 403 }
      );
    }

    listing.status = status;
    await listing.save();

    return NextResponse.json({
      success: true,
      message: `Listing marked as ${status}`,
      listing,
    });
  } catch (error: unknown) {
    console.error("Listing status update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}
