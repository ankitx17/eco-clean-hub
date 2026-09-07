import {
  Gift,
  Package,
  Coins,
  Clock3,
} from "lucide-react"

function StatCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-[#14231a]">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d]">
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function Rewards() {
  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#176b45]">
          Management
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#14231a]">
          Rewards
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage reward catalogue, reward costs, stock and
          redemption requests.
        </p>
      </div>

      {/* =====================================================
          STATS
          ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Rewards"
          value="0"
          icon={Gift}
        />

        <StatCard
          label="Available Stock"
          value="0"
          icon={Package}
        />

        <StatCard
          label="Credits Redeemed"
          value="0"
          icon={Coins}
        />

        <StatCard
          label="Pending Redemptions"
          value="0"
          icon={Clock3}
        />

      </div>

      {/* =====================================================
          REWARD CATALOGUE
          ===================================================== */}

      <section className="rounded-3xl border border-[#dce9e1] bg-white shadow-sm">

        <div className="border-b border-[#edf2ee] p-6">
          <h2 className="text-lg font-black text-[#14231a]">
            Reward Catalogue
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Rewards available for Eco-Credit redemption.
          </p>
        </div>

        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-[#0b8f4d]">
            <Gift size={30} />
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-800">
            No rewards added yet
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Reward items will appear here once they are added
            to the catalogue.
          </p>

        </div>
      </section>
      {/* =====================================================
          REDEMPTIONS
          ===================================================== */}
      <section className="rounded-3xl border border-[#dce9e1] bg-white shadow-sm">
        <div className="border-b border-[#edf2ee] p-6">
          <h2 className="text-lg font-black text-[#14231a]">
            Redemption Requests
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review and process user reward redemption requests.
          </p>
        </div>
        <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Package size={26} />
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-800">
            No redemption requests
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Pending reward redemption requests will appear here.
          </p>
        </div>
      </section>
    </div>
  )}
export default Rewards