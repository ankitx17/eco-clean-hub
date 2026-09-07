import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gift,
  Leaf,
  MapPin,
  Recycle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  TrendingUp,
} from "lucide-react"

import { Link } from "react-router-dom"
import useAuth from "../hooks/useAuth"

import EcoCreditsCard from "../components/dashboard/EcoCreditsCard"
import DashboardHeader from "../components/dashboard/DashboardHeader"
import DashboardStats from "../components/dashboard/DashboardStats"
import ImpactAnalytics from "../components/dashboard/ImpactAnalytics"
import EnvironmentalImpact from "../components/dashboard/EnvironmentalImpact"
import EcoVideoFeed from "../components/dashboard/EcoVideoFeed"
import RecentActivity from "../components/dashboard/RecentActivity"
import CommunityEvents from "../components/community-events/CommunityEvents"

function Dashboard() {
  const { user } = useAuth()

  const userName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "User"

  const quickActions = [
    {
      title: "Scan Waste",
      description: "Identify your waste with AI",
      icon: Camera,
      to: "/scanner",
    },
    {
      title: "Find MRF",
      description: "Locate the nearest centre",
      icon: MapPin,
      to: "/mrf",
    },
    {
      title: "Verify Disposal",
      description: "Submit proof of disposal",
      icon: ShieldCheck,
      to: "/verification",
    },
  ]

  return (
    <div className="min-h-screen bg-[#f4f8f5] text-[#14231a]">

      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">

        {/* =====================================================
            WELCOME
           ===================================================== */}
        <section className="mb-7 sm:mb-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div className="min-w-0">

              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#d8f5e3] px-3 py-1.5 text-xs font-semibold text-[#176b45]">
                <Sparkles size={14} />
                Keep making an impact
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {userName} &#128075;
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Your small actions create a cleaner, greener future.
                Keep recycling and grow your environmental impact.
              </p>

            </div>

          </div>
        </section>


        {/* =====================================================
            MISSION / SCAN / DONATION / FUNDING
           ===================================================== */}
        <section className="mb-7 grid gap-4 sm:mb-8 sm:grid-cols-2">

          {/* START MISSION */}
          <Link
            to="/missions"
            className="group relative h-[170px] overflow-hidden rounded-3xl border border-[#4cae72] bg-gradient-to-br from-[#b8e8c9] via-[#9dd9b5] to-[#7fc79d] p-5 text-[#123d2b] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#176b45]/10 transition-transform duration-500 group-hover:scale-110" />

            <div className="pointer-events-none absolute -bottom-14 -right-2 h-28 w-28 rounded-full bg-[#42a96d]/10" />

            <div className="relative flex h-full items-center justify-between">

              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-[#176b45] shadow-md transition duration-300 group-hover:scale-105">
                  <Leaf size={30} />
                </div>

                <div className="min-w-0">

                  <h3 className="text-lg font-extrabold text-[#123d2b] sm:text-xl">
                    Start a Mission
                  </h3>

                  <p className="mt-1 max-w-md text-sm leading-5 text-slate-600">
                    Take part in eco-friendly activities and earn Eco-Credits
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#176b45] px-4 py-2 text-xs font-bold text-white shadow-sm transition group-hover:bg-[#125a39]">
                    Make an Impact
                    <ArrowRight size={14} />
                  </div>

                </div>

              </div>

              <div className="ml-3 hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/50 sm:flex">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#176b45]/10">
                  <Leaf
                    size={38}
                    className="text-[#176b45] transition duration-500 group-hover:rotate-6 group-hover:scale-110"
                  />
                </div>
              </div>

            </div>
          </Link>


          {/* SCAN WASTE */}
          <Link
            to="/scanner"
            className="group relative h-[170px] overflow-hidden rounded-3xl border border-[#8fb5df] bg-gradient-to-br from-[#c3dafa] via-[#a8c8ed] to-[#8fb4dc] p-5 text-[#18324f] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-500/10 transition-transform duration-500 group-hover:scale-110" />

            <div className="pointer-events-none absolute -bottom-14 -right-2 h-28 w-28 rounded-full bg-blue-400/10" />

            <div className="relative flex h-full items-center justify-between">

              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md transition duration-300 group-hover:scale-105">
                  <Camera size={30} />
                </div>

                <div className="min-w-0">

                  <h3 className="text-lg font-extrabold text-[#18324f] sm:text-xl">
                    Scan Waste
                  </h3>

                  <p className="mt-1 max-w-md text-sm leading-5 text-slate-600">
                    Identify your waste with AI
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition group-hover:bg-blue-700">
                    Scan & Identify
                    <ArrowRight size={14} />
                  </div>

                </div>

              </div>

              <div className="ml-3 hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/55 sm:flex">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                  <Camera
                    size={36}
                    className="text-blue-600 transition duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

            </div>
          </Link>


          {/* DONATION */}
          <Link
            to="/donation"
            className="group relative h-[170px] overflow-hidden rounded-3xl border border-[#e3a39d] bg-gradient-to-br from-[#f6cbc6] via-[#edb3ad] to-[#df9690] p-5 text-[#4a2522] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-red-400/10 transition-transform duration-500 group-hover:scale-110" />

            <div className="pointer-events-none absolute -bottom-14 -left-5 h-28 w-28 rounded-full bg-red-400/10" />

            <div className="relative flex h-full items-center justify-between">

              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-md transition duration-300 group-hover:scale-105">
                  <Gift size={30} />
                </div>

                <div className="min-w-0">

                  <h3 className="text-lg font-extrabold text-[#4a2522] sm:text-xl">
                    Donation & Green Fund
                  </h3>

                  <p className="mt-1 max-w-md text-sm leading-5 text-slate-600">
                    Support trees, cleanups and greener communities
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition group-hover:bg-red-700">
                    Make a Contribution
                    <ArrowRight size={14} />
                  </div>

                </div>

              </div>

              <div className="ml-3 hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/55 sm:flex">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <Gift
                    size={36}
                    className="text-red-600 transition duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

            </div>
          </Link>


          {/* FUNDING */}
          <Link
            to="/funding-request"
            className="group relative h-[170px] overflow-hidden rounded-3xl border border-[#b9a0d8] bg-gradient-to-br from-[#decaf0] via-[#cdb4e5] to-[#b99bd4] p-5 text-[#302347] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-purple-500/10 transition-transform duration-500 group-hover:scale-110" />

            <div className="pointer-events-none absolute -bottom-14 -left-5 h-28 w-28 rounded-full bg-purple-400/10" />

            <div className="relative flex h-full items-center justify-between">

              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-md transition duration-300 group-hover:scale-105">
                  <FileText size={30} />
                </div>

                <div className="min-w-0">

                  <h3 className="text-lg font-extrabold text-[#302347] sm:text-xl">
                    Request Green Fund
                  </h3>

                  <p className="mt-1 max-w-md text-sm leading-5 text-slate-600">
                    Apply for funding for cleanup, plantation, recycling and
                    other environmental projects.
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition group-hover:bg-purple-700">
                    Submit Funding Request
                    <ArrowRight size={14} />
                  </div>

                </div>

              </div>

              <div className="ml-3 hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/55 sm:flex">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
                  <FileText
                    size={36}
                    className="text-purple-600 transition duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

            </div>
          </Link>

        </section>


        {/* =====================================================
            STATS
           ===================================================== */}
        <DashboardStats />


        {/* =====================================================
            ECO CREDITS
           ===================================================== */}
        <section className="mb-6">
          <EcoCreditsCard />
        </section>


        {/* =====================================================
            MARKETPLACE / LEADERBOARD / CERTIFICATE
           ===================================================== */}
        <section className="mb-8">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* MARKETPLACE */}
            <Link
              to="/redeem"
              className="group relative h-[220px] overflow-hidden rounded-3xl border border-red-400/20 bg-gradient-to-br from-[#5c1010] via-[#7a1717] to-[#3d0808] p-5 text-white shadow-lg shadow-red-950/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-emerald-300/10 transition-transform duration-500 group-hover:scale-110" />

              <div className="relative z-10 flex h-full flex-col">

                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#087346] shadow-md">
                    <ShoppingBag size={23} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <ArrowRight size={17} />
                  </div>

                </div>

                <div className="mt-auto">

                  <div className="flex items-center gap-2">

                    <h3 className="text-lg font-bold">
                      Eco Marketplace
                    </h3>

                    <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold uppercase text-emerald-100">
                      Redeem
                    </span>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-emerald-50/75">
                    Use your Eco-Credits to redeem exciting rewards.
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-[11px] font-semibold">
                    Explore Marketplace
                    <ArrowUpRight size={14} />
                  </div>

                </div>

              </div>
            </Link>


            {/* LEADERBOARD */}
            <Link
              to="/leaderboard"
              className="group relative h-[220px] overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#123d4b] via-[#15566a] to-[#0d3542] p-5 text-white shadow-lg shadow-cyan-950/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-cyan-200/10 transition-transform duration-500 group-hover:scale-110" />

              <div className="relative z-10 flex h-full flex-col">

                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#126078] shadow-md">
                    <Trophy size={23} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <ArrowRight size={17} />
                  </div>

                </div>

                <div className="mt-auto">

                  <div className="flex items-center gap-2">

                    <h3 className="text-lg font-bold">
                      Leaderboard
                    </h3>

                    <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold uppercase text-cyan-100">
                      Rank
                    </span>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-cyan-50/75">
                    See your position and compete with the community.
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-[11px] font-semibold">
                    View Leaderboard
                    <ArrowUpRight size={14} />
                  </div>

                </div>

              </div>
            </Link>


            {/* CERTIFICATE */}
            <Link
              to="/certificate"
              className="group relative h-[220px] overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#392052] via-[#51306f] to-[#2c173f] p-5 text-white shadow-lg shadow-violet-950/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-violet-200/10 transition-transform duration-500 group-hover:scale-110" />

              <div className="relative z-10 flex h-full flex-col">

                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7040a0] shadow-md">
                    <FileText size={23} />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <ArrowRight size={17} />
                  </div>

                </div>

                <div className="mt-auto">

                  <div className="flex items-center gap-2">

                    <h3 className="text-lg font-bold">
                      Certificate
                    </h3>

                    <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold uppercase text-violet-100">
                      Achieve
                    </span>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-violet-50/75">
                    Earn certificates and showcase your environmental impact.
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-[11px] font-semibold">
                    View Certificate
                    <ArrowUpRight size={14} />
                  </div>

                </div>

              </div>
            </Link>

          </div>

        </section>


        {/* =====================================================
            PERSONAL IMPACT ANALYTICS
           ===================================================== */}
        <ImpactAnalytics />


        {/* =====================================================
            LOWER CONTENT
           ===================================================== */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">

          {/* ===================================================
    RECENT ACTIVITY
   =================================================== */}

        <RecentActivity />   

        <EnvironmentalImpact />

        </section>

        {/* =====================================================
    ECO VIDEO FEED
   ===================================================== */}
<section className="mt-8 mb-8">
  <EcoVideoFeed />
</section>


        {/* ECO VIDEO FEED */}
        {/* ECO VIDEO FEED */}        {/* COMMUNITY EVENTS */}
        <section className="mt-8 mb-8">
          <CommunityEvents />
        </section>
        {/* =====================================================
            FINAL CTA
           ===================================================== */}
        <section className="mt-8 rounded-3xl border border-[#dfeae3] bg-white p-5 shadow-sm sm:p-8">

          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">

            <div className="min-w-0">

              <div className="mb-2 flex items-center gap-2 text-[#176b45]">

                <Sparkles size={17} />

                <span className="text-sm font-semibold">
                  Next step
                </span>

              </div>

              <h2 className="text-xl font-bold sm:text-2xl">
                Have some waste to dispose?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Scan it first and let Eco Clean Hub guide you.
              </p>

            </div>

            <Link
              to="/scanner"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#125a39] md:w-auto"
            >
              Start Scanning
              <ArrowRight size={17} />
            </Link>

          </div>

        </section>

      </main>
    </div>
  )
}

export default Dashboard








