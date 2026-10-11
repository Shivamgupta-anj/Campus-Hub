"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  Send,
  Loader2,
  Package,
  ArrowLeft,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { IConversation, IMessage, IUser, IListing } from "@/types";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conversationId");
  const { user, isLoading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [activeConversation, setActiveConversation] = useState<IConversation | null>(null);

  const [newMessageText, setNewMessageText] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        const convs = data.conversations || [];
        setConversations(convs);

        if (!activeConversationId && convs.length > 0) {
          setActiveConversationId(convs[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoadingConvs(false);
    }
  }, [user, activeConversationId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchConversations();
    }
  }, [user, authLoading, router, fetchConversations]);

  // 2. Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    setIsLoadingMsgs(true);
    try {
      const res = await fetch(`/api/chats/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setActiveConversation(data.conversation || null);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId, fetchMessages]);

  // Periodic poll for new messages in active thread (every 4 seconds)
  useEffect(() => {
    if (!activeConversationId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chats/${activeConversationId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Poll messages error:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConversationId]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConversationId || isSending) return;

    const textToSend = newMessageText.trim();
    setNewMessageText("");
    setIsSending(true);

    try {
      const res = await fetch(`/api/chats/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        fetchConversations();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading || (isLoadingConvs && !conversations.length)) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Loading your conversations...</p>
      </div>
    );
  }

  // Helper to find peer user in conversation
  const getPeerUser = (conv: IConversation): IUser | null => {
    if (!user) return null;
    const peer = conv.participants.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => (p._id || p).toString() !== user.id
    );
    return typeof peer === "object" ? (peer as IUser) : null;
  };

  const activePeer = activeConversation ? getPeerUser(activeConversation) : null;
  const activeListing = activeConversation && typeof activeConversation.listingId === "object"
    ? (activeConversation.listingId as IListing)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex h-[calc(100vh-10rem)] min-h-[550px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {/* LEFT PANE: CONVERSATION LIST */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 ${
            activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Messages
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct discussions with campus buyers & sellers
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
                <p className="mt-3 text-xs text-slate-500">No conversations yet.</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Open any item in the marketplace and click &quot;Chat with Seller&quot;.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const peer = getPeerUser(conv);
                const listing = typeof conv.listingId === "object" ? (conv.listingId as IListing) : null;
                const isSelected = conv._id === activeConversationId;

                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setActiveConversationId(conv._id);
                      router.push(`/messages?conversationId=${conv._id}`);
                    }}
                    className={`w-full p-4 text-left transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-white shadow-xs border-l-4 border-emerald-600 dark:bg-slate-800"
                        : "hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                      {peer?.name?.charAt(0).toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {peer?.name || "Student"}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      {listing && (
                        <p className="truncate text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {listing.title} • ₹{listing.price}
                        </p>
                      )}

                      <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE CHAT THREAD */}
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${
            !activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="md:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                    {activePeer?.name?.charAt(0).toUpperCase() || "?"}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {activePeer?.name || "Student"}
                    </h3>
                    <p className="truncate text-xs text-slate-400">
                      {activePeer?.college} • {activePeer?.course}
                    </p>
                  </div>
                </div>

                {/* Listing Snapshot chip in chat header */}
                {activeListing && (
                  <Link
                    href={`/listings/${activeListing._id}`}
                    className="hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-800 transition"
                  >
                    <Package className="h-4 w-4 text-emerald-600" />
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[140px]">
                        {activeListing.title}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-extrabold">
                        ₹{activeListing.price}
                      </p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Message History Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
                {isLoadingMsgs ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-8">
                    <p className="text-xs text-slate-400">
                      This is the beginning of your conversation. Send a message to agree on price or meeting location!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const sender = typeof msg.senderId === "object" ? (msg.senderId as any) : null;
                    const senderId = sender ? sender._id.toString() : msg.senderId.toString();
                    const isMe = user && senderId === user.id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isMe
                              ? "bg-emerald-600 text-white rounded-br-xs"
                              : "bg-white text-slate-900 border border-slate-200 rounded-bl-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="mt-1 text-[10px] text-slate-400 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="border-t border-slate-200 p-3 sm:p-4 bg-white dark:border-slate-800 dark:bg-slate-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message (e.g. Can we meet near the canteen?)..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={!newMessageText.trim() || isSending}
                  isLoading={isSending}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Select a conversation
              </h3>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                Choose a chat from the left panel to coordinate meeting spots and prices with student peers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
