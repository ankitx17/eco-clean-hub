import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  History,
  Leaf,
  ShoppingBag,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import useAuth from "../hooks/useAuth"
import {
  getCreditBalance,
  getRedemptions,
  redeemReward,
  REWARD_CATALOG,
} from "../services/creditService"

function Rewards() {
  const { user } = useAuth()

  const [balance, setBalance] =
    useState(0)

  const [redemptions, setRedemptions] =
    useState([])

  const [message, setMessage] =
    useState("")

  const [error, setError] =
    useState("")

  const loadData = () => {
    if (!user?.uid) return

    setBalance(
      getCreditBalance(user.uid),
    )

    setRedemptions(
      getRedemptions(user.uid),
    )
  }

  useEffect(() => {
    loadData()

    const handleUpdate = () => {
      loadData()
    }

    window.addEventListener(
      "eco-clean-hub-credits-updated",
      handleUpdate,
    )

    window.addEventListener(
      "storage",
      handleUpdate,
    )

    return () => {
      window.removeEventListener(
        "eco-clean-hub-credits-updated",
        handleUpdate,
      )

      window.removeEventListener(
        "storage",
        handleUpdate,
      )
    }
  }, [user?.uid])

  const handleRedeem = (reward) => {
    setMessage("")
    setError("")

    if (!user?.uid) {
      setError(
        "Please login to redeem rewards.",
      )
      return
    }

    try {
      const result = redeemReward({
        userId: user.uid,
        rewardId: reward.id,
      })

      setBalance(result.balance)
      setRedemptions(
        getRedemptions(user.uid),
      )

      setMessage(
        `${reward.title} redeemed successfully!`,
      )
    } catch (redeemError) {
      setError(
        redeemError.message ||
          "Unable to redeem this reward.",
      )
    }
  }

  return (
    <main className="min-h-screen bg-[#f6faf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-[#176b45]"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-[#176b45]">
                <Leaf size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#176b45]">
                  Eco Clean Hub
                </p>

                <h1 className="mt-1 text-3xl font-black text-[#102119]">
                  Rewards
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              Use your Eco-Credits to redeem
              useful environmental rewards.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#176b45] px-5 py-4 text-white shadow-lg">
            <Coins size={22} />

            <div>
              <p className="text-xs text-green-100">
                Available Credits
              </p>

              <p className="text-2xl font-black">
                {balance.toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-black text-[#14231a]">
              Reward Catalogue
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Redeem your credits for eco-friendly
              rewards.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REWARD_CATALOG.map(
              (reward) => {
                const canRedeem =
                  balance >= reward.cost

                return (
                  <article
                    key={reward.id}
                    className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl">
                        {reward.icon}
                      </div>

                      <ShoppingBag
                        size={20}
                        className="text-slate-300"
                      />
                    </div>

                    <h3 className="mt-5 text-xl font-black text-[#14231a]">
                      {reward.title}
                    </h3>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                      {reward.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[#176b45]">
                        <Coins size={17} />
                        {reward.cost}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRedeem(
                            reward,
                          )
                        }
                        disabled={!canRedeem}
                        className="rounded-xl bg-[#176b45] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#125a39] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        {canRedeem
                          ? "Redeem"
                          : "Not enough"}
                      </button>
                    </div>
                  </article>
                )
              },
            )}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#176b45]">
              <History size={20} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#14231a]">
                Redemption History
              </h2>

              <p className="text-sm text-slate-500">
                Your redeemed rewards
              </p>
            </div>
          </div>

          <div className="mt-5">
            {redemptions.length === 0 ? (
              <div className="rounded-2xl bg-[#f7fcf8] p-8 text-center">
                <p className="font-bold text-[#14231a]">
                  No rewards redeemed yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Your redemption history will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {redemptions.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-bold text-[#14231a]">
                          {item.rewardTitle}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            item.createdAt,
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          {item.status}
                        </span>

                        <span className="font-black text-red-500">
                          -{item.cost}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Rewards