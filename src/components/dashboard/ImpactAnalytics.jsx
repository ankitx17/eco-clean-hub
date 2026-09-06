import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Leaf,
  Recycle,
  TrendingUp,
  TreePine,
  Target,
} from "lucide-react"

import useAuth from "../../hooks/useAuth"

// Project-level deterministic assumptions.
const ESTIMATED_WEIGHT_KG = {
  Plastic: 0.25,
  Paper: 0.2,
  Glass: 0.5,
  Metal: 0.25,
  Organic: 0.5,
  "E-Waste": 0.3,
  Textile: 0.3,
  Hazardous: 0.2,
  Other: 0.25,
  "Non-Waste": 0,
}

// Project impact factors
const CO2_KG_PER_KG_DIVERTED = 0.75
const TREES_PER_KG_CO2 = 0.147
const MONTHLY_GOAL_KG = 34

function ImpactAnalytics() {
  const { user } = useAuth()

  const [activities, setActivities] = useState([])

  const loadActivities = () => {
    if (!user?.uid) {
      setActivities([])
      return
    }

    try {
      const activityKey = `eco_clean_hub_activity_${user.uid}`

      const storedActivities = JSON.parse(
        localStorage.getItem(activityKey) || "[]",
      )

      setActivities(
        Array.isArray(storedActivities)
          ? storedActivities
          : [],
      )
    } catch (error) {
      console.error(
        "Failed to load impact activities:",
        error,
      )

      setActivities([])
    }
  }

  useEffect(() => {
    loadActivities()

    const handleActivityUpdate = () => {
      loadActivities()
    }

    window.addEventListener(
      "eco-clean-hub-activity-updated",
      handleActivityUpdate,
    )

    window.addEventListener(
      "storage",
      handleActivityUpdate,
    )

    window.addEventListener(
      "focus",
      handleActivityUpdate,
    )

    return () => {
      window.removeEventListener(
        "eco-clean-hub-activity-updated",
        handleActivityUpdate,
      )

      window.removeEventListener(
        "storage",
        handleActivityUpdate,
      )

      window.removeEventListener(
        "focus",
        handleActivityUpdate,
      )
    }
  }, [user?.uid])

  const impact = useMemo(() => {
    const now = new Date()

    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let totalWasteKg = 0
    let monthlyWasteKg = 0

    activities.forEach((activity) => {
      const category =
        activity?.category || "Other"

      const storedRecycledKg =
        Number(activity?.recycledKg)

      const storedWeightKg =
        Number(activity?.weightKg)

      let weightKg = 0

      if (storedRecycledKg > 0) {
        weightKg = storedRecycledKg
      } else if (storedWeightKg > 0) {
        weightKg = storedWeightKg
      } else {
        weightKg =
          ESTIMATED_WEIGHT_KG[category] ??
          0.25
      }

      if (category === "Non-Waste") {
        weightKg = 0
      }

      totalWasteKg += weightKg

      const createdAt = activity?.createdAt
        ? new Date(activity.createdAt)
        : null

      if (
        createdAt &&
        !Number.isNaN(createdAt.getTime()) &&
        createdAt.getMonth() === currentMonth &&
        createdAt.getFullYear() === currentYear
      ) {
        monthlyWasteKg += weightKg
      }
    })

    const co2Kg =
      totalWasteKg *
      CO2_KG_PER_KG_DIVERTED

    const treesEquivalent =
      co2Kg *
      TREES_PER_KG_CO2

    const monthlyProgress = Math.min(
      100,
      Math.round(
        (monthlyWasteKg /
          MONTHLY_GOAL_KG) *
          100,
      ),
    )

    return {
      totalWasteKg,
      co2Kg,
      treesEquivalent,
      monthlyWasteKg,
      monthlyProgress,
    }
  }, [activities])

  const impactStats = [
    {
      title: "Total Waste Diverted",
      value: impact.totalWasteKg.toFixed(1),
      unit: "kg",
      change:
        impact.monthlyWasteKg > 0
          ? `+${impact.monthlyWasteKg.toFixed(1)} kg`
          : "0 kg",
      icon: Recycle,
      theme:
        "from-[#e7f8ee] via-[#f4fbf7] to-[#d5f1e1]",
      iconBg:
        "bg-[#176b45]",
    },

    {
      title: "CO₂ Reduction",
      value: impact.co2Kg.toFixed(1),
      unit: "kg",
      change:
        impact.monthlyWasteKg > 0
          ? `+${(
              impact.monthlyWasteKg *
              CO2_KG_PER_KG_DIVERTED
            ).toFixed(1)} kg`
          : "0 kg",
      icon: Leaf,
      theme:
        "from-[#e2f6f1] via-[#f5fbfa] to-[#cdeee5]",
      iconBg:
        "bg-[#0f766e]",
    },

    {
      title: "Trees Equivalent",
      value: impact.treesEquivalent.toFixed(1),
      unit: "trees",
      change:
        impact.monthlyWasteKg > 0
          ? `+${(
              impact.monthlyWasteKg *
              CO2_KG_PER_KG_DIVERTED *
              TREES_PER_KG_CO2
            ).toFixed(1)}`
          : "0",
      icon: TreePine,
      theme:
        "from-[#f1f8df] via-[#fafcf3] to-[#e6f1c8]",
      iconBg:
        "bg-[#4d7c0f]",
    },
  ]

  return (
    <section className="mb-8">

      {/* ================= HEADER ================= */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#176b45] text-white shadow-md shadow-green-900/10">
            <BarChart3 size={21} />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#102a1f]">
              Personal Impact Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              See how your waste-management actions
              are making a real impact
            </p>
          </div>

        </div>

        <div className="hidden rounded-full border border-[#bce5cc] bg-[#eaf8ef] px-4 py-2 text-xs font-semibold text-[#176b45] sm:flex sm:items-center sm:gap-2">
          <Leaf size={14} />
          Small Actions · Big Change
        </div>

      </div>


      {/* ================= IMPACT CARDS ================= */}
      <div className="grid gap-4 md:grid-cols-3">

        {impactStats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className={`group relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br ${stat.theme} p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >

              {/* Decorative circle */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/50 transition-transform duration-500 group-hover:scale-125" />

              {/* Decorative bottom circle */}
              <div className="pointer-events-none absolute -bottom-12 -right-6 h-28 w-28 rounded-full bg-white/30" />


              <div className="relative z-10">

                {/* TOP */}
                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} text-white shadow-md`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="flex items-center gap-1 rounded-full border border-green-200 bg-white/70 px-2.5 py-1.5 text-[10px] font-bold text-[#176b45] backdrop-blur-sm">
                    <TrendingUp size={11} />
                    Growing
                  </div>

                </div>


                {/* TITLE */}
                <p className="mt-6 text-sm font-semibold text-[#315f4d]">
                  {stat.title}
                </p>


                {/* VALUE */}
                <div className="mt-1 flex items-end gap-2">

                  <h3 className="text-3xl font-extrabold tracking-tight text-[#102a1f]">
                    {stat.value}
                  </h3>

                  <span className="mb-1 text-xs font-medium text-slate-500">
                    {stat.unit}
                  </span>

                </div>


                {/* CHANGE */}
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#159447]">
                  <TrendingUp size={13} />
                  {stat.change} this month
                </div>


                {/* BOTTOM DESCRIPTION */}
                <p className="mt-5 max-w-[220px] text-xs leading-5 text-slate-500">
                  {stat.title ===
                    "Total Waste Diverted" &&
                    "Every kilogram counts towards a cleaner planet."}

                  {stat.title ===
                    "CO₂ Reduction" &&
                    "Lower emissions for a healthier tomorrow."}

                  {stat.title ===
                    "Trees Equivalent" &&
                    "You're helping create a greener, healthier Earth."}
                </p>

              </div>

            </div>
          )
        })}

      </div>


      {/* ================= MONTHLY PROGRESS ================= */}
      <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d4f35] via-[#176b45] to-[#0d5a3a] p-5 text-white shadow-lg sm:p-6">

        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5" />

        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#69d99a]/5" />


        <div className="relative z-10">

          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                <Target size={21} />
              </div>

              <div>
                <h3 className="font-bold text-white">
                  Monthly Recycling Progress
                </h3>

                <p className="mt-1 text-xs text-green-100">
                  Your progress towards this month's
                  environmental goal
                </p>
              </div>

            </div>


            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-white/15 bg-white/10 text-sm font-extrabold text-white">
              {impact.monthlyProgress}%
            </div>

          </div>


          {/* PROGRESS BAR */}
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">

            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6ee7a5] to-[#b8f36a] shadow-[0_0_12px_rgba(184,243,106,0.35)] transition-all duration-700"
              style={{
                width: `${impact.monthlyProgress}%`,
              }}
            />

          </div>


          {/* PROGRESS DETAILS */}
          <div className="mt-4 flex items-end justify-between">

            <div>
              <p className="text-2xl font-extrabold">
                {impact.monthlyWasteKg.toFixed(1)} kg
              </p>

              <p className="mt-1 text-xs text-green-100">
                Recycled this month
              </p>
            </div>


            <div className="text-right">

              <p className="text-lg font-bold">
                Goal: {MONTHLY_GOAL_KG} kg
              </p>

              <p className="mt-1 text-xs text-green-100">
                {impact.monthlyProgress >= 100
                  ? "Goal achieved! 🎉"
                  : "Keep making an impact!"}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ================= BOTTOM MESSAGE ================= */}
      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#cfe9da] bg-gradient-to-r from-[#eaf8ef] to-[#f5fbf7] px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d3f2df] text-[#176b45]">
            <Leaf size={18} />
          </div>

          <div>

            <p className="text-sm font-semibold text-[#194b37]">
              A cleaner planet starts with people like you.
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Keep recycling and keep making a difference.
            </p>

          </div>

        </div>

        <div className="hidden text-xs font-bold tracking-widest text-[#31815b] sm:block">
          REDUCE · RECYCLE · REVIVE
        </div>

      </div>

    </section>
  )
}

export default ImpactAnalytics