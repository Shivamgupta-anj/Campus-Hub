import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: regex }, { description: regex }, { category: regex }, { college: regex }];
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sellerId", "name email college status")
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Admin listings fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { listingId, status } = body;

    if (!listingId || !["active", "sold", "removed"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid request parameters" }, { status: 400 });
    }

    await connectToDatabase();
    const listing = await Listing.findByIdAndUpdate(listingId, { status }, { new: true });

    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Listing status updated to ${status}`,
      listing,
    });
  } catch (error: unknown) {
    console.error("Admin update listing error:", error);
    return NextResponse.json({ success: false, error: "Failed to update listing" }, { status: 500 });
  }
}
