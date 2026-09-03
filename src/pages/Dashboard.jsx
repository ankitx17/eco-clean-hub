import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Leaf,
  MapPin,
  Recycle,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react"

import { Link } from "react-router-dom"

import EcoCreditsCard from "../components/dashboard/EcoCreditsCard"
import RecentActivity from "../components/dashboard/RecentActivity"
import DashboardHeader from "../components/dashboard/DashboardHeader"
import DashboardStats from "../components/dashboard/DashboardStats"
import ImpactAnalytics from "../components/dashboard/ImpactAnalytics"

function Dashboard() {
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
    {
      title: "View Rewards",
      description: "Redeem your Eco-Credits",
      icon: Trophy,
      to: "/rewards",
    },
  ]

  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#14231a]">

      {/* HEADER */}
      <DashboardHeader />

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

        {/* WELCOME */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-[#176b45]">
                <Sparkles size={14} />
                Keep making an impact
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, Ankit 👋
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Your small actions create a cleaner, greener future.
                Keep recycling and grow your environmental impact.
              </p>

            </div>

            <Link
              to="/scanner"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#125a39]"
            >
              <Camera size={18} />
              Scan Waste
              <ArrowRight size={16} />
            </Link>

          </div>
        </section>

        {/* STATS */}
        <DashboardStats />

        {/* ECO CREDITS */}
        <section className="mb-8">
          <EcoCreditsCard />
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {quickActions.map((action) => {

              const Icon = action.icon

              return (
                <Link
                  key={action.title}
                  to={action.to}
                  className="group rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#bcd8c7] hover:shadow-lg"
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
          <div className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest waste-management actions
                </p>
              </div>

              <Link
                to="/activity"
                className="text-sm font-semibold text-[#176b45] hover:underline"
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
                    className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="truncate text-sm font-semibold">
                        {activity.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {activity.date}
                      </p>

                    </div>

                    <div className="text-right">

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
          <div className="overflow-hidden rounded-2xl bg-[#176b45] p-6 text-white shadow-xl">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-green-100">
                  Your Environmental Impact
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Making a difference
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Leaf size={22} />
              </div>

            </div>

            <div className="my-7 h-px bg-white/15" />

            <div className="space-y-5">

              <div>

                <div className="mb-2 flex justify-between text-sm">

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

                <div className="mb-2 flex justify-between text-sm">

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
        <section className="mt-8 rounded-2xl border border-[#dfeae3] bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">

            <div>

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
              className="inline-flex items-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#125a39]"
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