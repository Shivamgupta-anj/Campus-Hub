"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IListing } from "@/types";

export default function MyListingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [listings, setListings] = useState<IListing[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "sold">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  const fetchMyListings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/listings?sellerId=${user.id}&status=all`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error("Failed to load user listings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchMyListings();
    }
  }, [user, authLoading, router, fetchMyListings]);

  const handleStatusChange = async (listingId: string, newStatus: "active" | "sold") => {
    try {
      const res = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(`Listing status updated to ${newStatus}.`);
        fetchMyListings();
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (listingId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setActionMessage("Listing deleted successfully.");
        fetchMyListings();
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to delete listing:", err);
    }
  };

  if (authLoading || (isLoading && !listings.length)) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Loading your listings...</p>
      </div>
    );
  }

  const filteredListings = listings.filter((item) => {
    if (filterStatus === "all") return true;
    return item.status === filterStatus;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Manage My Listings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Keep your items up to date, mark sold items, or remove old posts
          </p>
        </div>

        <Link href="/listings/create">
          <Button variant="primary" leftIcon={<PlusCircle className="h-4 w-4" />}>
            Post New Item
          </Button>
        </Link>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setFilterStatus("all")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            filterStatus === "all"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          All ({listings.length})
        </button>
        <button
          onClick={() => setFilterStatus("active")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            filterStatus === "active"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          Active ({listings.filter((l) => l.status === "active").length})
        </button>
        <button
          onClick={() => setFilterStatus("sold")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            filterStatus === "sold"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          Sold ({listings.filter((l) => l.status === "sold").length})
        </button>
      </div>

      {/* Listings List */}
      {filteredListings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            No listings found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {filterStatus === "all"
              ? "You haven't listed any items for sale yet."
              : `You have no ${filterStatus} items.`}
          </p>
          <Link href="/listings/create" className="mt-6 inline-block">
            <Button size="sm">Create First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredListings.map((item) => {
            const imgUrl =
              item.images && item.images.length > 0
                ? item.images[0]
                : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80";

            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={imgUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.status === "active" ? "emerald" : "rose"}
                        size="sm"
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        {item.condition}
                      </Badge>
                    </div>
                    <Link
                      href={`/listings/${item._id}`}
                      className="block truncate text-base font-bold text-slate-900 hover:text-emerald-600 dark:text-white"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-extrabold text-emerald-600 text-sm">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {item.views} views
                      </span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:self-center">
                  {item.status === "active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(item._id, "sold")}
                      leftIcon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                    >
                      Mark as Sold
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(item._id, "active")}
                      leftIcon={<RotateCcw className="h-3.5 w-3.5 text-blue-600" />}
                    >
                      Relist Item
                    </Button>
                  )}

                  <Link href={`/listings/${item._id}/edit`}>
                    <Button variant="ghost" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    onClick={() => handleDelete(item._id, item.title)}
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
