import {
  ArrowUpRight,
  Coins,
  History,
  Leaf,
  TrendingUp,
  Gift,
  Sparkles,
} from "lucide-react"

import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

import useAuth from "../../hooks/useAuth"

import {
  getCreditBalance,
  getCreditTransactions,
} from "../../services/creditService"


function EcoCreditsCard() {
  const { user } = useAuth()

  const [credits, setCredits] = useState(0)
  const [transactions, setTransactions] = useState([])

  const loadCredits = () => {
    if (!user?.uid) {
      setCredits(0)
      setTransactions([])
      return
    }

    setCredits(getCreditBalance(user.uid))

    setTransactions(
      getCreditTransactions(user.uid),
    )
  }

  useEffect(() => {
    loadCredits()

    const handleUpdate = () => {
      loadCredits()
    }

    window.addEventListener(
      "eco-clean-hub-credits-updated",
      handleUpdate,
    )

    window.addEventListener(
      "storage",
      handleUpdate,
    )

    window.addEventListener(
      "focus",
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

      window.removeEventListener(
        "focus",
        handleUpdate,
      )
    }
  }, [user?.uid])


  const earnings = transactions
    .filter(
      (item) =>
        Number(item.amount) > 0,
    )
    .slice(0, 3)


  const monthlyCredits = transactions
    .filter((item) => {
      if (Number(item.amount) <= 0) {
        return false
      }

      const date = new Date(
        item.createdAt,
      )

      const now = new Date()

      return (
        date.getMonth() ===
          now.getMonth() &&
        date.getFullYear() ===
          now.getFullYear()
      )
    })
    .reduce(
      (total, item) =>
        total + Number(item.amount),
      0,
    )


  return (
    <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">

      {/* =====================================================
          ECO-CREDITS WALLET
         ===================================================== */}
      <div className="group relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#075b3c] via-[#087a4d] to-[#064d35] p-6 text-white shadow-[0_18px_45px_rgba(6,91,59,0.20)] sm:p-7">

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#5ee7a0]/10" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#35b878]/10" />

        <div className="pointer-events-none absolute right-20 top-20 h-2 w-2 rounded-full bg-white/40" />

        <div className="pointer-events-none absolute right-28 top-32 h-1.5 w-1.5 rounded-full bg-white/30" />

        <div className="relative z-10">

          {/* HEADER */}
          <div className="flex items-start justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/10">
                  <Coins size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    Eco-Credits Wallet
                  </p>

                  <p className="text-[11px] text-emerald-100/75">
                    Your actions, your impact
                  </p>
                </div>

              </div>

            </div>


            {/* GROWING BADGE */}
            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold backdrop-blur-sm sm:flex">
              <Sparkles size={13} />
              Keep Growing
            </div>

          </div>


          {/* BALANCE */}
          <div className="mt-8">

            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-100/70">
              Available Balance
            </p>

            <div className="mt-1 flex items-end gap-3">

              <h2 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                {credits.toLocaleString()}
              </h2>

              <span className="mb-2 text-base font-semibold text-emerald-100/80">
                Eco-Credits
              </span>

            </div>

          </div>


          {/* MONTHLY PROGRESS */}
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-medium text-emerald-100/75">
                  Earned this month
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <TrendingUp size={16} />

                  <span className="text-xl font-bold">
                    +{monthlyCredits}
                  </span>

                  <span className="text-xs text-emerald-100/70">
                    credits
                  </span>

                </div>

              </div>


              <div className="rounded-full bg-[#b9f5d0]/15 px-3 py-1.5 text-xs font-bold text-[#c9f9da]">
                {monthlyCredits > 0
                  ? "Active"
                  : "Start earning"}
              </div>

            </div>


            {/* SMALL PROGRESS BAR */}
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full rounded-full bg-[#8cf0b5] transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    monthlyCredits > 0
                      ? Math.max(
                          8,
                          Math.min(
                            100,
                            monthlyCredits / 100 * 100,
                          ),
                        )
                      : 0,
                  )}%`,
                }}
              />

            </div>

          </div>


          {/* ACTION BUTTONS */}
          <div className="mt-5 flex flex-wrap gap-3">

            <Link
              to="/redeem"
              className="group/btn inline-flex items-center gap-2 rounded-xl bg-[#d4f8df] px-5 py-3 text-sm font-bold text-[#075b3c] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              <Gift size={17} />

              Redeem Credits

              <ArrowUpRight
                size={16}
                className="transition group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </Link>


            <Link
              to="/activity"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              <History size={17} />

              History
            </Link>

          </div>

        </div>
      </div>


      {/* =====================================================
          EARNING SUMMARY
         ===================================================== */}
      <div className="rounded-[28px] border border-[#dbe9e1] bg-white p-6 shadow-[0_10px_30px_rgba(20,70,45,0.07)] sm:p-7">

        {/* HEADER */}
        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f8ef] text-[#087a4d]">
              <TrendingUp size={20} />
            </div>

            <div>

              <h2 className="text-xl font-extrabold text-[#10251c]">
                Earning Summary
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Your recent Eco-Credit earnings
              </p>

            </div>

          </div>


          <span className="hidden rounded-full bg-[#eef8f2] px-3 py-1.5 text-[10px] font-bold text-[#087a4d] sm:block">
            THIS MONTH
          </span>

        </div>


        {/* EARNINGS */}
        {earnings.length === 0 ? (

          <div className="mt-6 flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9e8df] bg-[#f7fbf8] px-5 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7f7ee] text-[#087a4d]">
              <Leaf size={22} />
            </div>

            <p className="mt-3 text-sm font-bold text-[#263a31]">
              No earnings yet
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
              Complete a mission or scan waste to start earning Eco-Credits.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-3">

            {earnings.map(
              (earning) => (

                <div
                  key={earning.id}
                  className="group flex items-center gap-3 rounded-2xl border border-[#e7eee9] bg-[#fbfdfc] p-3.5 transition hover:border-[#cce4d5] hover:bg-[#f6fbf8]"
                >

                  {/* ICON */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f8ef] text-[#087a4d]">
                    <Leaf size={18} />
                  </div>


                  {/* DETAILS */}
                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-bold text-[#182b22]">
                      {earning.title}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {earning.createdAt
                        ? new Date(
                            earning.createdAt,
                          ).toLocaleDateString()
                        : "Recently"}
                    </p>

                  </div>


                  {/* CREDIT */}
                  <div className="text-right">

                    <p className="text-sm font-extrabold text-[#07804e]">
                      +{Number(
                        earning.amount,
                      )}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      credits
                    </p>

                  </div>

                </div>
              ),
            )}

          </div>

        )}


        {/* HISTORY BUTTON */}
        <Link
          to="/activity"
          className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#cfe2d7] bg-[#f8fcfa] py-3 text-sm font-bold text-[#087a4d] transition hover:border-[#087a4d] hover:bg-[#edf8f1]"
        >
          View complete earning history

          <ArrowUpRight size={15} />
        </Link>

      </div>

    </section>
  )
}


export default EcoCreditsCard