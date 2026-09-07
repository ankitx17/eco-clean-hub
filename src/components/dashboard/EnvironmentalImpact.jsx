import { useEffect, useState } from "react"
import { Leaf, TrendingUp } from "lucide-react"
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore"

import useAuth from "../../hooks/useAuth"
import { db } from "../../services/firebase"

const MONTHLY_GOAL_KG = 34

function EnvironmentalImpact() {
  const { user } = useAuth()

  const [wasteDiverted, setWasteDiverted] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImpact = async () => {
      if (!user?.uid) {
        setWasteDiverted(0)
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const submissionsQuery = query(
          collection(db, "cleanupSubmissions"),
          where("userId", "==", user.uid)
        )

        const snapshot = await getDocs(submissionsQuery)

        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        let totalMonthlyWaste = 0

        snapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data()

          // Only admin-approved submissions count
          const status = String(
            data.status || ""
          ).toLowerCase()

          if (status !== "approved") {
            return
          }

          // Convert Firestore Timestamp / Date / string
          let submittedDate = null

          if (
            data.submittedAt &&
            typeof data.submittedAt.toDate === "function"
          ) {
            submittedDate = data.submittedAt.toDate()
          } else if (data.submittedAt instanceof Date) {
            submittedDate = data.submittedAt
          } else if (data.submittedAt) {
            const parsedDate = new Date(data.submittedAt)

            if (!Number.isNaN(parsedDate.getTime())) {
              submittedDate = parsedDate
            }
          }

          // Only current month's approved waste
          if (
            !submittedDate ||
            submittedDate.getMonth() !== currentMonth ||
            submittedDate.getFullYear() !== currentYear
          ) {
            return
          }

          const wasteKg = Number(data.wasteKg) || 0

          if (wasteKg > 0) {
            totalMonthlyWaste += wasteKg
          }
        })

        setWasteDiverted(totalMonthlyWaste)
      } catch (error) {
        console.error(
          "Failed to load environmental impact:",
          error
        )

        setWasteDiverted(0)
      } finally {
        setLoading(false)
      }
    }

    loadImpact()
  }, [user?.uid])

  const monthlyPercentage =
    MONTHLY_GOAL_KG > 0
      ? Math.round(
          (wasteDiverted / MONTHLY_GOAL_KG) * 100
        )
      : 0

  const progress = Math.min(
    monthlyPercentage,
    100
  )

  let message = "Start recycling to make an impact."

  if (monthlyPercentage >= 100) {
    message =
      "You've reached your monthly recycling goal! 🎉"
  } else if (monthlyPercentage >= 80) {
    message =
      "You're almost at your monthly recycling goal!"
  } else if (monthlyPercentage >= 50) {
    message =
      "You're making great progress toward your monthly goal."
  } else if (monthlyPercentage > 0) {
    message =
      "Keep going and continue building your environmental impact."
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-[#176b45] p-5 text-white shadow-xl sm:p-6">
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
        {/* WASTE DIVERTED */}
        <div>
          <div className="mb-2 flex justify-between gap-4 text-sm">
            <span className="text-green-100">
              Waste diverted
            </span>

            <span className="font-semibold">
              {loading
                ? "..."
                : `${wasteDiverted.toFixed(1)} kg`}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* MONTHLY GOAL */}
        <div>
          <div className="mb-2 flex justify-between gap-4 text-sm">
            <span className="text-green-100">
              Monthly goal
            </span>

            <span className="font-semibold">
              {loading
                ? "..."
                : `${monthlyPercentage}%`}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* MESSAGE */}
      <div className="mt-7 rounded-xl bg-white/10 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <TrendingUp size={15} />
          </div>

          <p className="text-xs text-green-100">
            {monthlyPercentage >= 100
              ? "Goal achieved"
              : "Keep going"}
          </p>
        </div>

        <p className="mt-2 text-sm font-semibold">
          {loading
            ? "Loading your environmental impact..."
            : message}
        </p>
      </div>
    </section>
  )
}

export default EnvironmentalImpact