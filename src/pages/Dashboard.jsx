import {
  ScanLine,
  MapPin,
  ShieldCheck,
  Coins,
  TrendingUp,
  Recycle,
  ArrowUpRight,
} from "lucide-react"
import { Link } from "react-router-dom"

const stats = [
  {
    title: "Eco Credits",
    value: "1,250",
    change: "+12%",
    icon: Coins,
  },
  {
    title: "Waste Actions",
    value: "48",
    change: "+8 this month",
    icon: Recycle,
  },
  {
    title: "Verified",
    value: "36",
    change: "75% verified",
    icon: ShieldCheck,
  },
  {
    title: "Impact",
    value: "32.4 kg",
    change: "Waste diverted",
    icon: TrendingUp,
  },
]

const activities = [
  {
    type: "Plastic",
    date: "Today, 10:30 AM",
    credits: "+50",
    status: "Verified",
  },
  {
    type: "Paper",
    date: "Yesterday, 5:20 PM",
    credits: "+30",
    status: "Verified",
  },
  {
    type: "E-waste",
    date: "Aug 31, 2:15 PM",
    credits: "+80",
    status: "Pending",
  },
]

function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-[#176b45]">
            Citizen Dashboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Good morning, Ankit 👋
          </h1>

          <p className="mt-2 text-gray-500">
            Make your next waste action count for the planet.
          </p>
        </div>

        <Link
          to="/scanner"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#176b45]/20 transition hover:bg-[#125c3b]"
        >
          <ScanLine size={18} />
          Scan Waste
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-[#dce9df] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f5ec] text-[#176b45]">
                  <Icon size={21} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-gray-400"
                />
              </div>

              <p className="mt-5 text-sm text-gray-500">
                {stat.title}
              </p>

              <div className="mt-1 flex items-end justify-between">
                <h2 className="text-2xl font-bold">
                  {stat.value}
                </h2>

                <span className="text-xs font-semibold text-[#176b45]">
                  {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Start your next sustainable action.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            to="/scanner"
            className="group rounded-2xl border border-[#cfe5d6] bg-[#176b45] p-6 text-white transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <ScanLine size={23} />
              </div>

              <ArrowUpRight
                size={22}
                className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>

            <h3 className="mt-8 text-xl font-bold">
              Scan Your Waste
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
              Use AI to identify your waste and get the correct disposal
              recommendation.
            </p>
          </Link>

          <Link
            to="/mrf"
            className="group rounded-2xl border border-[#dce9df] bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7f5ec] text-[#176b45]">
                <MapPin size={23} />
              </div>

              <ArrowUpRight
                size={22}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>

            <h3 className="mt-8 text-xl font-bold">
              Find Nearby MRF
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
              Discover nearby material recovery facilities and collection
              centres that accept your waste.
            </p>
          </Link>
        </div>
      </section>

      {/* Activity */}
      <section className="rounded-2xl border border-[#dce9df] bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest waste-management actions.
            </p>
          </div>

          <Link
            to="/activity"
            className="text-sm font-semibold text-[#176b45] hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-6 divide-y divide-[#edf2ee]">
          {activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.date}`}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f5ec] text-[#176b45]">
                  <Recycle size={18} />
                </div>

                <div>
                  <p className="font-semibold">
                    {activity.type} Waste
                  </p>

                  <p className="text-xs text-gray-500">
                    {activity.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    activity.status === "Verified"
                      ? "bg-[#e7f5ec] text-[#176b45]"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {activity.status}
                </span>

                <span className="font-bold text-[#176b45]">
                  {activity.credits}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard