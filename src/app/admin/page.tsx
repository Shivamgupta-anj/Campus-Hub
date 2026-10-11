"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Package,
  Flag,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IListing, IUser, IReport } from "@/types";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  pendingReports: number;
  totalChats: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "users" | "reports">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [listings, setListings] = useState<IListing[]>([]);
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const [reports, setReports] = useState<IReport[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState("");

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "overview") {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } else if (activeTab === "listings") {
        const res = await fetch(`/api/admin/listings?status=${statusFilter}&q=${searchQuery}`);
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings || []);
        }
      } else if (activeTab === "users") {
        const res = await fetch(`/api/admin/users?status=${statusFilter}&q=${searchQuery}`);
        if (res.ok) {
          const data = await res.json();
          setUsersList(data.users || []);
        }
      } else if (activeTab === "reports") {
        const res = await fetch(`/api/admin/reports?status=${statusFilter}`);
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statusFilter, searchQuery]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      } else {
        loadAdminData();
      }
    }
  }, [user, authLoading, router, loadAdminData]);

  const handleUpdateListingStatus = async (listingId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, status: newStatus }),
      });
      if (res.ok) {
        setActionNotice(`Listing status changed to ${newStatus}.`);
        loadAdminData();
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update listing:", err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (!confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      if (res.ok) {
        setActionNotice(`User account ${nextStatus === "suspended" ? "suspended" : "reactivated"}.`);
        loadAdminData();
        setTimeout(() => setActionNotice(""), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Action prohibited");
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, newStatus: string) => {
    const adminNotes = prompt("Enter administrative review notes (optional):") || "";
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status: newStatus, adminNotes }),
      });
      if (res.ok) {
        setActionNotice(`Report status marked as ${newStatus}.`);
        loadAdminData();
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update report:", err);
    }
  };

  if (authLoading || (isLoading && !stats && activeTab === "overview")) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                CampusHub Moderation Portal
              </h1>
              <Badge variant="rose" size="sm">
                ADMIN
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Platform governance, user verification, and safety moderation
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveTab("overview");
              setStatusFilter("all");
            }}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "overview"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setActiveTab("listings");
              setStatusFilter("all");
            }}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "listings"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            Listings
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              setStatusFilter("all");
            }}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "users"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => {
              setActiveTab("reports");
              setStatusFilter("all");
            }}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "reports"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Students
              </span>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {stats.totalUsers}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">
                {stats.activeUsers} Active
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Listings
              </span>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {stats.totalListings}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">
                {stats.activeListings} Active • {stats.soldListings} Sold
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pending Reports
              </span>
              <p className="mt-2 text-3xl font-black text-rose-600">
                {stats.pendingReports}
              </p>
              <span className="text-[11px] text-slate-400">
                Requires moderator review
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Peer Conversations
              </span>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {stats.totalChats}
              </p>
              <span className="text-[11px] text-slate-400">Active message threads</span>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE LISTINGS TAB */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listing by title, category, college..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="removed">Removed (Moderated)</option>
            </select>
            <Button size="sm" onClick={() => loadAdminData()}>
              Search
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Item</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {listings.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {l.title}
                    </td>
                    <td className="p-3.5 uppercase text-slate-500">{l.category}</td>
                    <td className="p-3.5 font-extrabold text-emerald-600">₹{l.price}</td>
                    <td className="p-3.5 text-slate-500 truncate max-w-[150px]">{l.college}</td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          l.status === "active"
                            ? "emerald"
                            : l.status === "sold"
                            ? "blue"
                            : "rose"
                        }
                        size="sm"
                      >
                        {l.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <a
                        href={`/listings/${l._id}`}
                        target="_blank"
                        className="inline-block p-1 text-slate-400 hover:text-slate-600"
                        title="View item"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      {l.status !== "removed" ? (
                        <button
                          onClick={() => handleUpdateListingStatus(l._id, "removed")}
                          className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40"
                        >
                          Suspend Item
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateListingStatus(l._id, "active")}
                          className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40"
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW USERS TAB */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, college..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
            <Button size="sm" onClick={() => loadAdminData()}>
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">College & Branch</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Account Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="p-3.5 text-slate-500">{u.email}</td>
                    <td className="p-3.5 text-slate-500">
                      <p className="truncate max-w-[180px] font-medium text-slate-700 dark:text-slate-300">
                        {u.college}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {u.course} • {u.branch}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={u.role === "admin" ? "rose" : "slate"} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={u.status === "active" ? "emerald" : "rose"} size="sm">
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                            u.status === "active"
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40"
                          }`}
                        >
                          {u.status === "active" ? "Suspend Student" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVIEW SUBMITTED REPORTS TAB */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStatusFilter("all");
                loadAdminData();
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                statusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => {
                setStatusFilter("pending");
                loadAdminData();
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                statusFilter === "pending" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => {
                setStatusFilter("resolved");
                loadAdminData();
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                statusFilter === "resolved" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Resolved
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Zero Reports Found
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                All submitted community reports have been resolved or dismissed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const reporter = typeof rep.reporterId === "object" ? (rep.reporterId as any) : null;

                return (
                  <div
                    key={rep._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-rose-600" />
                        <span className="font-bold text-slate-900 dark:text-white">
                          Target: {rep.targetType.toUpperCase()} ({rep.targetId})
                        </span>
                        <Badge
                          variant={
                            rep.status === "pending"
                              ? "rose"
                              : rep.status === "resolved"
                              ? "emerald"
                              : "slate"
                          }
                          size="sm"
                        >
                          {rep.status}
                        </Badge>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Reported on {new Date(rep.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p>
                        <strong>Reason:</strong> <span className="text-rose-600 font-semibold">{rep.reason}</span>
                      </p>
                      {rep.description && (
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Description:</strong> {rep.description}
                        </p>
                      )}
                      {reporter && (
                        <p className="text-slate-400 text-[11px]">
                          Reported by student: {reporter.name} ({reporter.email})
                        </p>
                      )}
                      {rep.adminNotes && (
                        <p className="text-emerald-700 dark:text-emerald-400 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                          <strong>Admin Note:</strong> {rep.adminNotes}
                        </p>
                      )}
                    </div>

                    {/* Report action buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleUpdateReportStatus(rep._id, "resolved")}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateReportStatus(rep._id, "reviewed")}
                        className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleUpdateReportStatus(rep._id, "dismissed")}
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
