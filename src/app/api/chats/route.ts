import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Listing from "@/models/Listing";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const conversations = await Conversation.find({
      participants: user._id,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("participants", "name email college profileImage")
      .populate("listingId", "title price images status college")
      .lean();

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error: unknown) {
    console.error("Fetch chats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, initialMessage } = body;

    if (!listingId) {
      return NextResponse.json({ success: false, error: "Listing ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    const sellerId = listing.sellerId.toString();
    const buyerId = user._id.toString();

    if (sellerId === buyerId) {
      return NextResponse.json(
        { success: false, error: "You cannot initiate a chat on your own listing" },
        { status: 400 }
      );
    }

    // Check if conversation already exists for this listing and buyer
    let conversation = await Conversation.findOne({
      listingId: listing._id,
      participants: { $all: [user._id, listing.sellerId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [user._id, listing.sellerId],
        listingId: listing._id,
        lastMessage: initialMessage || "Started a conversation",
        lastMessageAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation._id.toString(),
      conversation,
    });
  } catch (error: unknown) {
    console.error("Create chat error:", error);
    return NextResponse.json({ success: false, error: "Failed to initialize conversation" }, { status: 500 });
  }
}
