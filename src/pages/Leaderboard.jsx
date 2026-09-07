import {
  ArrowLeft,
  Crown,
  Medal,
  Trophy,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import useAuth from "../hooks/useAuth"
import {
  buildLeaderboard,
  getLeaderboardEntries,
} from "../data/leaderboardData"

function Leaderboard() {
  const { user } = useAuth()

  const [period, setPeriod] =
    useState("community")

  const [entries, setEntries] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const loadLeaderboard = async () => {
    setLoading(true)
    setError("")

    try {
      const data =
        await getLeaderboardEntries(
          period,
        )

      setEntries(data)
    } catch (error) {
      console.error(
        "Failed to load leaderboard:",
        error,
      )

      setEntries([])

      setError(
        "Unable to load leaderboard data.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [period])

  useEffect(() => {
    const handleCreditsUpdate = () => {
      loadLeaderboard()
    }

    const handleActivityUpdate = () => {
      loadLeaderboard()
    }

    window.addEventListener(
      "eco-clean-hub-credits-updated",
      handleCreditsUpdate,
    )

    window.addEventListener(
      "eco-clean-hub-activity-updated",
      handleActivityUpdate,
    )

    return () => {
      window.removeEventListener(
        "eco-clean-hub-credits-updated",
        handleCreditsUpdate,
      )

      window.removeEventListener(
        "eco-clean-hub-activity-updated",
        handleActivityUpdate,
      )
    }
  }, [period])

  const leaderboard = useMemo(
    () =>
      buildLeaderboard({
        entries,
        period,
      }),
    [entries, period],
  )

  const currentUser =
    leaderboard.find(
      (entry) =>
        entry.id === user?.uid,
    )

  return (
    <main className="min-h-screen bg-[#f6faf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <header className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-[#176b45]"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
              <Trophy size={24} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#176b45]">
                Eco Clean Hub
              </p>

              <h1 className="mt-1 text-3xl font-black text-[#102119]">
                Leaderboard
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            See how your environmental contribution
            compares with the community.
          </p>
        </header>

        {/* PERIOD BUTTONS */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-green-100 bg-white p-2 shadow-sm">
          {[
            ["weekly", "Weekly"],
            ["monthly", "Monthly"],
            ["community", "Community"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setPeriod(value)
              }
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                period === value
                  ? "bg-[#176b45] text-white"
                  : "text-slate-500 hover:bg-green-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* YOUR CURRENT RANK */}
        {currentUser && (
          <section className="mb-6 rounded-3xl bg-[#176b45] p-6 text-white shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-green-100">
                  Your Current Rank
                </p>

                <p className="mt-1 text-4xl font-black">
                  #{currentUser.rank}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-green-100">
                  Eco-Credits
                </p>

                <p className="mt-1 text-2xl font-black">
                  {Number(
                    currentUser.credits || 0,
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* LEADERBOARD */}
        <section className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-black text-[#14231a]">
              {period === "weekly"
                ? "Weekly Leaders"
                : period === "monthly"
                  ? "Monthly Leaders"
                  : "Community Leaders"}
            </h2>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-500">
                Loading leaderboard...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-red-500">
                {error}
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            leaderboard.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No leaderboard data available yet.
                </p>
              </div>
            )}

          {/* USERS */}
          {!loading &&
            !error &&
            leaderboard.length > 0 && (
              <div className="divide-y divide-slate-100">
                {leaderboard.map(
                  (entry) => {
                    const isMe =
                      entry.id ===
                      user?.uid

                    return (
                      <article
                        key={entry.id}
                        className={`flex items-center gap-4 px-6 py-5 ${
                          isMe
                            ? "bg-green-50/70"
                            : ""
                        }`}
                      >

                        {/* RANK */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-600">
                          {entry.rank ===
                          1 ? (
                            <Crown
                              size={21}
                              className="text-yellow-500"
                            />
                          ) : entry.rank ===
                            2 ? (
                            <Medal
                              size={21}
                              className="text-slate-400"
                            />
                          ) : entry.rank ===
                            3 ? (
                            <Medal
                              size={21}
                              className="text-orange-500"
                            />
                          ) : (
                            entry.rank
                          )}
                        </div>

                        {/* USER INFO */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-[#14231a]">
                            {entry.name}

                            {isMe &&
                              " (You)"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {entry.verified} verified
                            actions •{" "}
                            {entry.wasteKg} kg
                            diverted
                          </p>
                        </div>

                        {/* CREDITS */}
                        <div className="text-right">
                          <p className="font-black text-[#176b45]">
                            {Number(
                              entry.credits ||
                                0,
                            ).toLocaleString()}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            credits
                          </p>
                        </div>

                      </article>
                    )
                  },
                )}
              </div>
            )}
        </section>
      </div>
    </main>
  )
}

export default Leaderboard