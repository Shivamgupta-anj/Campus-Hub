import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Report from "@/models/Report";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reporterId", "name email college")
        .lean(),
      Report.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Admin reports fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, status, adminNotes } = body;

    if (!reportId || !["pending", "reviewed", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status parameters" }, { status: 400 });
    }

    await connectToDatabase();
    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
      { new: true }
    );

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Report status updated to ${status}`,
      report,
    });
  } catch (error: unknown) {
    console.error("Admin update report error:", error);
    return NextResponse.json({ success: false, error: "Failed to update report" }, { status: 500 });
  }
}
