import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getAuthenticatedUser } from "@/lib/auth";
import { messageCreateSchema } from "@/lib/validations";

export async function GET(
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

    const conversation = await Conversation.findById(id)
      .populate("participants", "name email college profileImage")
      .populate("listingId", "title price images status college")
      .lean();

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => (p._id || p).toString() === user._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Fetch messages
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .populate("senderId", "name profileImage")
      .lean();

    // Mark unread messages sent by others as read
    await Message.updateMany(
      {
        conversationId: conversation._id,
        senderId: { $ne: user._id },
        readAt: { $exists: false },
      },
      {
        readAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error: unknown) {
    console.error("Get messages error:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve messages" }, { status: 500 });
  }
}

export async function POST(
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
    const validated = messageCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === user._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not a participant in this conversation" },
        { status: 403 }
      );
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: user._id,
      text: validated.data.text,
    });

    // Update conversation last message
    conversation.lastMessage = validated.data.text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate("senderId", "name profileImage")
      .lean();

    return NextResponse.json({
      success: true,
      message: populated,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("Send message error:", error);
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
