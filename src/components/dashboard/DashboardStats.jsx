import {
  Recycle,
  Target,
  TrendingUp,
  Trophy,
  WalletCards,
} from "lucide-react"

import { useEffect, useState } from "react"

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore"

import useAuth from "../../hooks/useAuth"
import { db } from "../../services/firebase"
import { getCreditBalance } from "../../services/creditService"


function DashboardStats() {
  const { user } = useAuth()

  const [credits, setCredits] = useState(0)
  const [wasteRecycled, setWasteRecycled] = useState(0)
  const [verifiedActions, setVerifiedActions] = useState(0)
  const [communityRank, setCommunityRank] = useState(null)


  useEffect(() => {
    const loadStats = async () => {
      if (!user?.uid) {
        setCredits(0)
        setWasteRecycled(0)
        setVerifiedActions(0)
        setCommunityRank(null)
        return
      }

      try {
        // ---------------------------------------------
        // ECO CREDITS
        // ---------------------------------------------

        const currentCredits =
          await getCreditBalance(user.uid)

        setCredits(
          Number(currentCredits || 0)
        )


        // ---------------------------------------------
        // CLEANUP SUBMISSIONS
        // ---------------------------------------------

        const submissionsQuery = query(
          collection(
            db,
            "cleanupSubmissions"
          ),
          where(
            "userId",
            "==",
            user.uid
          )
        )

        const snapshot =
          await getDocs(
            submissionsQuery
          )

        let totalWaste = 0
        let totalVerified = 0

        snapshot.forEach(
          (submissionDoc) => {
            const data =
              submissionDoc.data()

            // Only approved submissions count
            if (
              data.status === "approved"
            ) {
              totalWaste += Number(
                data.wasteKg || 0
              )

              totalVerified += 1
            }
          }
        )

        setWasteRecycled(
          totalWaste
        )

        setVerifiedActions(
          totalVerified
        )


        // ---------------------------------------------
        // COMMUNITY RANK
        // ---------------------------------------------

        const leaderboardSnapshot =
          await getDocs(
            collection(
              db,
              "leaderboard"
            )
          )

        const leaderboardUsers =
          leaderboardSnapshot.docs.map(
            (leaderboardDoc) => {
              const data =
                leaderboardDoc.data()

              return {
                uid:
                  data.uid ||
                  leaderboardDoc.id,

                credits:
                  Number(
                    data.credits || 0
                  ),
              }
            }
          )


        // Highest credits first
        leaderboardUsers.sort(
          (a, b) =>
            b.credits -
            a.credits
        )


        // Find current logged-in user
        const userIndex =
          leaderboardUsers.findIndex(
            (leaderboardUser) =>
              leaderboardUser.uid ===
              user.uid
          )


        if (userIndex !== -1) {
          setCommunityRank(
            userIndex + 1
          )
        } else {
          setCommunityRank(null)
        }

      } catch (error) {
        console.error(
          "Unable to load dashboard stats:",
          error
        )
      }
    }


    loadStats()


    // ---------------------------------------------
    // REFRESH EVENTS
    // ---------------------------------------------

    window.addEventListener(
      "storage",
      loadStats
    )

    window.addEventListener(
      "focus",
      loadStats
    )

    window.addEventListener(
      "eco-clean-hub-credits-updated",
      loadStats
    )

    window.addEventListener(
      "eco-clean-hub-activity-updated",
      loadStats
    )


    return () => {
      window.removeEventListener(
        "storage",
        loadStats
      )

      window.removeEventListener(
        "focus",
        loadStats
      )

      window.removeEventListener(
        "eco-clean-hub-credits-updated",
        loadStats
      )

      window.removeEventListener(
        "eco-clean-hub-activity-updated",
        loadStats
      )
    }
  }, [user?.uid])


  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      {/* ECO CREDITS */}

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
          ↑ 4.2 kg this month
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


        <p className="mt-2 text-xs text-slate-400">
          3 actions this week
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
            {communityRank
              ? `#${communityRank}`
              : "—"}
          </h2>

          <span className="mb-1 text-xs text-slate-400">
            overall
          </span>

        </div>


        <p className="mt-2 text-xs text-green-600">
          Based on Eco-Credits
        </p>

      </div>

    </section>
  )
}


export default DashboardStats