import {
  ArrowRight,
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
} from "lucide-react"

import { Link } from "react-router-dom"
import useAuth from "../hooks/useAuth"

import EcoCreditsCard from "../components/dashboard/EcoCreditsCard"
import DashboardHeader from "../components/dashboard/DashboardHeader"
import DashboardStats from "../components/dashboard/DashboardStats"
import ImpactAnalytics from "../components/dashboard/ImpactAnalytics"

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
    <div className="min-h-screen bg-[#f6faf7] text-[#14231a]">
      {/* HEADER */}
      <DashboardHeader />

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">

        {/* WELCOME */}
        <section className="mb-7 sm:mb-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-[#176b45]">
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

        {/* MISSION, SCAN, DONATION & FUNDING ACTIONS */}
        <section className="mb-7 grid gap-4 sm:grid-cols-2 sm:mb-8">

          {/* START A MISSION */}
          <Link
            to="/missions"
            className="group relative overflow-hidden rounded-2xl border border-[#4caf72] bg-gradient-to-br from-[#219653] to-[#11663e] p-5 text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-[#176b45] shadow-sm transition duration-300 group-hover:scale-105">
                  <Leaf size={26} />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    Start a Mission
                  </h3>

                  <p className="mt-1 text-sm text-green-50">
                    Take part in eco-friendly activities and earn Eco-Credits
                  </p>
                  <p className="mt-1 text-sm text-green-50">
                    Take part in eco-friendly activities and earn Eco-Credits
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    Make an Impact
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    Make an Impact
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>

              <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition duration-300 group-hover:bg-white group-hover:text-[#176b45]">
                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>

          {/* SCAN WASTE */}
          <Link
            to="/scanner"
            className="group relative overflow-hidden rounded-2xl border border-[#4caf72] bg-gradient-to-br from-[#219653] to-[#11663e] p-5 text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-[#176b45] shadow-sm transition duration-300 group-hover:scale-105">
                  <Camera size={26} />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    Scan Waste
                  </h3>

                  <p className="mt-1 text-sm text-green-50">
                    Identify your waste with AI
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    Scan & Identify
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>

              <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition duration-300 group-hover:bg-white group-hover:text-[#176b45]">
                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>

          {/* DONATION & GREEN FUND */}
          <Link
            to="/donation"
            className="group relative overflow-hidden rounded-2xl border border-[#4caf72] bg-gradient-to-br from-[#219653] to-[#11663e] p-5 text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />

            <div className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-[#176b45] shadow-sm transition duration-300 group-hover:scale-105">
                  <Gift size={26} />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    Donation & Green Fund
                  </h3>

                  <p className="mt-1 text-sm text-green-50">
                    Support trees, cleanups and greener communities
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    Make a Contribution
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>

              <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition duration-300 group-hover:bg-white group-hover:text-[#176b45]">
                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>

          {/* REQUEST GREEN FUND */}
          <Link
            to="/funding-request"
            className="group relative overflow-hidden rounded-2xl border border-[#4caf72] bg-gradient-to-br from-[#176b45] via-[#138a50] to-[#0d5d3b] p-5 text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

            <div className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-[#176b45] shadow-sm transition duration-300 group-hover:scale-105">
                  <FileText size={26} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1 inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-50">
                    Green Fund
                  </div>

                  <h3 className="text-lg font-extrabold text-white">
                    Request Green Fund
                  </h3>

                  <p className="mt-1 text-sm text-green-50">
                    Apply for funding for cleanup, plantation, recycling and
                    other environmental projects.
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    Submit Funding Request
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>

              <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition duration-300 group-hover:bg-white group-hover:text-[#176b45]">
                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>
        </section>

        {/* STATS */}
        <DashboardStats />

        {/* ECO CREDITS */}
        <section className="mb-5">
          <EcoCreditsCard />
        </section>

        {/* ECO MARKETPLACE */}
        <section className="mb-8">
          <Link
            to="/redeem"
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#bcd8c7] hover:shadow-lg sm:p-6"
          >
            {/* Decorative circle */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#edf8f1]" />

            <div className="relative flex min-w-0 items-center gap-4">

              {/* ICON */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45] transition duration-300 group-hover:bg-[#176b45] group-hover:text-white">
                <ShoppingBag size={26} />
              </div>

              {/* TEXT */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#14231a]">
                    Eco Marketplace
                  </h3>

                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-[#176b45]">
                    REDEEM
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Use your Eco Credits to redeem exciting rewards
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#edf8f1] px-3 py-1 text-xs font-semibold text-[#176b45]">
                    Mobile Recharge
                  </span>

                  <span className="rounded-full bg-[#edf8f1] px-3 py-1 text-xs font-semibold text-[#176b45]">
                    Amazon
                  </span>

                  <span className="rounded-full bg-[#edf8f1] px-3 py-1 text-xs font-semibold text-[#176b45]">
                    Flipkart
                  </span>

                  <span className="rounded-full bg-[#edf8f1] px-3 py-1 text-xs font-semibold text-[#176b45]">
                    Mystery Box
                  </span>
                </div>
              </div>
            </div>

            {/* ARROW */}
            <div className="relative ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf8f1] text-[#176b45] transition duration-300 group-hover:bg-[#176b45] group-hover:text-white">
              <ArrowRight
                size={20}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </Link>
        </section>

        {/* PERSONAL IMPACT ANALYTICS */}
        <ImpactAnalytics />

        {/* QUICK ACTIONS */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Continue your waste-management journey
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.title}
                  to={action.to}
                  className="group rounded-2xl border border-[#dfeae3] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-[#bcd8c7] hover:shadow-lg sm:p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45] transition group-hover:bg-[#176b45] group-hover:text-white">
                      <Icon size={21} />
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#176b45]"
                    />
                  </div>

                  <h3 className="font-semibold">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {action.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* LOWER CONTENT */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">

          {/* ACTIVITY */}
          <div className="rounded-2xl border border-[#dfeae3] bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <div className="min-w-0">
                <h2 className="text-xl font-bold">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest waste-management actions
                </p>
              </div>

              <Link
                to="/activity"
                className="ml-3 shrink-0 text-sm font-semibold text-[#176b45] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = activity.icon

                return (
                  <div
                    key={activity.title}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 p-3 sm:gap-4 sm:p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45] sm:h-11 sm:w-11">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">
                        {activity.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {activity.date}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-[#176b45]">
                        {activity.credits}
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          activity.status === "Verified"
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* IMPACT */}
          <div className="overflow-hidden rounded-2xl bg-[#176b45] p-5 text-white shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-100">
                  Your Environmental Impact
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Making a difference
                </h2>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Leaf size={22} />
              </div>
            </div>

            <div className="my-6 h-px bg-white/15 sm:my-7" />

            <div className="space-y-5">

              <div>
                <div className="mb-2 flex justify-between gap-4 text-sm">
                  <span className="text-green-100">
                    Waste diverted
                  </span>

                  <span className="font-semibold">
                    24.6 kg
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[72%] rounded-full bg-white" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between gap-4 text-sm">
                  <span className="text-green-100">
                    Monthly goal
                  </span>

                  <span className="font-semibold">
                    72%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[72%] rounded-full bg-white" />
                </div>
              </div>

            </div>

            <div className="mt-7 rounded-xl bg-white/10 p-4">
              <p className="text-xs text-green-100">
                Keep going
              </p>

              <p className="mt-1 text-sm font-semibold">
                You're on track to beat your monthly recycling goal.
              </p>
            </div>
          </div>

        </section>

        {/* FINAL CTA */}
        <section className="mt-8 rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm sm:p-8">
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