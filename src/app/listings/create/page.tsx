"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CATEGORIES, ITEM_CONDITIONS, DEFAULT_COLLEGES } from "@/lib/constants";

export default function CreateListingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [condition, setCondition] = useState<string>(ITEM_CONDITIONS[1].value); // Like New
  const [college, setCollege] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && !college) {
      setCollege(user.college);
    }
  }, [user, authLoading, router, college]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim() || !description.trim() || !price || !college) {
      setErrorMessage("Please complete all required listing fields.");
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage("Price must be a valid non-negative number.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: numPrice,
          category,
          condition,
          college,
          images,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/listings/${data.listing._id}`);
      } else {
        setErrorMessage(data.error || "Failed to publish listing.");
      }
    } catch (err) {
      console.error("Listing creation error:", err);
      setErrorMessage("Network error while creating listing.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="p-12 text-center text-xs text-slate-500">Checking authentication...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancel & Return
      </button>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-6 dark:border-slate-800">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Campus Listing Publisher
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Publish an Item for Sale
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Share item details, pictures, and condition. Only college-verified students can view and contact you.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Images Uploader */}
          <ImageUpload images={images} onChange={setImages} maxImages={8} />

          {/* Title */}
          <Input
            label="Listing Title *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Casio fx-991EX ClassWiz Scientific Calculator"
            helperText="Clear, concise product brand and model name"
          />

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {ITEM_CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & College */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (₹ INR) *"
              type="number"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 850"
              leftIcon={<span className="text-xs font-bold">₹</span>}
              helperText="Set a fair price for fellow students"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Campus Location *
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {DEFAULT_COLLEGES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Detailed Description *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention semester used, accessories included (cables, covers), physical condition, notes, or preferred meeting point on campus (e.g. Main Library, Hostel 4)..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white leading-relaxed placeholder:text-slate-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              leftIcon={<PlusCircle className="h-4 w-4" />}
            >
              Publish Listing
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
