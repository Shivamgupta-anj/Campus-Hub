"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { ListingCard } from "@/components/ui/ListingCard";
import { Button } from "@/components/ui/Button";
import { IListing } from "@/types";

export default function SavedListingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [savedListings, setSavedListings] = useState<IListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadSaved() {
      if (!user) return;
      setIsLoading(true);
      try {
        const res = await fetch("/api/saved");
        if (res.ok) {
          const data = await res.json();
          setSavedListings(data.listings || []);
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadSaved();
    }
  }, [user, authLoading, router]);

  const handleRemove = (listingId: string) => {
    setSavedListings((prev) => prev.filter((item) => item._id !== listingId));
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Loading saved items...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
          <Heart className="h-4 w-4 fill-rose-600" />
          Wishlist
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Saved Listings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {savedListings.length} products saved for future reference
        </p>
      </div>

      {savedListings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Heart className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            Your wishlist is empty
          </h3>
          <p className="mt-1 max-w-sm mx-auto text-xs text-slate-500">
            Click the heart icon on any listing card to save items you want to keep an eye on.
          </p>
          <Link href="/marketplace" className="mt-6 inline-block">
            <Button size="sm" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedListings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              initialSaved={true}
              onSaveToggle={(saved) => {
                if (!saved) handleRemove(listing._id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
