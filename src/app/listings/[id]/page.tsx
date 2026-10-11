"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Heart,
  ShieldAlert,
  MapPin,
  Calendar,
  Eye,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Edit,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ListingCard } from "@/components/ui/ListingCard";
import { IListing, IUser } from "@/types";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [listing, setListing] = useState<IListing | null>(null);
  const [relatedListings, setRelatedListings] = useState<IListing[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (res.ok) {
          const data = await res.json();
          setListing(data.listing);
          setRelatedListings(data.relatedListings || []);
          if (data.listing.images && data.listing.images.length > 0) {
            setSelectedImage(data.listing.images[0]);
          }
        }

        // Check if saved
        const saveRes = await fetch(`/api/listings/${id}/save`);
        if (saveRes.ok) {
          const saveData = await saveRes.json();
          setIsSaved(saveData.saved);
        }
      } catch (err) {
        console.error("Failed to load listing details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleToggleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/listings/${id}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      }
    } catch (err) {
      console.error("Save toggle error:", err);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!listing) return;

    setIsStartingChat(true);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing._id,
          initialMessage: `Hi! I'm interested in "${listing.title}". Is it still available?`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/messages?conversationId=${data.conversationId}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to start chat");
      }
    } catch (err) {
      console.error("Chat initiation error:", err);
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmittingReport(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "listing",
          targetId: id,
          reason: reportReason,
          description: reportDescription,
        }),
      });

      if (res.ok) {
        setReportSuccessMessage("Report received. Campus administrators have been notified.");
        setTimeout(() => {
          setIsReportModalOpen(false);
          setReportSuccessMessage("");
          setReportReason("");
          setReportDescription("");
        }, 1500);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit report");
      }
    } catch (err) {
      console.error("Submit report error:", err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Loading item specifications...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Listing not found</h2>
        <p className="mt-2 text-xs text-slate-500">This item may have been removed or sold by the owner.</p>
        <Link href="/marketplace" className="mt-6 inline-block">
          <Button variant="outline" size="sm">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const seller = typeof listing.sellerId === "object" ? (listing.sellerId as IUser) : null;
  const isOwner = user && seller && user.id === seller._id.toString();

  const conditionColors: Record<string, "emerald" | "blue" | "amber" | "slate"> = {
    "Brand New": "emerald",
    "Like New": "blue",
    Good: "slate",
    Fair: "amber",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb / Back button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* LEFT COLUMN: IMAGE GALLERY (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-md dark:border-slate-800 dark:bg-slate-900">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={listing.title}
                fill
                priority
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                No image provided
              </div>
            )}

            {listing.status === "sold" && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
                <span className="rounded-full bg-rose-600 px-6 py-2 text-sm font-extrabold uppercase tracking-widest text-white shadow-lg">
                  Sold
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {listing.images && listing.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {listing.images.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    selectedImage === imgUrl
                      ? "border-emerald-600 shadow-md"
                      : "border-slate-200 opacity-70 hover:opacity-100 dark:border-slate-800"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAILS & ACTIONS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={conditionColors[listing.condition] || "slate"}>
                  {listing.condition}
                </Badge>
                <Badge variant="slate" className="uppercase">
                  {listing.category}
                </Badge>
              </div>

              <button
                onClick={handleToggleSave}
                aria-label="Save listing"
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                  isSaved
                    ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <Heart className={`h-5 w-5 ${isSaved ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {listing.title}
            </h1>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{listing.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400">fixed student price</span>
            </div>
          </div>

          {/* College location tag & Views */}
          <div className="flex flex-wrap items-center gap-4 py-3 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <MapPin className="h-4 w-4 text-emerald-600" />
              {listing.college}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {listing.views} views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Listed on {new Date(listing.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Description
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* SELLER CARD */}
          {seller && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                    {seller.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {seller.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {seller.course} • {seller.branch}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium">
                      {seller.academicYear}
                    </p>
                  </div>
                </div>

                <Link href={`/profile/${seller._id.toString()}`}>
                  <Button variant="outline" size="sm" leftIcon={<UserIcon className="h-3.5 w-3.5" />}>
                    Profile
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* PRIMARY ACTIONS */}
          <div className="space-y-3 pt-2">
            {isOwner ? (
              <div className="flex flex-col gap-2">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                  You are the owner of this listing.
                </div>
                <div className="flex gap-2">
                  <Link href={`/listings/${listing._id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full" leftIcon={<Edit className="h-4 w-4" />}>
                      Edit Listing
                    </Button>
                  </Link>
                  <Link href="/my-listings" className="flex-1">
                    <Button variant="secondary" className="w-full">
                      Manage Status
                    </Button>
                  </Link>
                </div>
              </div>
            ) : listing.status === "sold" ? (
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 text-center text-xs text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                This item has already been marked as sold.
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isStartingChat}
                onClick={handleStartChat}
                leftIcon={<MessageSquare className="h-5 w-5" />}
              >
                Chat with Seller
              </Button>
            )}

            {/* Report Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Report listing for moderation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED LISTINGS */}
      {relatedListings.length > 0 && (
        <section className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              More Like This
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Related Items in {listing.category}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedListings.map((rel) => (
              <ListingCard key={rel._id.toString()} listing={rel} />
            ))}
          </div>
        </section>
      )}

      {/* REPORT MODAL */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Listing"
      >
        {reportSuccessMessage ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              {reportSuccessMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <p className="text-xs text-slate-500">
              Help keep CampusHub safe and trustworthy. Our student moderation team will investigate this listing.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                Reason
              </label>
              <select
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Select a violation reason</option>
                <option value="Prohibited or dangerous item">Prohibited or dangerous item</option>
                <option value="Duplicate or spam listing">Duplicate or spam listing</option>
                <option value="Suspected fraudulent / scam price">Suspected fraudulent / scam price</option>
                <option value="Incorrect or misleading condition">Incorrect or misleading condition</option>
                <option value="Inappropriate imagery or language">Inappropriate imagery or language</option>
                <option value="Other">Other violation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                Details (Optional)
              </label>
              <textarea
                rows={3}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Explain the issue briefly..."
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={isSubmittingReport}
              >
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
