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
import EcoVideoFeed from "../components/dashboard/EcoVideoFeed"

function Dashboard() {
  const { user } = useAuth()

  const userName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "User"

  const activities = [
    {
      title: "Plastic bottle recycled",
      date: "Today, 10:42 AM",
      credits: "+25",
      status: "Verified",
      icon: Recycle,
    },
    {
      title: "Paper waste disposed",
      date: "Yesterday, 5:18 PM",
      credits: "+20",
      status: "Verified",
      icon: CheckCircle2,
    },
    {
      title: "Organic waste submitted",
      date: "28 Aug, 8:35 AM",
      credits: "+30",
      status: "Pending",
      icon: Leaf,
    },
  ]

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
  Welcome back, {userName} 👋
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
          <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-[#101c18] via-[#12251e] to-[#0b1713] p-5 text-white shadow-xl shadow-black/10 sm:p-6">

            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/10" />

            <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-cyan-400/5" />

            <div className="relative z-10">

              <div className="mb-6 flex items-center justify-between">

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Recycle size={18} />
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-white">
                      Recent Activity
                    </h2>

                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Your latest waste-management actions
                  </p>

                </div>

                <Link
                  to="/activity"
                  className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-white/10 sm:flex"
                >
                  View all
                  <ArrowUpRight size={14} />
                </Link>

              </div>


              <div className="space-y-3">

                {activities.map((activity) => {

                  const Icon = activity.icon

                  return (
                    <div
                      key={activity.title}
                      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition-all duration-300 hover:border-emerald-300/20 hover:bg-white/[0.07]"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 transition group-hover:bg-emerald-400/15">
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="truncate text-sm font-semibold text-white">
                          {activity.title}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {activity.date}
                        </p>

                      </div>

                      <div className="shrink-0 text-right">

                        <p className="text-sm font-bold text-emerald-300">
                          {activity.credits}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                            activity.status === "Verified"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-amber-400/10 text-amber-300"
                          }`}
                        >
                          {activity.status}
                        </span>

                      </div>

                    </div>
                  )
                })}

              </div>


              <Link
                to="/activity"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-300/20 hover:bg-emerald-400/5"
              >
                View All Activity
                <ArrowUpRight size={15} />
              </Link>

            </div>
          </div>


          {/* ===================================================
              ENVIRONMENTAL IMPACT
             =================================================== */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-300/10 bg-gradient-to-br from-[#075b3d] via-[#086b48] to-[#064a34] p-6 text-white shadow-xl shadow-emerald-950/20 sm:p-7">

            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-300/10" />

            <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-cyan-300/5" />

            <div className="relative z-10">

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <p className="text-sm font-medium text-emerald-100">
                    Your Environmental Impact
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    Making a difference
                  </h2>

                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Leaf size={23} />
                </div>

              </div>


              <div className="my-6 h-px bg-white/15" />


              <div className="space-y-6">

                <div>

                  <div className="mb-2 flex items-center justify-between gap-4">

                    <span className="text-sm text-emerald-100">
                      Waste diverted
                    </span>

                    <span className="text-sm font-bold text-white">
                      24.6 kg
                    </span>

                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-black/20">

                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-white to-emerald-200" />

                  </div>

                </div>


                <div>

                  <div className="mb-2 flex items-center justify-between gap-4">

                    <span className="text-sm text-emerald-100">
                      Monthly goal
                    </span>

                    <span className="text-sm font-bold text-white">
                      72%
                    </span>

                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-black/20">

                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-white to-emerald-200" />

                  </div>

                </div>

              </div>


              <div className="mt-7 rounded-2xl border border-white/10 bg-white/10 p-4">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-200">
                    <TrendingUp size={15} />
                  </div>

                  <p className="text-xs font-medium text-emerald-100">
                    Keep going
                  </p>

                </div>

                <p className="mt-2 text-sm font-semibold leading-6 text-white">
                  You're on track to beat your monthly recycling goal.
                </p>

              </div>

            </div>
          </div>

        </section>

        {/* =====================================================
    ECO VIDEO FEED
   ===================================================== */}
<section className="mt-8 mb-8">
  <EcoVideoFeed />
</section>


        {/* ECO VIDEO FEED */}
        {/* ECO VIDEO FEED */}
        <EcoVideoFeed />
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




