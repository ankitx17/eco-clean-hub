import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Leaf,
  Recycle,
  TrendingUp,
  TreePine,
} from "lucide-react"
import useAuth from "../../hooks/useAuth"

// Project-level deterministic assumptions.
// If a real weight is stored on an activity, that real value is used first.
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

// Project impact factors used consistently for dashboard calculations.
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
        Array.isArray(storedActivities) ? storedActivities : [],
      )
    } catch (error) {
      console.error("Failed to load impact activities:", error)
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

    window.addEventListener("storage", handleActivityUpdate)

    return () => {
      window.removeEventListener(
        "eco-clean-hub-activity-updated",
        handleActivityUpdate,
      )

      window.removeEventListener("storage", handleActivityUpdate)
    }
  }, [user?.uid])

  const impact = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let totalWasteKg = 0
    let monthlyWasteKg = 0

    activities.forEach((activity) => {
      const category = activity?.category || "Other"

      const storedRecycledKg = Number(activity?.recycledKg)
      const storedWeightKg = Number(activity?.weightKg)

      let weightKg = 0

      if (storedRecycledKg > 0) {
        weightKg = storedRecycledKg
      } else if (storedWeightKg > 0) {
        weightKg = storedWeightKg
      } else {
        weightKg = ESTIMATED_WEIGHT_KG[category] ?? 0.25
      }

      // Non-waste classifications should not contribute to environmental impact.
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

    const co2Kg = totalWasteKg * CO2_KG_PER_KG_DIVERTED
    const treesEquivalent = co2Kg * TREES_PER_KG_CO2

    const monthlyProgress = Math.min(
      100,
      Math.round((monthlyWasteKg / MONTHLY_GOAL_KG) * 100),
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
    },
    {
      title: "CO₂ Reduction",
      value: impact.co2Kg.toFixed(1),
      unit: "kg",
      change:
        impact.monthlyWasteKg > 0
          ? `+${(impact.monthlyWasteKg * CO2_KG_PER_KG_DIVERTED).toFixed(1)} kg`
          : "0 kg",
      icon: Leaf,
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
    },
  ]

  return (
    <section className="mb-8">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-[#176b45]" />

          <h2 className="text-xl font-bold">
            Personal Impact Analytics
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          See how your waste-management actions are making an impact
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {impactStats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                  <Icon size={21} />
                </div>

                <div className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-[#176b45]">
                  <TrendingUp size={11} />
                  Growing
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-500">
                {stat.title}
              </p>

              <div className="mt-1 flex items-end gap-2">
                <h3 className="text-3xl font-bold">
                  {stat.value}
                </h3>

                <span className="mb-1 text-xs text-slate-400">
                  {stat.unit}
                </span>
              </div>

              <p className="mt-2 text-xs font-medium text-green-600">
                ↑ {stat.change} this month
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">
              Monthly Recycling Progress
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Your progress towards this month's environmental goal
            </p>
          </div>

          <span className="text-lg font-bold text-[#176b45]">
            {impact.monthlyProgress}%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#edf2ee]">
          <div
            className="h-full rounded-full bg-[#176b45] transition-all duration-500"
            style={{
              width: `${impact.monthlyProgress}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-400">
          <span>
            {impact.monthlyWasteKg.toFixed(1)} kg
          </span>

          <span>
            Goal: {MONTHLY_GOAL_KG} kg
          </span>
        </div>
      </div>
    </section>
  )
}

export default ImpactAnalytics