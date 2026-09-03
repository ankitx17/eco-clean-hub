import {
  Recycle,
  Target,
  TrendingUp,
  Trophy,
  WalletCards,
} from "lucide-react"

function DashboardStats() {
  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <div className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

        <div className="mb-5 flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#176b45]">
            <WalletCards size={21} />
          </div>

          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-[#176b45]">
            <TrendingUp size={12} />
            +12%
          </span>
        </div>

        <p className="text-sm text-slate-500">
          Eco-Credits
        </p>

        <div className="mt-1 flex items-end gap-2">
          <h2 className="text-3xl font-bold">
            1,240
          </h2>

          <span className="mb-1 text-xs text-slate-400">
            credits
          </span>
        </div>

      </div>

      <div className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Recycle size={21} />
        </div>

        <p className="text-sm text-slate-500">
          Waste Recycled
        </p>

        <div className="mt-1 flex items-end gap-2">
          <h2 className="text-3xl font-bold">
            24.6
          </h2>

          <span className="mb-1 text-xs text-slate-400">
            kg
          </span>
        </div>

        <p className="mt-2 text-xs text-green-600">
          ↑ 4.2 kg this month
        </p>

      </div>

      <div className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          <Target size={21} />
        </div>

        <p className="text-sm text-slate-500">
          Verified Actions
        </p>

        <div className="mt-1 flex items-end gap-2">
          <h2 className="text-3xl font-bold">
            18
          </h2>

          <span className="mb-1 text-xs text-slate-400">
            actions
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          3 actions this week
        </p>

      </div>

      <div className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Trophy size={21} />
        </div>

        <p className="text-sm text-slate-500">
          Community Rank
        </p>

        <div className="mt-1 flex items-end gap-2">
          <h2 className="text-3xl font-bold">
            #24
          </h2>

          <span className="mb-1 text-xs text-slate-400">
            this month
          </span>
        </div>

        <p className="mt-2 text-xs text-green-600">
          ↑ 8 positions
        </p>

      </div>

    </section>
  )
}

export default DashboardStats