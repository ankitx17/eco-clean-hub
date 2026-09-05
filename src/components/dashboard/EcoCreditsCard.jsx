import {
  ArrowUpRight,
  Coins,
  History,
  Leaf,
  TrendingUp,
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

    setCredits(
      getCreditBalance(user.uid),
    )

    setTransactions(
      getCreditTransactions(
        user.uid,
      ),
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


  const earnings =
    transactions
      .filter(
        (item) =>
          Number(item.amount) > 0,
      )
      .slice(0, 3)


  const monthlyCredits =
    transactions
      .filter(
        (item) => {
          if (
            Number(item.amount) <=
            0
          ) {
            return false
          }

          const date =
            new Date(
              item.createdAt,
            )

          const now = new Date()

          return (
            date.getMonth() ===
              now.getMonth() &&
            date.getFullYear() ===
              now.getFullYear()
          )
        },
      )
      .reduce(
        (total, item) =>
          total +
          Number(item.amount),
        0,
      )


  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

      {/* CREDIT WALLET */}
      <div className="relative overflow-hidden rounded-3xl bg-[#176b45] p-6 text-white shadow-xl shadow-green-900/10 sm:p-8">

        {/* Background decoration */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />

        <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5" />


        <div className="relative">

          {/* HEADER */}
          <div className="flex items-start justify-between">

            <div>

              <div className="flex items-center gap-2 text-green-100">

                <Coins size={18} />

                <span className="text-sm font-medium">
                  Eco-Credits Wallet
                </span>

              </div>


              <p className="mt-6 text-sm text-green-100">
                Available balance
              </p>


              {/* CREDIT BALANCE */}
              <div className="mt-1 flex items-end gap-2">

                <h2 className="text-5xl font-bold tracking-tight">
                  {credits.toLocaleString()}
                </h2>

                <span className="mb-2 text-sm text-green-100">
                  credits
                </span>

              </div>

            </div>


            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Leaf size={26} />
            </div>

          </div>


          {/* MONTHLY EARNING */}
          <div className="mt-8 flex items-center justify-between rounded-2xl bg-white/10 p-4">

            <div>

              <p className="text-xs text-green-100">
                Earned this month
              </p>


              <div className="mt-1 flex items-center gap-2">

                <TrendingUp size={15} />

                <span className="text-lg font-bold">
                  +{monthlyCredits}
                </span>

                <span className="text-xs text-green-100">
                  credits
                </span>

              </div>

            </div>


            <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
              {monthlyCredits > 0
                ? "Active"
                : "Start earning"}
            </div>

          </div>


          {/* ACTIONS */}
          <div className="mt-5 flex flex-wrap gap-3">

            <Link
              to="/rewards"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#176b45] transition hover:bg-green-50"
            >
              Redeem Credits
              <ArrowUpRight size={16} />
            </Link>


            <Link
              to="/activity"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
            >
              <History size={16} />
              History
            </Link>

          </div>

        </div>

      </div>


      {/* EARNING SUMMARY */}
      <div className="rounded-3xl border border-[#dfeae3] bg-white p-6 shadow-sm sm:p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold">
              Earning Summary
            </h2>


            <p className="mt-1 text-sm text-slate-500">
              Your recent Eco-Credit earnings
            </p>

          </div>

        </div>


        {/* EARNINGS */}
        {earnings.length === 0 ? (

          <div className="mt-6 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#176b45]">
              <Leaf size={22} />
            </div>


            <p className="mt-4 text-sm font-semibold text-slate-600">
              No earnings yet
            </p>


            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
              Scan waste to start earning Eco-Credits.
            </p>

          </div>

        ) : (

          <div className="mt-6 max-h-[330px] space-y-4 overflow-y-auto pr-1">

            {earnings.map(
              (earning) => (

                <div
                  key={earning.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3.5"
                >

                  {/* ICON */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                    <Leaf size={18} />
                  </div>


                  {/* DETAILS */}
                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-semibold">
                      {earning.title}
                    </p>


                    <p className="mt-1 text-xs text-slate-400">
                      {earning.createdAt
                        ? new Date(
                            earning.createdAt,
                          ).toLocaleDateString()
                        : "Recently"}
                    </p>

                  </div>


                  {/* CREDIT */}
                  <div className="text-right">

                    <p className="text-sm font-bold text-[#176b45]">
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
          className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#dfeae3] py-3 text-sm font-semibold text-[#176b45] hover:bg-green-50"
        >
          View complete earning history
          <ArrowUpRight size={15} />
        </Link>

      </div>

    </section>
  )
}


export default EcoCreditsCard