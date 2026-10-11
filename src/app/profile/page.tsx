"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  MapPin,
  Calendar,
  Phone,
  Edit,
  ShieldCheck,
  Package,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IUser } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Loading student profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700" />

        <div className="relative px-6 pb-8 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-12 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-slate-900 text-3xl font-black text-white shadow-xl dark:border-slate-900">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    {profile.name}
                  </h1>
                  <Badge variant="emerald" size="sm">
                    {profile.role.toUpperCase()}
                  </Badge>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  {profile.college}
                </p>
              </div>
            </div>

            <Link href="/profile/edit">
              <Button variant="outline" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Academic Info Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Course & Degree
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {profile.course}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Department / Branch
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white truncate">
                {profile.branch}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Academic Year
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {profile.academicYear}
              </p>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About Me
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Contact & Meta */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{profile.email}</span>
            </div>

            {profile.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{profile.phoneNumber}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Campus Community Member</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-right">
        <Link href="/my-listings">
          <Button variant="secondary" leftIcon={<Package className="h-4 w-4" />}>
            Manage My Listings
          </Button>
        </Link>
      </div>
    </div>
  );
}
