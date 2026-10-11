import Link from "next/link";
import {
  GraduationCap,
  Search,
  BookOpen,
  Laptop,
  Calculator,
  PenTool,
  Bike,
  Home,
  Briefcase,
  Shirt,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { ListingCard } from "@/components/ui/ListingCard";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/constants";
import { IListing } from "@/types";


async function getRecentListings(): Promise<IListing[]> {
  try {
    await connectToDatabase();
    const listings = await Listing.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("sellerId", "name college course branch academicYear profileImage")
      .lean();
    return JSON.parse(JSON.stringify(listings));
  } catch (err) {
    console.error("Failed to load recent listings:", err);
    return [];
  }
}

const categoryIcons: Record<string, React.ReactNode> = {
  textbooks: <BookOpen className="h-6 w-6" />,
  electronics: <Laptop className="h-6 w-6" />,
  calculators: <Calculator className="h-6 w-6" />,
  stationery: <PenTool className="h-6 w-6" />,
  cycles: <Bike className="h-6 w-6" />,
  "hostel-essentials": <Home className="h-6 w-6" />,
  accessories: <Briefcase className="h-6 w-6" />,
  fashion: <Shirt className="h-6 w-6" />,
};

export default async function HomePage() {
  const recentListings = await getRecentListings();

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 py-16 sm:py-24 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs backdrop-blur-md dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Verified Campus-Only Student Marketplace
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white max-w-4xl mx-auto">
            Buy & Sell Course Gear with{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Verified Peers
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
            No expensive courier charges. No unknown strangers. Trade textbooks,
            scientific calculators, electronics, hostel room items, and campus
            cycles directly with students in your college.
          </p>

          {/* Hero Search Box */}
          <div className="mx-auto mt-10 max-w-2xl">
            <form
              action="/marketplace"
              method="GET"
              className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="What are you looking for? (e.g. Casio fx-991, Timoshenko book...)"
                  className="w-full rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:bg-slate-900 dark:text-white"
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Explore Listings
              </Button>
            </form>
          </div>

          {/* Quick CTA Links */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Popular searches:</span>
            <Link
              href="/marketplace?category=calculators"
              className="rounded-lg bg-white px-2.5 py-1 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition dark:bg-slate-800 dark:border-slate-700"
            >
              Calculators
            </Link>
            <Link
              href="/marketplace?category=textbooks"
              className="rounded-lg bg-white px-2.5 py-1 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition dark:bg-slate-800 dark:border-slate-700"
            >
              Engineering Books
            </Link>
            <Link
              href="/marketplace?category=cycles"
              className="rounded-lg bg-white px-2.5 py-1 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition dark:bg-slate-800 dark:border-slate-700"
            >
              Bicycles
            </Link>
            <Link
              href="/marketplace?category=stationery"
              className="rounded-lg bg-white px-2.5 py-1 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition dark:bg-slate-800 dark:border-slate-700"
            >
              Mini Drafters
            </Link>
          </div>
        </div>
      </section>

      {/* BROWSE BY CATEGORY */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Categories
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Browse by College Category
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="mt-3 sm:mt-0 inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 group"
            >
              View all listings
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/marketplace?category=${cat.id}`}
                className="group flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-emerald-700"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/80 dark:text-emerald-300 dark:group-hover:bg-emerald-600">
                  {categoryIcons[cat.id] || <BookOpen className="h-6 w-6" />}
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT LISTINGS SECTION */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Fresh Arrivals
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Recently Added on Campus
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="mt-3 sm:mt-0 inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 group"
            >
              Browse entire catalog
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {recentListings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <p className="text-sm text-slate-500">
                No active listings found right now. Be the first to publish one!
              </p>
              <Link href="/listings/create" className="mt-4 inline-block">
                <Button size="sm">Create First Listing</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentListings.map((item) => (
                <ListingCard key={item._id.toString()} listing={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW CAMPUSHUB WORKS */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Seamless Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              How CampusHub Works for Students
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Designed specifically around how campus life and hostel handoffs operate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md text-xl font-black">
                1
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">
                Snap & List in 60s
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Take a quick photo of your unused textbook, calculator, or hostel table. Set your price and tag your college.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md text-xl font-black">
                2
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">
                Direct In-App Chat
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Interested classmates reach out instantly. Ask questions about the book edition or negotiate transparently.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md text-xl font-black">
                3
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">
                Meet & Hand Over
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Meet at the campus library, cafeteria, or hostel gate. Inspect the physical item on the spot with complete confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CAMPUSHUB BENEFITS */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Campus Advantage
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                Why Buy & Sell Inside Your College Community?
              </h2>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                General classifieds websites are full of strangers, shipping fees, and unresponsive sellers. CampusHub is purpose-built for the fast rhythm of student semesters.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Verified Student Profiles
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Every buyer and seller displays their college name, branch, and academic year.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Zero Shipping Wait
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Need a calculator for tomorrow morning’s semester exam? Get it in hand within an hour from a neighboring hostel.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Circular Student Economy
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Seniors pass along essential books and drafters to juniors, keeping costs affordable for everyone.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action Banner Box */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-2xl sm:text-3xl font-extrabold">
                  Have textbooks or gear sitting in your hostel room?
                </h3>
                <p className="mt-3 text-sm text-emerald-100 leading-relaxed">
                  Turn your unused semester supplies into cash while helping out fellow juniors on your campus.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link href="/listings/create">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      List an Item Now
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      Join CampusHub
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
