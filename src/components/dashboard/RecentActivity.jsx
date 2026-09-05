import {
  CheckCircle2,
  Clock3,
  Leaf,
  Recycle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

function RecentActivity() {
  const { user } = useAuth()

  const [activities, setActivities] =
    useState([])

  const loadActivities = () => {
    if (!user?.uid) {
      setActivities([])
      return
    }

    try {
      const key =
        `eco_clean_hub_activity_${user.uid}`

      const saved =
        JSON.parse(
          localStorage.getItem(key) ||
            "[]",
        )

      setActivities(
        Array.isArray(saved)
          ? saved.slice(0, 4)
          : [],
      )
    } catch {
      setActivities([])
    }
  }

  useEffect(() => {
    loadActivities()

    const handleUpdate = () => {
      loadActivities()
    }

    window.addEventListener(
      "eco-clean-hub-activity-updated",
      handleUpdate,
    )

    return () => {
      window.removeEventListener(
        "eco-clean-hub-activity-updated",
        handleUpdate,
      )
    }
  }, [user?.uid])

  return (
    <div className="rounded-3xl border border-[#dfeae3] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#14231a]">
            Recent Waste Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track your latest recycling and
            disposal actions
          </p>
        </div>

        <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#176b45] sm:flex">
          <Recycle size={20} />
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl bg-[#f7fcf8] p-6 text-center">
          <Leaf
            size={25}
            className="mx-auto text-[#176b45]"
          />

          <p className="mt-3 font-bold text-[#14231a]">
            No recent activity
          </p>

          <Link
            to="/scanner"
            className="mt-4 inline-flex rounded-xl bg-[#176b45] px-4 py-2.5 text-sm font-bold text-white"
          >
            Scan Waste
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(
            (activity) => {
              const verified =
                activity.status ===
                  "verified" ||
                activity.status ===
                  "Verified" ||
                activity.verified ===
                  true

              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                    <Recycle size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-[#14231a]">
                      {activity.title ||
                        `${activity.category || "Waste"} waste scanned`}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {activity.category ||
                        "Waste"}
                      {" • "}
                      {activity.createdAt
                        ? new Date(
                            activity.createdAt,
                          ).toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {Number(
                      activity.credits,
                    ) > 0 && (
                      <p className="text-sm font-bold text-[#176b45]">
                        +
                        {
                          activity.credits
                        }
                      </p>
                    )}

                    <div className="mt-1 flex items-center justify-end gap-1">
                      {verified ? (
                        <>
                          <CheckCircle2
                            size={12}
                            className="text-green-600"
                          />
                          <span className="text-[10px] font-semibold text-green-600">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock3
                            size={12}
                            className="text-slate-400"
                          />
                          <span className="text-[10px] font-semibold text-slate-500">
                            Scanned
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            },
          )}
        </div>
      )}

      <Link
        to="/activity"
        className="mt-5 flex items-center justify-center rounded-xl border border-[#dfeae3] py-3 text-sm font-semibold text-[#176b45] hover:bg-green-50"
      >
        View All Activity
      </Link>
    </div>
  )
}

export default RecentActivity