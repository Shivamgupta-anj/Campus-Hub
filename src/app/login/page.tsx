"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        login(data.token, data.user);
        router.push("/marketplace");
      } else {
        setErrorMessage(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login request error:", err);
      setErrorMessage("Network error during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage("");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Sign In to CampusHub
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Access your campus listings, wishlist, and peer conversations
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="College Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@college.edu"
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* DEMO ACCOUNTS HELPER */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            One-Click Demo Accounts
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Click to autofill seeded credentials:
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("aarav.sharma@iitd.ac.in", "Student@123")}
              className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("admin@campushub.edu", "Admin@123")}
              className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-rose-600 hover:border-rose-500 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900 dark:text-rose-400"
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          New to CampusHub?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
