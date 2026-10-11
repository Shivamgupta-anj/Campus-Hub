import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { getAuthenticatedUser } from "@/lib/auth";
import { listingCreateSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim();
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const condition = searchParams.get("condition")?.trim();
    const college = searchParams.get("college")?.trim();
    const sellerId = searchParams.get("sellerId")?.trim();
    const status = searchParams.get("status") || "active";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));

    await connectToDatabase();

    // Build filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (status !== "all") {
      filter.status = status;
    }

    if (sellerId) {
      filter.sellerId = sellerId;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (condition && condition !== "all") {
      filter.condition = condition;
    }

    if (college && college !== "all") {
      filter.college = college;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (q) {
      // Use regex for case-insensitive keyword matching across title and description
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: regex }, { description: regex }, { category: regex }];
    }

    // Sort order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortOptions: any = { createdAt: -1 };
    if (sort === "price-asc") {
      sortOptions = { price: 1, createdAt: -1 };
    } else if (sort === "price-desc") {
      sortOptions = { price: -1, createdAt: -1 };
    } else if (sort === "popular") {
      sortOptions = { views: -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("sellerId", "name college course branch academicYear profileImage")
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
    console.error("Listings fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to publish a listing" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = listingCreateSchema.safeParse(body);

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

    await connectToDatabase();

    const listing = await Listing.create({
      ...validatedData.data,
      sellerId: user._id,
      status: "active",
      views: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Listing published successfully",
        listing,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create listing",
      },
      { status: 500 }
    );
  }
}
