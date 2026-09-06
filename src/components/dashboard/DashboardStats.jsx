import {
  Recycle,
  Target,
  TrendingUp,
  Trophy,
  WalletCards,
} from "lucide-react"
import { useEffect, useState } from "react"

import useAuth from "../../hooks/useAuth"
import { getCreditBalance } from "../../services/creditService"

function DashboardStats() {
  const { user } = useAuth()

  const [credits, setCredits] = useState(0)
  const [wasteRecycled, setWasteRecycled] = useState(0)
  const [verifiedActions, setVerifiedActions] = useState(0)

  useEffect(() => {
    const loadStats = () => {
      const savedWaste = localStorage.getItem("wasteRecycled")
      const savedActions = localStorage.getItem("verifiedActions")

      // Eco-Credits come from the same source as Eco-Credits Wallet
      setCredits(
        user?.uid ? getCreditBalance(user.uid) : 0
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
    window.addEventListener(
      "eco-clean-hub-credits-updated",
      loadStats
    )

    return () => {
      window.removeEventListener("storage", loadStats)
      window.removeEventListener("focus", loadStats)
      window.removeEventListener(
        "eco-clean-hub-credits-updated",
        loadStats
      )
    }
  }, [user?.uid])

  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      {/* =====================================================
          ECO CREDITS
          ===================================================== */}

      <div className="group relative overflow-hidden rounded-2xl border border-[#b9dcc7] bg-gradient-to-br from-[#ffffff] via-[#f2faf5] to-[#dcefe4] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#176b45]/10 transition-transform duration-300 group-hover:scale-110" />

        <div className="relative">

          <div className="mb-5 flex items-start justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#176b45] text-white shadow-md">
              <WalletCards size={21} />
            </div>

            <span className="flex items-center gap-1 rounded-full border border-[#b9dcc7] bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#176b45]">
              <TrendingUp size={12} />
              +12%
            </span>

          </div>

          <p className="text-sm font-medium text-slate-500">
            Eco-Credits
          </p>

          <div className="mt-1 flex items-end gap-2">

            <h2 className="text-3xl font-extrabold tracking-tight text-[#14231a]">
              {credits.toLocaleString()}
            </h2>

            <span className="mb-1 text-xs font-medium text-slate-400">
              credits
            </span>

          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#dcebe2]">

            <div className="h-full w-[35%] rounded-full bg-[#176b45]" />

          </div>

        </div>

      </div>


      {/* =====================================================
          WASTE RECYCLED
          ===================================================== */}

      <div className="group relative overflow-hidden rounded-2xl border border-[#c7d8ee] bg-gradient-to-br from-[#ffffff] via-[#f5f9ff] to-[#e5eefb] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/10 transition-transform duration-300 group-hover:scale-110" />

        <div className="relative">

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-md">
            <Recycle size={21} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Waste Recycled
          </p>

          <div className="mt-1 flex items-end gap-2">

            <h2 className="text-3xl font-extrabold tracking-tight text-[#14231a]">
              {wasteRecycled.toFixed(1)}
            </h2>

            <span className="mb-1 text-xs font-medium text-slate-400">
              kg
            </span>

          </div>

          <p className="mt-3 flex items-center gap-1 text-xs font-medium text-[#059669]">
            <TrendingUp size={12} />
            Updated from your missions
          </p>

        </div>

      </div>


      {/* =====================================================
          VERIFIED ACTIONS
          ===================================================== */}

      <div className="group relative overflow-hidden rounded-2xl border border-[#dfc9ed] bg-gradient-to-br from-[#ffffff] via-[#faf5ff] to-[#f0e5f8] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-purple-500/10 transition-transform duration-300 group-hover:scale-110" />

        <div className="relative">

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white shadow-md">
            <Target size={21} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Verified Actions
          </p>

          <div className="mt-1 flex items-end gap-2">

            <h2 className="text-3xl font-extrabold tracking-tight text-[#14231a]">
              {verifiedActions}
            </h2>

            <span className="mb-1 text-xs font-medium text-slate-400">
              actions
            </span>

          </div>

          <p className="mt-3 flex items-center gap-1 text-xs font-medium text-[#059669]">
            <TrendingUp size={12} />
            +1 with each verified mission
          </p>

        </div>

      </div>


      {/* =====================================================
          COMMUNITY RANK
          ===================================================== */}

      <div className="group relative overflow-hidden rounded-2xl border border-[#f0c8c5] bg-gradient-to-br from-[#ffffff] via-[#fff7f6] to-[#fbe6e3] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-red-500/10 transition-transform duration-300 group-hover:scale-110" />

        <div className="relative">

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc2626] to-[#f97316] text-white shadow-md">
            <Trophy size={21} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Community Rank
          </p>

          <div className="mt-1 flex items-end gap-2">

            <h2 className="text-3xl font-extrabold tracking-tight text-[#14231a]">
              #24
            </h2>

            <span className="mb-1 text-xs font-medium text-slate-400">
              this month
            </span>

          </div>

          <p className="mt-3 flex items-center gap-1 text-xs font-medium text-[#dc2626]">
            <TrendingUp size={12} />
            8 positions
          </p>

        </div>

      </div>

    </section>
  )
}

export default DashboardStats