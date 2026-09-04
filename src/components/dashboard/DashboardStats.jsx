import {
  Recycle,
  Target,
  TrendingUp,
  Trophy,
  WalletCards,
} from "lucide-react"
import { useEffect, useState } from "react"

function DashboardStats() {
  const [credits, setCredits] = useState(0)
  const [wasteRecycled, setWasteRecycled] = useState(0)
  const [verifiedActions, setVerifiedActions] = useState(0)

  useEffect(() => {
    const loadStats = () => {
      const savedCredits = localStorage.getItem("ecoCredits")
      const savedWaste = localStorage.getItem("wasteRecycled")
      const savedActions = localStorage.getItem("verifiedActions")

      setCredits(
        savedCredits !== null ? Number(savedCredits) : 0
      )

      setWasteRecycled(
        savedWaste !== null ? Number(savedWaste) : 0
      )

      setVerifiedActions(
        savedActions !== null ? Number(savedActions) : 0
      )
    }

    loadStats()

    window.addEventListener("storage", loadStats)
    window.addEventListener("focus", loadStats)

    return () => {
      window.removeEventListener("storage", loadStats)
      window.removeEventListener("focus", loadStats)
    }
  }, [])

  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      {/* ECO-CREDITS */}
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
            {credits.toLocaleString()}
          </h2>

          <span className="mb-1 text-xs text-slate-400">
            credits
          </span>
        </div>

      </div>

      {/* WASTE RECYCLED */}
      <div className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Recycle size={21} />
        </div>

        <p className="text-sm text-slate-500">
          Waste Recycled
        </p>

        <div className="mt-1 flex items-end gap-2">
          <h2 className="text-3xl font-bold">
            {wasteRecycled.toFixed(1)}
          </h2>

          <span className="mb-1 text-xs text-slate-400">
            kg
          </span>
        </div>

        <p className="mt-2 text-xs text-green-600">
          ↑ Updated from your missions
        </p>

      </div>

      {/* VERIFIED ACTIONS */}
      <div className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          <Target size={21} />
        </div>

        <p className="text-sm text-slate-500">
          Verified Actions
        </p>

        <div className="mt-1 flex items-end gap-2">
          <h2 className="text-3xl font-bold">
            {verifiedActions}
          </h2>

          <span className="mb-1 text-xs text-slate-400">
            actions
          </span>
        </div>

        <p className="mt-2 text-xs text-green-600">
          ↑ +1 with each verified mission
        </p>

      </div>

      {/* COMMUNITY RANK */}
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