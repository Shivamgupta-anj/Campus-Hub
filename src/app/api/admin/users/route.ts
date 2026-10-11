import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (role && role !== "all") filter.role = role;
    if (status && status !== "all") filter.status = status;
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { email: regex }, { college: regex }];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminUser = await getAuthenticatedUser(request);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !["active", "suspended"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status parameters" }, { status: 400 });
    }

    // Protect super admin from self-suspension
    if (userId === adminUser._id.toString()) {
      return NextResponse.json({ success: false, error: "Admins cannot suspend their own account" }, { status: 400 });
    }

    await connectToDatabase();
    const targetUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select("-passwordHash");

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User status changed to ${status}`,
      user: targetUser,
    });
  } catch (error: unknown) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update user status" }, { status: 500 });
  }
}
