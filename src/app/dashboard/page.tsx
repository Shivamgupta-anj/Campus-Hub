"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  CheckCircle2,
  Heart,
  MessageSquare,
  PlusCircle,
  Eye,
  ArrowRight,
  Loader2,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IListing } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [myListings, setMyListings] = useState<IListing[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadDashboardData() {
      if (!user) return;
      setIsLoading(true);
      try {
        // Fetch user's listings
        const listingsRes = await fetch(`/api/listings?sellerId=${user.id}&status=all`);
        if (listingsRes.ok) {
          const data = await listingsRes.json();
          setMyListings(data.listings || []);
        }

        // Fetch saved count
        const savedRes = await fetch("/api/saved");
        if (savedRes.ok) {
          const data = await savedRes.json();
          setSavedCount(data.total || 0);
        }

        // Fetch chats count
        const chatsRes = await fetch("/api/chats");
        if (chatsRes.ok) {
          const data = await chatsRes.json();
          setChatsCount(data.conversations?.length || 0);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Loading student dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const activeCount = myListings.filter((l) => l.status === "active").length;
  const soldCount = myListings.filter((l) => l.status === "sold").length;
  const totalViews = myListings.reduce((sum, l) => sum + (l.views || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Profile Greeting */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-black text-white shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Welcome back, {user.name}!
                </h1>
                <Badge variant="emerald" size="sm">
                  {user.role}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                {user.college}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/listings/create">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="h-4 w-4" />}
              >
                Create Listing
              </Button>
            </Link>
            <Link href="/profile/edit">
              <Button variant="outline" size="md">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Listings
            </span>
            <Package className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Items Sold
            </span>
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {soldCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saved Wishlist
            </span>
            <Heart className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {savedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Listing Views
            </span>
            <Eye className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {totalViews}
          </p>
        </div>
      </div>

      {/* QUICK LINKS & MY LISTINGS TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listings column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              My Active Listings
            </h2>
            <Link
              href="/my-listings"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Manage all ({myListings.length})
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {myListings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <Package className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-xs font-medium text-slate-500">
                You haven&apos;t posted any marketplace listings yet.
              </p>
              <Link href="/listings/create" className="mt-4 inline-block">
                <Button size="sm" variant="primary">
                  Post Your First Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.slice(0, 4).map((listing) => (
                <div
                  key={listing._id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-500 dark:bg-slate-800">
                      ₹
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/listings/${listing._id}`}
                        className="block truncate text-sm font-bold text-slate-900 hover:text-emerald-600 dark:text-white"
                      >
                        {listing.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-semibold text-emerald-600">
                          ₹{listing.price}
                        </span>
                        <span>•</span>
                        <Badge
                          variant={listing.status === "active" ? "emerald" : "rose"}
                          size="sm"
                        >
                          {listing.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/listings/${listing._id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions & messaging shortcut (1 col) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <Link
              href="/messages"
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Messages & Chats
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {chatsCount} active peer conversations
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/saved"
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Saved Wishlist
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {savedCount} items bookmarked
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/profile"
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Public Profile
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Review your campus badge
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
