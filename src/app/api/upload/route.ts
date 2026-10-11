import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getAuthenticatedUser } from "@/lib/auth";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "File exceeds 5MB limit" },
          { status: 400 }
        );
      }

      const mimeType = file.type.toLowerCase();
      const extension = ALLOWED_MIME_TYPES[mimeType];

      if (!extension) {
        return NextResponse.json(
          { success: false, error: "Invalid image format. Allowed: JPG, PNG, WEBP, GIF" },
          { status: 400 }
        );
      }

      const randomBytes = crypto.randomBytes(16).toString("hex");
      const filename = `item-${Date.now()}-${randomBytes}.${extension}`;
      const filePath = path.join(uploadsDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
      });
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      const { dataUrl } = body;

      if (!dataUrl || typeof dataUrl !== "string") {
        return NextResponse.json({ success: false, error: "Invalid image data" }, { status: 400 });
      }

      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ success: false, error: "Invalid base64 image data" }, { status: 400 });
      }

      const mimeType = matches[1].toLowerCase();
      const extension = ALLOWED_MIME_TYPES[mimeType];
      if (!extension) {
        return NextResponse.json({ success: false, error: "Unsupported image type" }, { status: 400 });
      }

      const buffer = Buffer.from(matches[2], "base64");
      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: "Image exceeds 5MB limit" }, { status: 400 });
      }

      const randomBytes = crypto.randomBytes(16).toString("hex");
      const filename = `item-${Date.now()}-${randomBytes}.${extension}`;
      const filePath = path.join(uploadsDir, filename);

      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
      });
    }

    return NextResponse.json({ success: false, error: "Unsupported content type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 });
  }
}
