import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  History,
  Lock,
  Phone,
  ShoppingBag,
  Sparkles,
  Ticket,
  WalletCards,
  X,
} from "lucide-react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function RedeemRewards() {
  const navigate = useNavigate()

  const [credits, setCredits] = useState(0)
  const [selectedReward, setSelectedReward] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [redeemedReward, setRedeemedReward] = useState(null)
  const [history, setHistory] = useState([])

  // --------------------------------------------------
  // LOAD CREDITS + HISTORY
  // --------------------------------------------------

  useEffect(() => {
    loadRewardsData()

    window.addEventListener("focus", loadRewardsData)

    return () => {
      window.removeEventListener("focus", loadRewardsData)
    }
  }, [])

  const loadRewardsData = () => {
    const savedCredits = localStorage.getItem("ecoCredits")
    const savedHistory = localStorage.getItem("redemptionHistory")

    setCredits(
      savedCredits !== null ? Number(savedCredits) : 0
    )

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch {
        setHistory([])
      }
    }
  }

  // --------------------------------------------------
  // REWARDS
  // --------------------------------------------------

  const rewards = [
    {
      id: "mobile10",
      title: "Mobile Recharge",
      subtitle: "₹10 Recharge",
      description: "Get ₹10 mobile recharge",
      credits: 100,
      icon: Phone,
      type: "Mobile Recharge",
      color: "green",
    },
    {
      id: "mobile50",
      title: "Mobile Recharge",
      subtitle: "₹50 Recharge",
      description: "Get ₹50 mobile recharge",
      credits: 500,
      icon: Phone,
      type: "Mobile Recharge",
      color: "green",
    },
    {
      id: "amazon50",
      title: "Amazon Gift Card",
      subtitle: "₹50 Voucher",
      description: "Redeem a ₹50 Amazon voucher",
      credits: 500,
      icon: ShoppingBag,
      type: "Amazon Gift Card",
      color: "orange",
    },
    {
      id: "flipkart50",
      title: "Flipkart Gift Card",
      subtitle: "₹50 Voucher",
      description: "Redeem a ₹50 Flipkart voucher",
      credits: 500,
      icon: Gift,
      type: "Flipkart Gift Card",
      color: "blue",
    },
    {
      id: "amazon100",
      title: "Amazon Gift Card",
      subtitle: "₹100 Voucher",
      description: "Redeem a ₹100 Amazon voucher",
      credits: 1000,
      icon: ShoppingBag,
      type: "Amazon Gift Card",
      color: "orange",
    },
    {
      id: "flipkart100",
      title: "Flipkart Gift Card",
      subtitle: "₹100 Voucher",
      description: "Redeem a ₹100 Flipkart voucher",
      credits: 1000,
      icon: Gift,
      type: "Flipkart Gift Card",
      color: "blue",
    },
  ]

  // --------------------------------------------------
  // MYSTERY REWARDS
  // --------------------------------------------------

  const mysteryRewards = [
    {
      name: "₹10 Mobile Recharge",
      value: "₹10",
      type: "Mobile Recharge",
    },
    {
      name: "Amazon Gift Voucher",
      value: "₹20",
      type: "Amazon Gift Card",
    },
    {
      name: "Flipkart Gift Voucher",
      value: "₹20",
      type: "Flipkart Gift Card",
    },
    {
      name: "₹50 Special Reward",
      value: "₹50",
      type: "Special Reward",
    },
  ]

  // --------------------------------------------------
  // SELECT REWARD
  // --------------------------------------------------

  const handleSelectReward = (reward) => {
    if (credits < reward.credits) {
      alert(
        `You need ${reward.credits - credits} more Eco-Credits.`
      )
      return
    }

    setSelectedReward(reward)
    setShowConfirm(true)
  }

  // --------------------------------------------------
  // MYSTERY BOX
  // --------------------------------------------------

  const handleMysteryReward = () => {
    const mysteryCost = 300

    if (credits < mysteryCost) {
      alert(
        `You need ${mysteryCost - credits} more Eco-Credits to unlock the Mystery Box.`
      )
      return
    }

    setSelectedReward({
      id: "mystery",
      title: "Mystery Eco Box",
      subtitle: "Unknown Reward",
      description: "Unlock a surprise eco-reward",
      credits: mysteryCost,
      icon: Gift,
      type: "Mystery Reward",
      color: "purple",
      mystery: true,
    })

    setShowConfirm(true)
  }

  // --------------------------------------------------
  // GENERATE DEMO CODE
  // --------------------------------------------------

  const generateCode = (type) => {
    const random = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()

    if (type === "Mobile Recharge") {
      return "RECHARGE-" + random
    }

    if (type === "Amazon Gift Card") {
      return "AMZ-" + random
    }

    if (type === "Flipkart Gift Card") {
      return "FLIP-" + random
    }

    return "ECO-" + random
  }

  // --------------------------------------------------
  // CONFIRM REDEMPTION
  // --------------------------------------------------

  const confirmRedemption = () => {
    if (!selectedReward) return

    if (credits < selectedReward.credits) {
      alert("You do not have enough Eco-Credits.")
      return
    }

    let finalReward = selectedReward

    // Mystery reward
    if (selectedReward.mystery) {
      const randomIndex = Math.floor(
        Math.random() * mysteryRewards.length
      )

      const mysteryResult =
        mysteryRewards[randomIndex]

      finalReward = {
        ...selectedReward,
        title: mysteryResult.name,
        subtitle: mysteryResult.value,
        type: mysteryResult.type,
        code: generateCode(mysteryResult.type),
      }
    } else {
      finalReward = {
        ...selectedReward,
        code: generateCode(selectedReward.type),
      }
    }

    // Deduct credits
    const newCredits =
      credits - selectedReward.credits

    localStorage.setItem(
      "ecoCredits",
      newCredits.toString()
    )

    setCredits(newCredits)

    // Save history
    const historyItem = {
      id: Date.now(),
      title: finalReward.title,
      subtitle: finalReward.subtitle,
      type: finalReward.type,
      credits: selectedReward.credits,
      code: finalReward.code,
      date: new Date().toLocaleString(),
    }

    const newHistory = [
      historyItem,
      ...history,
    ]

    localStorage.setItem(
      "redemptionHistory",
      JSON.stringify(newHistory)
    )

    setHistory(newHistory)

    setShowConfirm(false)
    setSelectedReward(null)
    setRedeemedReward(finalReward)
  }

  // --------------------------------------------------
  // CLOSE SUCCESS
  // --------------------------------------------------

  const closeSuccess = () => {
    setRedeemedReward(null)
  }

  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#14231a]">

      {/* HEADER */}
      <header className="border-b border-[#dfeae3] bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#176b45]"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176b45] text-white">
              <Sparkles size={18} />
            </div>

            <span className="font-bold text-[#176b45]">
              Eco Clean Hub
            </span>

          </div>

        </div>

      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* PAGE TITLE */}
        <div className="mb-7">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold">
                Redeem Rewards
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Turn your Eco-Credits into exciting rewards.
              </p>
            </div>

            {/* BALANCE */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#cfe4d6] bg-white px-5 py-3 shadow-sm">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                <WalletCards size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Available Balance
                </p>

                <p className="text-xl font-bold text-[#176b45]">
                  {credits.toLocaleString()}{" "}
                  <span className="text-xs font-medium text-slate-400">
                    credits
                  </span>
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* MYSTERY REWARD */}
        <section className="mb-8">

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#176b45] to-[#219653] p-6 text-white shadow-lg sm:p-8">

            <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-white/5" />

            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

              <div className="flex items-center gap-5">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
                  <Gift size={38} />
                </div>

                <div>

                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-100">
                      Special Reward
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold sm:text-3xl">
                    Mystery Eco Box
                  </h2>

                  <p className="mt-1 max-w-xl text-sm text-green-100">
                    Unlock a surprise reward. You never know
                    what you might get!
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleMysteryReward}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#176b45] shadow-md transition hover:-translate-y-0.5 hover:bg-green-50"
              >
                <Lock size={17} />
                Unlock for 300
              </button>

            </div>

          </div>

        </section>

        {/* REWARDS */}
        <section>

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Redeem Your Credits
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose a reward that you like.
              </p>
            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {rewards.map((reward) => {

              const Icon = reward.icon
              const canRedeem =
                credits >= reward.credits

              return (
                <div
                  key={reward.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                    canRedeem
                      ? "border-[#dfeae3] hover:-translate-y-1 hover:border-[#bcd8c7] hover:shadow-lg"
                      : "border-slate-200 opacity-60"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                      <Icon size={24} />
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#176b45]">
                      {reward.credits} pts
                    </span>

                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {reward.title}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-[#176b45]">
                    {reward.subtitle}
                  </p>

                  <p className="mt-2 min-h-[40px] text-sm text-slate-500">
                    {reward.description}
                  </p>

                  <button
                    type="button"
                    disabled={!canRedeem}
                    onClick={() =>
                      handleSelectReward(reward)
                    }
                    className="mt-5 w-full rounded-xl bg-[#176b45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#125a39] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {canRedeem
                      ? "Redeem Now"
                      : "Not Enough Credits"}
                  </button>

                </div>
              )
            })}

          </div>

        </section>

        {/* REDEMPTION HISTORY */}
        <section className="mt-10">

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
              <History size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Redemption History
              </h2>

              <p className="text-sm text-slate-500">
                Your recently redeemed rewards
              </p>
            </div>

          </div>

          {history.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">

              <Ticket
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-semibold text-slate-600">
                No rewards redeemed yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Your redeemed rewards will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {history.map((item) => (

                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-[#dfeae3] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                      <CheckCircle2 size={21} />
                    </div>

                    <div>

                      <p className="font-bold">
                        {item.title}
                      </p>

                      <p className="text-sm text-slate-500">
                        {item.subtitle}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.date}
                      </p>

                    </div>

                  </div>

                  <div className="text-left sm:text-right">

                    <p className="font-bold text-red-500">
                      -{item.credits} credits
                    </p>

                    <p className="mt-1 text-xs font-semibold text-green-600">
                      Redeemed ✓
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

      {/* ------------------------------------------------ */}
      {/* CONFIRMATION MODAL */}
      {/* ------------------------------------------------ */}

      {showConfirm && selectedReward && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                  <Gift size={24} />
                </div>

                <h2 className="mt-4 text-xl font-bold">
                  Confirm Redemption
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Please check the details before redeeming.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false)
                  setSelectedReward(null)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={17} />
              </button>

            </div>

            <div className="mt-6 rounded-2xl bg-[#f6faf7] p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-bold">
                    {selectedReward.title}
                  </p>

                  <p className="mt-1 text-sm text-[#176b45]">
                    {selectedReward.subtitle}
                  </p>
                </div>

                <p className="font-bold text-[#176b45]">
                  {selectedReward.credits} pts
                </p>

              </div>

            </div>

            <div className="mt-4 space-y-3">

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Current Balance
                </span>

                <span className="font-semibold">
                  {credits} credits
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Redemption Cost
                </span>

                <span className="font-semibold text-red-500">
                  -{selectedReward.credits} credits
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">

                <div className="flex justify-between">

                  <span className="font-semibold">
                    Remaining Balance
                  </span>

                  <span className="font-bold text-[#176b45]">
                    {credits - selectedReward.credits} credits
                  </span>

                </div>

              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false)
                  setSelectedReward(null)
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRedemption}
                className="rounded-xl bg-[#176b45] px-4 py-3 text-sm font-semibold text-white hover:bg-[#125a39]"
              >
                Confirm Redeem
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ------------------------------------------------ */}
      {/* SUCCESS MODAL */}
      {/* ------------------------------------------------ */}

      {redeemedReward && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#176b45]">
              <CheckCircle2 size={34} />
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Reward Redeemed!
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Congratulations! Your reward has been unlocked.
            </p>

            <div className="mt-6 rounded-2xl bg-[#edf8f1] p-5">

              <p className="text-sm text-slate-500">
                {redeemedReward.type}
              </p>

              <p className="mt-1 text-xl font-bold text-[#176b45]">
                {redeemedReward.subtitle}
              </p>

              <div className="mt-4 rounded-xl border border-green-200 bg-white p-3">

                <p className="text-xs text-slate-400">
                  Your Reward Code
                </p>

                <p className="mt-1 break-all font-mono text-sm font-bold text-slate-700">
                  {redeemedReward.code}
                </p>

              </div>

              <p className="mt-3 text-[11px] text-slate-400">
                Demo reward code for project prototype
              </p>

            </div>

            <button
              type="button"
              onClick={closeSuccess}
              className="mt-6 w-full rounded-xl bg-[#176b45] px-5 py-3 font-semibold text-white hover:bg-[#125a39]"
            >
              Done
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

export default RedeemRewards