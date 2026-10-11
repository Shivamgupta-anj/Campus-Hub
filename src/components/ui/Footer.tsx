import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Campus<span className="text-emerald-500">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier college-verified student marketplace. Buy, sell, and hand off academic books, electronics, calculators, and hostel essentials safely on campus.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Students
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/60 border border-blue-800/80 px-2.5 py-1 text-[11px] font-medium text-blue-400">
                <HeartHandshake className="h-3.5 w-3.5" />
                In-Person Handoff
              </span>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Marketplace
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/marketplace?category=textbooks" className="hover:text-emerald-400 transition-colors">
                  Textbooks & Notes
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=calculators" className="hover:text-emerald-400 transition-colors">
                  Scientific Calculators
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=electronics" className="hover:text-emerald-400 transition-colors">
                  Laptops & Electronics
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=cycles" className="hover:text-emerald-400 transition-colors">
                  Cycles & Campus Mobility
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=hostel-essentials" className="hover:text-emerald-400 transition-colors">
                  Hostel Essentials & Desks
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Hub */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Student Platform
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/marketplace" className="hover:text-emerald-400 transition-colors">
                  All Active Listings
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="hover:text-emerald-400 transition-colors">
                  Publish a Listing
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-emerald-400 transition-colors">
                  Wishlist & Saved Items
                </Link>
              </li>
              <li>
                <Link href="/messages" className="hover:text-emerald-400 transition-colors">
                  Direct Messages
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Safety & Verification
            </h4>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Never wire money beforehand. Meet during daylight in high-traffic campus locations like the central library, student union, or college canteen.
            </p>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-800/50 p-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold">Campus Moderation</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Notice a suspicious listing? Report it directly to college student moderators from any item page.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusHub — Smart Student Marketplace. Built with Next.js, TypeScript, Tailwind CSS & MongoDB.</p>
        </div>
      </div>
    </footer>
  );
}
