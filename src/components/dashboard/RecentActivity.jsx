import {
  CheckCircle2,
  Clock3,
  Leaf,
  Recycle,
  ArrowUpRight,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore"

import useAuth from "../../hooks/useAuth"
import { db } from "../../services/firebase"
import { getCreditTransactions } from "../../services/creditService"

function RecentActivity() {
  const { user } = useAuth()

  const [activities, setActivities] = useState([])

  const loadActivities = async () => {
    if (!user?.uid) {
      setActivities([])
      return
    }

    try {
      /* ==========================================
         1. LOAD CLEANUP SUBMISSIONS FROM FIRESTORE
         ========================================== */

      const submissionsQuery = query(
        collection(db, "cleanupSubmissions"),
        where("userId", "==", user.uid)
      )

      const submissionsSnapshot = await getDocs(
        submissionsQuery
      )

      const cleanupActivities = []

      submissionsSnapshot.forEach((submissionDoc) => {
        const data = submissionDoc.data()

        let createdAt = data.submittedAt

        /*
         Firestore Timestamp -> Date
        */
        if (
          createdAt &&
          typeof createdAt.toDate === "function"
        ) {
          createdAt = createdAt.toDate().toISOString()
        } else if (createdAt instanceof Date) {
          createdAt = createdAt.toISOString()
        }

        /*
         If submittedAt is missing, use verifiedAt
         */

        if (
          !createdAt &&
          data.verifiedAt
        ) {
          if (
            typeof data.verifiedAt.toDate ===
            "function"
          ) {
            createdAt =
              data.verifiedAt.toDate().toISOString()
          } else if (
            data.verifiedAt instanceof Date
          ) {
            createdAt =
              data.verifiedAt.toISOString()
          }
        }

        /*
         Determine status
         */

        const status =
          data.status === "approved"
            ? "verified"
            : "pending"

        /*
         Create cleanup activity
         */

        cleanupActivities.push({
          id: submissionDoc.id,
          type: "cleanup",
          title:
            data.mode === "cleanup"
              ? "Cleanup mission completed"
              : "Cleanup mission submitted",
          name:
            data.mode === "cleanup"
              ? "Cleanup mission completed"
              : "Cleanup mission submitted",
          category:
            data.terrain ||
            "Cleanup",
          createdAt,
          status,
          verified:
            data.status === "approved",
          credits:
            data.status === "approved"
              ? 10
              : 0,
          submissionId: submissionDoc.id,
        })
      })

      /* ==========================================
         2. LOAD ECO-CREDIT TRANSACTIONS
         ========================================== */

      const transactions =
        getCreditTransactions(user.uid)

      const creditActivities = Array.isArray(
        transactions
      )
        ? transactions.map((transaction) => {
            let createdAt =
              transaction?.createdAt

            /*
             Support Date / Firestore Timestamp /
             ISO string formats
            */

            if (
              createdAt &&
              typeof createdAt.toDate ===
                "function"
            ) {
              createdAt =
                createdAt.toDate().toISOString()
            } else if (
              createdAt instanceof Date
            ) {
              createdAt =
                createdAt.toISOString()
            }

            const amount = Number(
              transaction?.amount || 0
            )

            /*
             Cleanup credit transactions are already
             represented by cleanup submissions above.

             So don't show them twice.
            */

            if (
              transaction?.type === "cleanup"
            ) {
              return null
            }

            let title =
              transaction?.title ||
              "Eco-Credit activity"

            let category = "Eco-Credits"

            /*
             Better titles/categories for scan
             transactions.
            */

            if (
              transaction?.type === "scan"
            ) {
              title =
                transaction?.title ||
                "Waste scanned"

              category = "Waste Scan"
            }

            if (
              transaction?.type ===
              "redemption"
            ) {
              title =
                transaction?.title ||
                "Reward redeemed"

              category = "Reward"
            }

            const verified =
              transaction?.type ===
                "scan" ||
              transaction?.type ===
                "cleanup" ||
              transaction?.type ===
                "earning"

            return {
              id:
                transaction?.id ||
                `credit-${Math.random()}`,
              type: transaction?.type,
              title,
              name: title,
              category,
              createdAt,
              status: verified
                ? "verified"
                : "pending",
              verified,
              credits:
                amount > 0 ? amount : 0,
              amount,
            }
          })
        : []

      /* ==========================================
         3. COMBINE ALL REAL ACTIVITIES
         ========================================== */

      const combinedActivities = [
        ...cleanupActivities,
        ...creditActivities.filter(
          Boolean
        ),
      ]

      /* ==========================================
         4. SORT LATEST FIRST
         ========================================== */

      const sortedActivities =
        combinedActivities.sort((a, b) => {
          const dateA = a?.createdAt
            ? new Date(
                a.createdAt
              ).getTime()
            : 0

          const dateB = b?.createdAt
            ? new Date(
                b.createdAt
              ).getTime()
            : 0

          return dateB - dateA
        })

      /*
       Dashboard shows only the latest 4 activities.
       View All Activity still opens /activity.
      */

      setActivities(
        sortedActivities.slice(0, 4)
      )
    } catch (error) {
      console.error(
        "Failed to load recent activities:",
        error
      )

      setActivities([])
    }
  }

  /* ==========================================
     LOAD + LISTEN FOR UPDATES
     ========================================== */

  useEffect(() => {
    loadActivities()

    const handleUpdate = () => {
      loadActivities()
    }

    window.addEventListener(
      "eco-clean-hub-activity-updated",
      handleUpdate
    )

    window.addEventListener(
      "eco-clean-hub-credits-updated",
      handleUpdate
    )

    window.addEventListener(
      "storage",
      handleUpdate
    )

    window.addEventListener(
      "focus",
      handleUpdate
    )

    return () => {
      window.removeEventListener(
        "eco-clean-hub-activity-updated",
        handleUpdate
      )

      window.removeEventListener(
        "eco-clean-hub-credits-updated",
        handleUpdate
      )

      window.removeEventListener(
        "storage",
        handleUpdate
      )

      window.removeEventListener(
        "focus",
        handleUpdate
      )
    }
  }, [user?.uid])

  /* ==========================================
     DATE FORMAT
     ========================================== */

  const formatDate = (createdAt) => {
    if (!createdAt) {
      return "Recently"
    }

    const date = new Date(createdAt)

    if (Number.isNaN(date.getTime())) {
      return "Recently"
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    )
  }

  /* ==========================================
     TIME FORMAT
     ========================================== */

  const formatTime = (createdAt) => {
    if (!createdAt) {
      return ""
    }

    const date = new Date(createdAt)

    if (Number.isNaN(date.getTime())) {
      return ""
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-[#101c18] via-[#12251e] to-[#0b1713] p-5 text-white shadow-xl shadow-black/10 sm:p-6">

      {/* ================================
          BACKGROUND DECORATION
         ================================ */}

      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-400/10" />

      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-cyan-400/5" />

      <div className="relative z-10">

        {/* ================================
            HEADER
           ================================ */}

        <div className="mb-6 flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Recycle size={18} />
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white">
                Recent Activity
              </h2>

            </div>

            <p className="mt-2 text-sm text-slate-400">
              Your latest waste-management actions
            </p>
          </div>

          <Link
            to="/activity"
            className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-white/10 sm:flex"
          >
            View all
            <ArrowUpRight size={14} />
          </Link>

        </div>

        {/* ================================
            EMPTY STATE
           ================================ */}

        {activities.length === 0 ? (

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <Leaf size={26} />
            </div>

            <p className="mt-4 font-bold text-white">
              No recent activity
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Complete a waste-management activity
              to see it here.
            </p>

            <Link
              to="/scanner"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-[#062e20] transition hover:bg-emerald-300"
            >
              Scan Waste
              <ArrowUpRight size={15} />
            </Link>

          </div>

        ) : (

          /* ================================
             ACTIVITY LIST
             ================================ */

          <div className="space-y-3">

            {activities.map(
              (activity, index) => {

                const verified =
                  activity?.status ===
                    "verified" ||
                  activity?.status ===
                    "Verified" ||
                  activity?.verified ===
                    true

                const credits =
                  Number(
                    activity?.credits ||
                      0
                  )

                const title =
                  activity?.title ||
                  activity?.name ||
                  `${
                    activity?.category ||
                    "Waste"
                  } waste activity`

                const category =
                  activity?.category ||
                  "Waste"

                return (
                  <div
                    key={
                      activity?.id ||
                      `${activity?.createdAt}-${index}`
                    }
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition-all duration-300 hover:border-emerald-300/20 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-black/10"
                  >

                    {/* ICON */}

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 transition duration-300 group-hover:bg-emerald-400/15">
                      <Recycle size={20} />
                    </div>

                    {/* DETAILS */}

                    <div className="min-w-0 flex-1">

                      <h3 className="truncate text-sm font-semibold text-white">
                        {title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {category}
                        {" • "}
                        {formatDate(
                          activity?.createdAt
                        )}

                        {formatTime(
                          activity?.createdAt
                        ) && (
                          <>
                            {" • "}
                            {formatTime(
                              activity?.createdAt
                            )}
                          </>
                        )}
                      </p>

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="shrink-0 text-right">

                      {credits > 0 && (
                        <p className="text-sm font-bold text-emerald-300">
                          +{credits}
                        </p>
                      )}

                      <div className="mt-1 flex items-center justify-end gap-1">

                        {verified ? (
                          <>
                            <CheckCircle2
                              size={12}
                              className="text-emerald-400"
                            />

                            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                              Verified
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock3
                              size={12}
                              className="text-amber-400"
                            />

                            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                              Pending
                            </span>
                          </>
                        )}

                      </div>

                    </div>

                  </div>
                )
              }
            )}

          </div>
        )}

        {/* ================================
            BOTTOM BUTTON
           ================================ */}

        <Link
          to="/activity"
          className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-emerald-300 transition-all duration-300 hover:border-emerald-300/20 hover:bg-emerald-400/5"
        >
          View All Activity
          <ArrowUpRight size={15} />
        </Link>

      </div>
    </div>
  )
}

export default RecentActivity