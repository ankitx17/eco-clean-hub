import React from "react"
import {
  Activity as ActivityIcon,
  CheckCircle2,
  Clock3,
  Search,
  RefreshCw,
  Recycle,
  XCircle,
} from "lucide-react"

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore"

import { db } from "../../src/services/firebase"

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "green",
}) {
  const toneClasses = {
    green: "bg-green-50 text-[#0b8f4d]",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  }

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

        <div
          className={[
            "flex h-12 w-12 items-center justify-center rounded-xl",
            toneClasses[tone] || toneClasses.green,
          ].join(" ")}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) {
    return "—"
  }

  let date = null

  if (
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {
    date = value.toDate()
  } else {
    date = new Date(value)
  }

  if (
    !date ||
    Number.isNaN(date.getTime())
  ) {
    return "—"
  }

  return date.toLocaleString()
}

function getStatus(activity) {
  if (activity?.verified === true) {
    return "Verified"
  }

  if (
    typeof activity?.status === "string" &&
    activity.status.trim()
  ) {
    return activity.status
  }

  return "Recorded"
}

function getStatusClasses(status) {
  const normalized =
    String(status || "")
      .toLowerCase()

  if (
    normalized.includes("verified") ||
    normalized.includes("approved")
  ) {
    return "bg-green-50 text-green-700"
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("review")
  ) {
    return "bg-amber-50 text-amber-700"
  }

  if (
    normalized.includes("reject")
  ) {
    return "bg-red-50 text-red-700"
  }

  return "bg-slate-100 text-slate-600"
}

function Activities() {
  const [activities, setActivities] =
    React.useState([])

  const [loading, setLoading] =
    React.useState(true)

  const [error, setError] =
    React.useState("")

  const [search, setSearch] =
    React.useState("")

  const [statusFilter, setStatusFilter] =
    React.useState("All")

  const loadActivities = async () => {
    setLoading(true)
    setError("")

    try {
      const activitiesQuery = query(
        collection(
          db,
          "wasteActivities"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      )

      const snapshot =
        await getDocs(
          activitiesQuery
        )

      const loadedActivities =
        snapshot.docs.map(
          (documentSnapshot) => ({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          })
        )

      setActivities(
        loadedActivities
      )
    } catch (loadError) {
      console.error(
        "Failed to load activities:",
        loadError
      )

      setError(
        loadError?.message ||
          "Unable to load activities."
      )

      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadActivities()
  }, [])

  const filteredActivities =
    activities.filter(
      (activity) => {
        const status =
          getStatus(activity)

        if (
          statusFilter !== "All" &&
          status !== statusFilter
        ) {
          return false
        }

        const queryText =
          search
            .trim()
            .toLowerCase()

        if (!queryText) {
          return true
        }

        const searchableText = [
          activity?.userName,
          activity?.userEmail,
          activity?.userId,
          activity?.title,
          activity?.category,
          activity?.type,
          activity?.id,
          status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return searchableText.includes(
          queryText
        )
      }
    )

  const totalActivities =
    activities.length

  const verifiedActivities =
    activities.filter(
      (activity) =>
        getStatus(activity)
          .toLowerCase() ===
        "verified"
    ).length

  const pendingActivities =
    activities.filter(
      (activity) => {
        const status =
          getStatus(activity)
            .toLowerCase()

        return (
          status.includes("pending") ||
          status.includes("review")
        )
      }
    ).length

  const totalCredits =
    activities.reduce(
      (total, activity) =>
        total +
        Number(
          activity?.credits || 0
        ),
      0
    )

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#176b45]">
            Monitoring
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#14231a]">
            Activities
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor waste activities and recycling actions
            recorded across Eco Clean Hub.
          </p>
        </div>

        <button
          type="button"
          onClick={loadActivities}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          STATS
          ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Activities"
          value={totalActivities.toLocaleString()}
          icon={ActivityIcon}
          tone="green"
        />

        <StatCard
          label="Verified Activities"
          value={verifiedActivities.toLocaleString()}
          icon={CheckCircle2}
          tone="blue"
        />

        <StatCard
          label="Pending Review"
          value={pendingActivities.toLocaleString()}
          icon={Clock3}
          tone="amber"
        />

        <StatCard
          label="Credits Earned"
          value={totalCredits.toLocaleString()}
          icon={Recycle}
          tone="green"
        />

      </div>

      {/* =====================================================
          SEARCH + FILTER
          ===================================================== */}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row">

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search user, email, category, activity..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#0b8f4d] focus:bg-white"
          />

        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b8f4d]"
        >
          <option value="All">
            All statuses
          </option>

          <option value="Verified">
            Verified
          </option>

          <option value="Scanned">
            Scanned
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Rejected">
            Rejected
          </option>
        </select>

      </div>

      {/* =====================================================
          ACTIVITY TABLE
          ===================================================== */}

      <section className="overflow-hidden rounded-3xl border border-[#dce9e1] bg-white shadow-sm">

        <div className="border-b border-[#edf2ee] p-6">

          <h2 className="text-lg font-black text-[#14231a]">
            Waste Activity Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredActivities.length}{" "}
            {filteredActivities.length === 1
              ? "activity"
              : "activities"}{" "}
            found
          </p>

        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">

            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">

              <RefreshCw
                size={20}
                className="animate-spin text-[#0b8f4d]"
              />

              Loading activities...

            </div>

          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-[#0b8f4d]">
              <ActivityIcon size={30} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              No activities found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Waste activity records will appear here once
              users start recording waste actions.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-[1100px] w-full">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    User
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Activity
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Credits
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredActivities.map(
                  (activity) => {
                    const status =
                      getStatus(activity)

                    return (
                      <tr
                        key={activity.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        {/* USER */}

                        <td className="px-5 py-4">

                          <div>
                            <p className="font-bold text-slate-800">
                              {activity?.userName ||
                                "Citizen"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {activity?.userEmail ||
                                activity?.userId ||
                                "—"}
                            </p>
                          </div>

                        </td>

                        {/* ACTIVITY */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-700">
                            {activity?.title ||
                              "Waste activity"}
                          </p>

                          {activity?.type && (
                            <p className="mt-1 text-xs text-slate-400">
                              {activity.type}
                            </p>
                          )}

                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-4">

                          <span className="inline-flex rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-[#176b45]">
                            {activity?.category ||
                              "Other"}
                          </span>

                        </td>

                        {/* CREDITS */}

                        <td className="px-5 py-4">

                          <span className="font-black text-[#0b8f4d]">
                            +{Number(
                              activity?.credits || 0
                            )}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={[
                              "inline-flex rounded-lg px-3 py-1.5 text-xs font-bold",
                              getStatusClasses(
                                status
                              ),
                            ].join(" ")}
                          >
                            {status}
                          </span>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4 text-sm font-medium text-slate-500">
                          {formatDate(
                            activity?.createdAt
                          )}
                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  )
}

export default Activities