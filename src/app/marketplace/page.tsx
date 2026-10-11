"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  PackageX,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ListingCard } from "@/components/ui/ListingCard";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, ITEM_CONDITIONS, DEFAULT_COLLEGES } from "@/lib/constants";
import { IListing } from "@/types";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search & Filter state initialized from URL search params
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [condition, setCondition] = useState(searchParams.get("condition") || "all");
  const [college, setCollege] = useState(searchParams.get("college") || "all");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Listings data
  const [listings, setListings] = useState<IListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category && category !== "all") params.set("category", category);
      if (condition && condition !== "all") params.set("condition", condition);
      if (college && college !== "all") params.set("college", college);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (sort) params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [q, category, condition, college, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Synchronize state with URL
  const applyFilters = (newParams?: Record<string, string | number>) => {
    const params = new URLSearchParams();
    const activeQ = newParams?.q !== undefined ? String(newParams.q) : q;
    const activeCat = newParams?.category !== undefined ? String(newParams.category) : category;
    const activeCond = newParams?.condition !== undefined ? String(newParams.condition) : condition;
    const activeCol = newParams?.college !== undefined ? String(newParams.college) : college;
    const activeMin = newParams?.minPrice !== undefined ? String(newParams.minPrice) : minPrice;
    const activeMax = newParams?.maxPrice !== undefined ? String(newParams.maxPrice) : maxPrice;
    const activeSort = newParams?.sort !== undefined ? String(newParams.sort) : sort;
    const activePage = newParams?.page !== undefined ? String(newParams.page) : "1";

    if (activeQ) params.set("q", activeQ);
    if (activeCat && activeCat !== "all") params.set("category", activeCat);
    if (activeCond && activeCond !== "all") params.set("condition", activeCond);
    if (activeCol && activeCol !== "all") params.set("college", activeCol);
    if (activeMin) params.set("minPrice", activeMin);
    if (activeMax) params.set("maxPrice", activeMax);
    if (activeSort) params.set("sort", activeSort);
    if (activePage !== "1") params.set("page", activePage);

    router.push(`/marketplace?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    applyFilters({ page: 1 });
  };

  const handleResetFilters = () => {
    setQ("");
    setCategory("all");
    setCondition("all");
    setCollege("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    router.push("/marketplace");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Campus Marketplace
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {totalCount} verified items available across college campuses
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className="md:hidden inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                applyFilters({ sort: e.target.value, page: 1 });
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* FILTERS SIDEBAR */}
        <aside
          className={`space-y-6 md:block ${
            isFilterDrawerOpen ? "block" : "hidden"
          } rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60 h-fit`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <Filter className="h-4 w-4 text-emerald-600" />
              Filter Listings
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
              Keyword
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </form>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
                applyFilters({ category: e.target.value, page: 1 });
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
              Item Condition
            </label>
            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
                applyFilters({ condition: e.target.value, page: 1 });
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">Any Condition</option>
              {ITEM_CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>

          {/* College Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
              College Campus
            </label>
            <select
              value={college}
              onChange={(e) => {
                setCollege(e.target.value);
                setPage(1);
                applyFilters({ college: e.target.value, page: 1 });
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Campuses</option>
              {DEFAULT_COLLEGES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setPage(1);
                applyFilters({ page: 1 });
              }}
            >
              Apply Price
            </Button>
          </div>
        </aside>

        {/* LISTINGS RESULTS */}
        <main className="md:col-span-3">
          {isLoading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-xs text-slate-500">Loading campus listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <PackageX className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                No matching listings found
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Try adjusting your search terms, changing the category, or expanding the price range filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((item) => (
                  <ListingCard key={item._id.toString()} listing={item} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => {
                      const newPage = page - 1;
                      setPage(newPage);
                      applyFilters({ page: newPage });
                    }}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Previous
                  </Button>

                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Page {page} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      applyFilters({ page: newPage });
                    }}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
