import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Report from "@/models/Report";
import { getAuthenticatedUser } from "@/lib/auth";
import { reportCreateSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = reportCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const report = await Report.create({
      reporterId: user._id,
      targetType: validated.data.targetType,
      targetId: validated.data.targetId,
      reason: validated.data.reason,
      description: validated.data.description || "",
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully. Campus administrators will review it.",
        report,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Submit report error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit report" }, { status: 500 });
  }
}
