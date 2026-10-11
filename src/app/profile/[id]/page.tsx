"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Package,
  CheckCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { ListingCard } from "@/components/ui/ListingCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IListing, IUser } from "@/types";

interface PublicUser extends IUser {
  stats?: {
    activeListings: number;
    soldListings: number;
  };
}

export default function PublicSellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [seller, setSeller] = useState<PublicUser | null>(null);
  const [listings, setListings] = useState<IListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [userRes, listingsRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/listings?sellerId=${id}&status=active`),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setSeller(userData.user);
        }

        if (listingsRes.ok) {
          const listData = await listingsRes.json();
          setListings(listData.listings || []);
        }
      } catch (err) {
        console.error("Failed to load seller public profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seller not found</h2>
        <Link href="/marketplace" className="mt-4 inline-block">
          <Button variant="outline" size="sm">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      {/* Seller Header Banner */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-28 bg-gradient-to-r from-emerald-600 to-teal-700" />

        <div className="p-6 sm:p-8 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-3xl font-black text-white shadow-lg dark:border-slate-900">
                {seller.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    {seller.name}
                  </h1>
                  <Badge variant="emerald" size="sm">
                    Verified Student
                  </Badge>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  {seller.college}
                </p>
              </div>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-center dark:border-slate-800 dark:bg-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Active</span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {seller.stats?.activeListings || listings.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-center dark:border-slate-800 dark:bg-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sold</span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {seller.stats?.soldListings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <span>
              <strong>Course:</strong> {seller.course} ({seller.branch})
            </span>
            <span>
              <strong>Year:</strong> {seller.academicYear}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Member since {new Date(seller.createdAt).toLocaleDateString()}
            </span>
          </div>

          {seller.bio && (
            <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 pt-4 dark:border-slate-800">
              {seller.bio}
            </p>
          )}
        </div>
      </div>

      {/* Seller's Active Listings Grid */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Listings by {seller.name} ({listings.length})
          </h2>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Package className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-xs text-slate-500">
              This student has no active items for sale right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <ListingCard key={item._id} listing={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
