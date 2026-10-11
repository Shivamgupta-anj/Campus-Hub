"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin } from "lucide-react";
import { IListing, IUser } from "@/types";
import { Badge } from "./Badge";
import { useAuth } from "../auth/AuthContext";

interface ListingCardProps {
  listing: IListing;
  initialSaved?: boolean;
  onSaveToggle?: (saved: boolean) => void;
}

export function ListingCard({ listing, initialSaved = false, onSaveToggle }: ListingCardProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isTogglingSave, setIsTogglingSave] = useState(false);

  const conditionColors: Record<string, "emerald" | "blue" | "amber" | "slate"> = {
    "Brand New": "emerald",
    "Like New": "blue",
    Good: "slate",
    Fair: "amber",
  };

  const seller = typeof listing.sellerId === "object" ? (listing.sellerId as IUser) : null;
  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images[0]
    : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80";

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setIsTogglingSave(true);
    try {
      const res = await fetch(`/api/listings/${listing._id}/save`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
        if (onSaveToggle) {
          onSaveToggle(data.saved);
        }
      }
    } catch (err) {
      console.error("Save listing toggle failed:", err);
    } finally {
      setIsTogglingSave(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/80 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-700/60">
      {/* Image Area */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link href={`/listings/${listing._id}`} className="relative block h-full w-full">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        </Link>

        {/* Status Overlay */}
        {listing.status === "sold" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs">
            <span className="rounded-full bg-rose-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              Sold
            </span>
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={conditionColors[listing.condition] || "slate"} size="sm">
            {listing.condition}
          </Badge>
        </div>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleToggleSave}
          disabled={isTogglingSave}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-all duration-200 hover:scale-110 active:scale-95 dark:bg-slate-900/90 ${
            isSaved
              ? "text-rose-500"
              : "text-slate-500 hover:text-rose-500 dark:text-slate-400"
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-rose-500" : ""}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
            ₹{listing.price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
            {listing.category}
          </span>
        </div>

        <Link href={`/listings/${listing._id}`} className="mt-2 block">
          <h3 className="line-clamp-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
            {listing.title}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {listing.description}
        </p>

        {/* Footer Meta */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 truncate max-w-[170px]" title={listing.college}>
              <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
              <span className="truncate">{listing.college.split("(")[0].trim()}</span>
            </span>
            {seller && (
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                {seller.name.split(" ")[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
