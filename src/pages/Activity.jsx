import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ScanLine,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Link } from "react-router-dom"
import useAuth from "../hooks/useAuth"

function Activity() {
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
        localStorage.getItem(activityKey) || "[]"
      )

      setActivities(
        Array.isArray(storedActivities) ? storedActivities : []
      )
    } catch (error) {
      console.error("Failed to load activity:", error)
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
      handleActivityUpdate
    )

    window.addEventListener("storage", handleActivityUpdate)

    return () => {
      window.removeEventListener(
        "eco-clean-hub-activity-updated",
        handleActivityUpdate
      )

      window.removeEventListener("storage", handleActivityUpdate)
    }
  }, [user?.uid])

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable"

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable"
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusStyles = (status) => {
    if (
      status === "verified" ||
      status === "Verified"
    ) {
      return "bg-green-100 text-green-700"
    }

    if (
      status === "pending" ||
      status === "Pending"
    ) {
      return "bg-amber-100 text-amber-700"
    }

    return "bg-slate-100 text-slate-600"
  }

  const clearActivity = () => {
    if (!user?.uid || activities.length === 0) {
      return
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear your scan activity?"
    )

    if (!confirmed) {
      return
    }

    try {
      const activityKey = `eco_clean_hub_activity_${user.uid}`

      localStorage.removeItem(activityKey)
      setActivities([])

      window.dispatchEvent(
        new Event("eco-clean-hub-activity-updated")
      )
    } catch (error) {
      console.error("Failed to clear activity:", error)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6faf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-[#0b8f4d]"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-[#0b8f4d]">
                <ScanLine size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b8f4d]">
                  Eco Clean Hub
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-[#102119]">
                  My Activity
                </h1>
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Your real waste scanning history appears here.
              No estimated credits or environmental impact are added
              until they are actually recorded.
            </p>
          </div>

          {activities.length > 0 && (
            <button
              type="button"
              onClick={clearActivity}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={17} />
              Clear Activity
            </button>
          )}
        </header>

        {/* Summary */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#0b8f4d]">
                <ScanLine size={19} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Scans
                </p>

                <p className="mt-1 text-2xl font-black text-[#14231a]">
                  {activities.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#0b8f4d]">
                <Sparkles size={19} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  AI Classified
                </p>

                <p className="mt-1 text-2xl font-black text-[#14231a]">
                  {activities.filter(
                    (activity) => activity.category
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Verified
                </p>

                <p className="mt-1 text-2xl font-black text-[#14231a]">
                  {
                    activities.filter(
                      (activity) =>
                        activity.status === "verified" ||
                        activity.status === "Verified" ||
                        activity.verified === true
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Activity list */}
        <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-lg">

          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <h2 className="text-xl font-black text-[#14231a]">
              Scan History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest scans are shown first.
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="px-6 py-16 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-[#0b8f4d]">
                <ScanLine size={28} />
              </div>

              <h3 className="mt-5 text-xl font-black text-[#14231a]">
                No activity yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Scan a waste item using the AI Waste Scanner and
                your real scan history will appear here.
              </p>

              <Link
                to="/scanner"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3 font-bold text-white transition hover:bg-[#087b42]"
              >
                <ScanLine size={18} />
                Scan Waste
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((activity) => {
                const isVerified =
                  activity.status === "verified" ||
                  activity.status === "Verified" ||
                  activity.verified === true

                return (
                  <article
                    key={activity.id}
                    className="px-6 py-6 transition hover:bg-[#f9fcfa] sm:px-8"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-[#0b8f4d]">
                          <ScanLine size={21} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-[#14231a]">
                            {activity.title ||
                              `${activity.category || "Waste"} waste scanned`}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>
                              {formatDate(activity.createdAt)}
                            </span>

                            <span className="text-slate-300">
                              •
                            </span>

                            <span>
                              {activity.type || "Classification available"}
                            </span>
                          </div>

                          {activity.category && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#0b8f4d]">
                                {activity.category}
                              </span>

                              {typeof activity.confidence === "number" && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  {activity.confidence}% confidence
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {isVerified ? (
                          <CheckCircle2
                            size={17}
                            className="text-[#0b8f4d]"
                          />
                        ) : (
                          <Clock3
                            size={17}
                            className="text-slate-400"
                          />
                        )}

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyles(
                            activity.status
                          )}`}
                        >
                          {activity.status || "Scanned"}
                        </span>
                      </div>

                    </div>

                    {/* Real impact values only */}
                    {(Number(activity.credits) > 0 ||
                      Number(activity.weightKg) > 0 ||
                      Number(activity.recycledKg) > 0 ||
                      Number(activity.co2Kg) > 0) && (
                      <div className="mt-5 grid gap-3 rounded-2xl bg-[#f7fcf8] p-4 sm:grid-cols-4">
                        {Number(activity.credits) > 0 && (
                          <div>
                            <p className="text-xs text-slate-400">
                              Credits
                            </p>
                            <p className="mt-1 font-black text-[#0b8f4d]">
                              +{activity.credits}
                            </p>
                          </div>
                        )}

                        {Number(activity.weightKg) > 0 && (
                          <div>
                            <p className="text-xs text-slate-400">
                              Waste Weight
                            </p>
                            <p className="mt-1 font-black text-[#14231a]">
                              {activity.weightKg} kg
                            </p>
                          </div>
                        )}

                        {Number(activity.recycledKg) > 0 && (
                          <div>
                            <p className="text-xs text-slate-400">
                              Recycled
                            </p>
                            <p className="mt-1 font-black text-[#14231a]">
                              {activity.recycledKg} kg
                            </p>
                          </div>
                        )}

                        {Number(activity.co2Kg) > 0 && (
                          <div>
                            <p className="text-xs text-slate-400">
                              CO₂ Saved
                            </p>
                            <p className="mt-1 font-black text-[#14231a]">
                              {activity.co2Kg} kg
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}

        </section>

      </div>
    </main>
  )
}

export default Activity