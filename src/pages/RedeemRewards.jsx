import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Gift,
  History,
  Lock,
  MapPin,
  Phone,
  Sparkles,
  Ticket,
  Trash2,
  Smartphone,
  WalletCards,
  X,
} from "lucide-react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function RedeemRewards() {
  const navigate = useNavigate()

  const [credits, setCredits] = useState(0)
  const [history, setHistory] = useState([])
  const [addresses, setAddresses] = useState([])

  const [selectedReward, setSelectedReward] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [order, setOrder] = useState(null)

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  })

  const [paymentDetails, setPaymentDetails] = useState({
    upi: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
    bank: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [savingAddress, setSavingAddress] = useState(false)
  const [insufficientReward, setInsufficientReward] = useState(null)

  // --------------------------------------------------
  // LOAD + SYNC LOCAL STORAGE DATA
  // --------------------------------------------------

  useEffect(() => {
    loadRewardsData()

    window.addEventListener("focus", loadRewardsData)
    window.addEventListener("storage", loadRewardsData)

    return () => {
      window.removeEventListener("focus", loadRewardsData)
      window.removeEventListener("storage", loadRewardsData)
    }
  }, [])

  const loadRewardsData = () => {
    const savedCredits = localStorage.getItem("ecoCredits")
    const savedHistory =
      localStorage.getItem("purchaseHistory") ||
      localStorage.getItem("redemptionHistory")
    const savedAddresses = localStorage.getItem("deliveryAddresses")

    setCredits(
      savedCredits !== null && !Number.isNaN(Number(savedCredits))
        ? Number(savedCredits)
        : 0
    )

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch {
        setHistory([])
      }
    } else {
      setHistory([])
    }

    if (savedAddresses) {
      try {
        const parsed = JSON.parse(savedAddresses)
        setAddresses(Array.isArray(parsed) ? parsed : [])
      } catch {
        setAddresses([])
      }
    } else {
      setAddresses([])
    }
  }

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

  const mysteryBoxes = [
    { id: "pro", name: "Pro Mystery Box", marketValue: 1299, credits: 650, cash: 649, image: "/mystery-boxes/pro.png", badge: "BEST VALUE", description: "A premium surprise box packed with useful lifestyle rewards." },
    { id: "prank", name: "Prank Mystery Box", marketValue: 799, credits: 400, cash: 399, image: "/mystery-boxes/prank.png", badge: "FUN PICK", description: "A playful mystery box with unexpected gadgets and fun rewards." },
    { id: "elite", name: "Elite Mystery Box", marketValue: 2499, credits: 1250, cash: 1249, image: "/mystery-boxes/elite.png", badge: "ELITE", description: "Our highest-value mystery box with a premium surprise inside." },
    { id: "tech", name: "Tech Mystery Box", marketValue: 1299, credits: 650, cash: 649, image: "/mystery-boxes/tech.png", badge: "TECH", description: "Tech-focused surprises for creators, gadgets lovers and explorers." },
    { id: "gaming", name: "Gaming Mystery Box", marketValue: 1499, credits: 750, cash: 749, image: "/mystery-boxes/gaming.png", badge: "GAMING", description: "Gaming-inspired surprises with accessories and entertainment picks." },
    { id: "core", name: "Core Mystery Box", marketValue: 349, credits: 175, cash: 174, image: "/mystery-boxes/core.png", badge: "STARTER", description: "A smaller mystery box for trying the Eco Rewards experience." },
  ]

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const generateCode = (type) => {
    const random = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()

    if (type === "Mobile Recharge") {
      return `RECHARGE-${random}`
    }

    if (type === "Amazon Gift Card") {
      return `AMZ-${random}`
    }

    if (type === "Flipkart Gift Card") {
      return `FLIP-${random}`
    }

    return `ECO-${random}`
  }

  const generateTrackingCode = () => {
    const random = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()

    return `ECH-TRK-${random}`
  }

  const formatCash = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`

  const getRequiredCredits = (reward) =>
    reward?.redemption?.credits || reward?.credits || 0

  const getCashPrice = (reward) =>
    reward?.redemption?.cash || reward?.cashPrice || 0

  const isHybrid = (reward) =>
    reward?.redemption?.mode === "hybrid" || getCashPrice(reward) > 0

  const canRedeem = (reward) => credits >= getRequiredCredits(reward)

  // --------------------------------------------------
  // ADDRESS
  // --------------------------------------------------

  const addressIsValid =
    addressForm.name.trim().length >= 2 &&
    /^\d{10}$/.test(addressForm.phone.trim()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email.trim()) &&
    addressForm.street.trim().length >= 5 &&
    addressForm.city.trim().length >= 2 &&
    addressForm.state.trim().length >= 2 &&
    /^\d{6}$/.test(addressForm.pincode.trim())

  const paymentIsValid =
    !isHybrid(selectedReward) ||
    (paymentMethod === "upi"
      ? paymentDetails.upi.trim().length >= 5
      : paymentMethod === "card"
        ? paymentDetails.cardNumber.replace(/\D/g, "").length === 16 &&
          /^\d{2}\/\d{2}$/.test(paymentDetails.expiry) &&
          /^\d{3,4}$/.test(paymentDetails.cvv) &&
          paymentDetails.cardName.trim().length >= 2
        : paymentMethod === "netbanking"
          ? paymentDetails.bank.trim().length >= 2
          : false)

  const updateAddressField = (field, value) => {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const saveAddress = () => {
    if (!addressIsValid) {
      alert("Please enter valid delivery details.")
      return
    }

    setSavingAddress(true)

    const newAddress = {
      id: Date.now(),
      ...addressForm,
      savedAt: new Date().toISOString(),
    }

    const nextAddresses = [newAddress, ...addresses]

    localStorage.setItem(
      "deliveryAddresses",
      JSON.stringify(nextAddresses)
    )

    setAddresses(nextAddresses)
    setSavingAddress(false)
    setCheckoutStep(2)
  }

  const useSavedAddress = (address) => {
    setAddressForm({
      name: address.name || "",
      phone: address.phone || "",
      email: address.email || "",
      street: address.street || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    })
  }

  const deleteSavedAddress = (id) => {
    const nextAddresses = addresses.filter(
      (address) => address.id !== id
    )

    setAddresses(nextAddresses)
    localStorage.setItem(
      "deliveryAddresses",
      JSON.stringify(nextAddresses)
    )
  }

  // --------------------------------------------------
  // START CHECKOUT
  // --------------------------------------------------

  const startCheckout = (reward) => {
    const requiredCredits = getRequiredCredits(reward)

    if (credits < requiredCredits) {
      alert(
        `You need ${(
          requiredCredits - credits
        ).toLocaleString()} more Eco-Credits.`
      )
      return
    }

    setSelectedReward(reward)
    setCheckoutStep(1)
    setPaymentMethod(isHybrid(reward) ? "upi" : "eco")
    setCheckoutOpen(true)
  }

  const closeCheckout = () => {
    setCheckoutOpen(false)
    setCheckoutStep(1)
    setSelectedReward(null)
    setPaymentMethod("upi")
  }

  // --------------------------------------------------
  // MYSTERY BOX
  // --------------------------------------------------

  const handleMysteryReward = () => {
    const mysteryCost = 300

    if (credits < mysteryCost) {
      alert(
        `You need ${(
          mysteryCost - credits
        ).toLocaleString()} more Eco-Credits to unlock the Mystery Box.`
      )
      return
    }

    startCheckout({
      id: "mystery",
      title: "Mystery Eco Box",
      subtitle: "Surprise Reward",
      description: "Unlock a surprise eco-reward.",
      redemption: {
        mode: "credits",
        credits: mysteryCost,
        cash: 0,
      },
      icon: Gift,
      type: "Mystery Reward",
      tag: "Mystery",
      mystery: true,
    })
  }

  const handleMysteryBoxPurchase = (box) => {
    if (credits < box.credits) {
      setInsufficientReward({
        title: box.name,
        requiredCredits: box.credits,
      })
      return
    }

    startCheckout({
      id: `mystery-${box.id}`,
      title: box.name,
      subtitle: `₹${box.marketValue.toLocaleString("en-IN")} Mystery Box`,
      description: box.description,
      redemption: { mode: "hybrid", credits: box.credits, cash: box.cash },
      icon: Gift,
      type: "Mystery Box",
      tag: box.badge,
      mysteryBox: true,
      image: box.image,
    })
  }

  // --------------------------------------------------
  // COMPLETE ORDER
  // --------------------------------------------------

  const completeOrder = () => {
    if (!selectedReward) return

    const requiredCredits = getRequiredCredits(selectedReward)
    const cashPrice = getCashPrice(selectedReward)

    if (credits < requiredCredits) {
      alert("Your Eco-Credit balance has changed. Please try again.")
      closeCheckout()
      loadRewardsData()
      return
    }

    if (!paymentIsValid) {
      alert(
        paymentMethod === "upi"
          ? "Please enter a valid UPI ID."
          : paymentMethod === "card"
            ? "Please complete the card details."
            : "Please select your bank."
      )
      return
    }

    if (selectedReward.mystery) {
      const randomIndex = Math.floor(
        Math.random() * mysteryRewards.length
      )

      const mysteryResult = mysteryRewards[randomIndex]

      const finalReward = {
        ...selectedReward,
        title: mysteryResult.name,
        subtitle: mysteryResult.value,
        type: mysteryResult.type,
      }

      finishOrder(finalReward, requiredCredits, cashPrice)
      return
    }

    finishOrder(selectedReward, requiredCredits, cashPrice)
  }

  const finishOrder = (
    reward,
    requiredCredits,
    cashPrice
  ) => {
    const newCredits = credits - requiredCredits

    const rewardCode = generateCode(reward.type)
    const trackingCode = generateTrackingCode()
    const now = new Date()

    const orderData = {
      id: Date.now(),
      orderId: `ECH-${now.getTime().toString().slice(-8)}`,
      title: reward.title,
      subtitle: reward.subtitle,
      type: reward.type,
      credits: requiredCredits,
      cash: cashPrice,
      paymentMethod:
        cashPrice > 0 ? paymentMethod : "Eco-Credits",
      code: rewardCode,
      trackingCode,
      address: {
        ...addressForm,
      },
      paymentDetails:
        cashPrice > 0
          ? {
              method: paymentMethod,
              masked:
                paymentMethod === "upi"
                  ? paymentDetails.upi
                  : paymentMethod === "card"
                    ? `•••• •••• •••• ${paymentDetails.cardNumber
                        .replace(/\D/g, "")
                        .slice(-4)}`
                    : paymentDetails.bank,
            }
          : null,
      date: now.toLocaleString(),
      createdAt: now.toISOString(),
      status: "Confirmed",
      mode: cashPrice > 0 ? "hybrid" : "credits",
    }

    const nextHistory = [orderData, ...history]

    localStorage.setItem(
      "ecoCredits",
      newCredits.toString()
    )

    // Keep the old key working and also persist the new purchase key.
    localStorage.setItem(
      "redemptionHistory",
      JSON.stringify(nextHistory)
    )

    localStorage.setItem(
      "purchaseHistory",
      JSON.stringify(nextHistory)
    )

    setCredits(newCredits)
    setHistory(nextHistory)
    setCheckoutOpen(false)
    setSelectedReward(null)
    setCheckoutStep(4)
    setOrder(orderData)
  }

  // --------------------------------------------------
  // ORDER SUCCESS
  // --------------------------------------------------

  const closeSuccess = () => {
    setOrder(null)
    setCheckoutStep(1)
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f4faf6] text-[#14231a]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[#dbece2]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#edf8f1] hover:text-[#176b45]"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#176b45] to-[#219653] text-white shadow-md">
              <Sparkles size={18} />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-extrabold text-[#176b45]">
                Eco Clean Hub
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Rewards Store
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* TITLE + BALANCE */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#cfe7d8] bg-white px-3 py-1.5 text-xs font-bold text-[#176b45] shadow-sm">
                <Sparkles size={14} />
                Eco Rewards Marketplace
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Redeem Rewards
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Turn your Eco-Credits into useful rewards, digital
                vouchers, and flexible high-tier purchases.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[#cfe4d6] bg-white px-5 py-4 shadow-[0_12px_35px_rgba(23,107,69,0.08)]">
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#edf8f1]" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#eaf8f0] to-[#d9f1e3] text-[#176b45]">
                  <WalletCards size={21} />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Available Balance
                  </p>

                  <p className="mt-0.5 text-2xl font-black text-[#176b45]">
                    {credits.toLocaleString("en-IN")}
                    <span className="ml-1 text-xs font-semibold text-slate-400">
                      Eco-Credits
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MYSTERY BANNER */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-[28px] border border-[#328c61]/30 bg-gradient-to-br from-[#105c3b] via-[#176b45] to-[#259a5d] p-6 text-white shadow-[0_22px_55px_rgba(23,107,69,0.22)] sm:p-8 lg:p-9">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/10" />
            <div className="absolute -bottom-28 right-24 h-56 w-56 rounded-full bg-white/5" />
            <div className="absolute right-8 top-8 hidden h-24 w-24 rotate-12 rounded-3xl border border-white/10 bg-white/5 lg:block" />

            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
              <div className="flex items-start gap-4 sm:items-center sm:gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner sm:h-20 sm:w-20">
                  <Gift size={36} />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2 text-green-100">
                    <Sparkles size={15} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                      Special Reward
                    </span>
                  </div>

                  <h2 className="text-2xl font-black sm:text-3xl">
                    Mystery Eco Box
                  </h2>

                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-green-50/90">
                    Unlock a surprise reward for 300 Eco-Credits.
                    Every box can contain a different eco-friendly
                    digital reward.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMysteryReward}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#176b45] shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50 active:translate-y-0"
              >
                <Lock size={17} />
                Unlock for 300
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* MYSTERY BOX MARKETPLACE */}
        <section className="mb-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#ead7a7] bg-[#fffaf0] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#a36a13]">
                <Gift size={13} /> Featured Collection
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Featured Mystery Boxes</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Split the purchase between Eco-Credits and cash. Every box keeps the original value while making checkout more flexible.
              </p>
            </div>
            <div className="rounded-full border border-[#dcebe2] bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
              50% Credits + 50% Cash
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mysteryBoxes.map((box) => {
              const available = credits >= box.credits
              return (
                <article key={box.id} className={`group overflow-hidden rounded-[26px] border bg-white shadow-[0_10px_35px_rgba(20,35,26,0.08)] transition duration-300 ${available ? "border-[#ead7a7] hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(23,107,69,0.15)]" : "border-slate-200 opacity-70"}`}>
                  <div className="relative overflow-hidden bg-[#fffdf8]">
                    <img src={box.image} alt={box.name} className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-72" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#a36a13] shadow-sm">{box.badge}</div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black">{box.name}</h3>
                        <p className="mt-1 text-sm font-bold text-[#176b45]">Market Value ₹{box.marketValue.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="rounded-xl bg-[#f4faf6] px-2.5 py-2 text-right">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">50 / 50</p>
                        <p className="text-xs font-black text-[#176b45]">Split Pay</p>
                      </div>
                    </div>

                    <p className="mt-3 min-h-[42px] text-sm leading-6 text-slate-500">{box.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-[#dcebe2] bg-[#f8fcf9] p-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Eco-Credits</p>
                        <p className="mt-1 text-sm font-black text-[#176b45]">{box.credits.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="rounded-xl border border-[#ead7a7] bg-[#fffaf0] p-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Cash</p>
                        <p className="mt-1 text-sm font-black text-[#a36a13]">₹{box.cash.toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => handleMysteryBoxPurchase(box)} className="flex-1 rounded-xl bg-gradient-to-r from-[#176b45] to-[#219653] px-4 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:from-[#125a39] hover:to-[#176b45] active:translate-y-0">
                        Buy Now
                      </button>
                      <button type="button" onClick={() => window.alert(`${box.name}\n\nMarket Value: ₹${box.marketValue.toLocaleString("en-IN")}\nEco-Credits: ${box.credits.toLocaleString("en-IN")}\nCash: ₹${box.cash.toLocaleString("en-IN")}\n\nThis is a 50/50 Credits + Cash purchase.`)} className="rounded-xl border border-[#dcebe2] bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#176b45] hover:text-[#176b45]">Details</button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* HISTORY */}
        <section className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf8f0] text-[#176b45]">
              <History size={21} />
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight">
                Purchase & Redemption History
              </h2>

              <p className="text-sm text-slate-500">
                Your recent rewards, payment details, and order codes.
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#cbded2] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f8f4] text-[#b7cec0]">
                <Ticket size={28} />
              </div>

              <p className="mt-4 font-bold text-slate-600">
                No rewards redeemed yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Your orders and digital vouchers will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-[#dcebe2] bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                        <CheckCircle2 size={21} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black">
                            {item.title}
                          </p>

                          <span className="rounded-full bg-[#edf8f1] px-2.5 py-1 text-[10px] font-bold text-[#176b45]">
                            {item.status || "Redeemed"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.subtitle}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span>
                            {item.date}
                          </span>
                          {item.orderId && (
                            <span>
                              Order: {item.orderId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-[#f7fbf8] px-4 py-3 lg:min-w-[250px]">
                      <div className="flex items-center justify-between gap-5">
                        <span className="text-xs text-slate-500">
                          Credits
                        </span>
                        <span className="font-bold text-red-500">
                          -{Number(item.credits || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {Number(item.cash || 0) > 0 && (
                        <div className="mt-1 flex items-center justify-between gap-5">
                          <span className="text-xs text-slate-500">
                            Cash
                          </span>
                          <span className="font-bold text-[#176b45]">
                            {formatCash(item.cash)}
                          </span>
                        </div>
                      )}

                      {item.paymentMethod && (
                        <div className="mt-1 flex items-center justify-between gap-5">
                          <span className="text-xs text-slate-500">
                            Payment
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {item.paymentMethod}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* NOT ENOUGH CREDITS MODAL */}
      {insufficientReward && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/30 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
            <div className="bg-gradient-to-br from-[#105c3b] via-[#176b45] to-[#259a5d] px-6 py-7 text-center text-white">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-8 ring-white/5">
                <AlertCircle size={34} />
              </div>
              <h2 className="mt-4 text-2xl font-black">Not Enough Eco-Credits</h2>
              <p className="mt-2 text-sm leading-6 text-green-50/90">
                You don't have enough Eco-Credits to buy this reward yet.
              </p>
            </div>

            <div className="p-6 sm:p-7">
              <div className="rounded-2xl border border-[#dcebe2] bg-[#f8fcf9] p-4">
                <p className="text-sm font-black text-slate-700">
                  {insufficientReward.title}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#dcebe2] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Your Credits</p>
                    <p className="mt-1 text-lg font-black text-[#176b45]">{credits.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-xl border border-[#ead7a7] bg-[#fffaf0] p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Required</p>
                    <p className="mt-1 text-lg font-black text-[#a36a13]">{insufficientReward.requiredCredits.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <p className="mt-3 text-center text-sm font-bold text-slate-500">
                  You need <span className="text-[#176b45]">{(insufficientReward.requiredCredits - credits).toLocaleString("en-IN")} more Eco-Credits</span> to unlock this purchase.
                </p>
              </div>

              <p className="mt-5 text-center text-sm leading-6 text-slate-500">
                Complete more cleanup missions, take meaningful action, and make a bigger impact to earn more Eco-Credits. 🌱
              </p>

              <button
                type="button"
                onClick={() => setInsufficientReward(null)}
                className="mt-6 w-full rounded-xl bg-[#176b45] px-5 py-3.5 text-sm font-black text-white shadow-md transition hover:bg-[#125a39]"
              >
                Got It — Keep Earning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && selectedReward && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/30 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            {/* CHECKOUT HEADER */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-[#f7fcf9] to-white px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#176b45]">
                    Eco Clean Hub Checkout
                  </p>

                  <h2 className="mt-1 text-xl font-black sm:text-2xl">
                    {isHybrid(selectedReward)
                      ? "Buy Now"
                      : "Redeem Reward"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeCheckout}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* STEPS */}
              <div className="mt-6 flex items-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className="flex flex-1 items-center gap-2"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        checkoutStep >= step
                          ? "bg-[#176b45] text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {checkoutStep > step ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        step
                      )}
                    </div>

                    <span
                      className={`hidden text-xs font-bold sm:block ${
                        checkoutStep >= step
                          ? "text-[#176b45]"
                          : "text-slate-400"
                      }`}
                    >
                      {step === 1
                        ? "Address"
                        : step === 2
                          ? "Payment"
                          : step === 3
                            ? "Confirm"
                            : "Success"}
                    </span>

                    {step < 4 && (
                      <div
                        className={`h-px flex-1 ${
                          checkoutStep > step
                            ? "bg-[#176b45]"
                            : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1 */}
            {checkoutStep === 1 && (
              <div className="p-5 sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h3 className="font-black">
                      Delivery / Contact Address
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter the details required for this order.
                    </p>
                  </div>
                </div>

                {addresses.length > 0 && (
                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Saved addresses
                      </p>

                      <span className="text-[10px] font-semibold text-slate-400">
                        Stored locally
                      </span>
                    </div>

                    <div className="space-y-2">
                      {addresses.slice(0, 3).map((address) => (
                        <div
                          key={address.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#dcebe2] bg-[#f9fcfa] p-3"
                        >
                          <button
                            type="button"
                            onClick={() => useSavedAddress(address)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="truncate text-sm font-bold text-slate-700">
                              {address.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {address.street}, {address.city}, {address.state} -{" "}
                              {address.pincode}
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteSavedAddress(address.id)
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            aria-label="Delete saved address"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Full Name
                    </span>
                    <input
                      value={addressForm.name}
                      onChange={(event) =>
                        updateAddressField(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                    />
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Phone
                    </span>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3 top-3.5 text-slate-400"
                      />
                      <input
                        value={addressForm.phone}
                        onChange={(event) =>
                          updateAddressField(
                            "phone",
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10)
                          )
                        }
                        placeholder="10-digit number"
                        inputMode="numeric"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm outline-none transition focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                      />
                    </div>
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Email Address
                    </span>
                    <input
                      type="email"
                      value={addressForm.email}
                      onChange={(event) =>
                        updateAddressField("email", event.target.value)
                      }
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                    />
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Pincode
                    </span>
                    <input
                      value={addressForm.pincode}
                      onChange={(event) =>
                        updateAddressField(
                          "pincode",
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      placeholder="6-digit pincode"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Street Address
                    </span>
                    <input
                      value={addressForm.street}
                      onChange={(event) =>
                        updateAddressField(
                          "street",
                          event.target.value
                        )
                      }
                      placeholder="House / flat, street, locality"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                    />
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      Landmark
                    </span>
                    <input
                      value={addressForm.landmark}
                      onChange={(event) =>
                        updateAddressField("landmark", event.target.value)
                      }
                      placeholder="Near landmark (optional)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                    />
                  </label>

                  <label>
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      City
                    </span>
                    <input
                      value={addressForm.city}
                      onChange={(event) =>
                        updateAddressField(
                          "city",
                          event.target.value
                        )
                      }
                      placeholder="City"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                    />
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={saveAddress}
                    disabled={!addressIsValid || savingAddress}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#125a39] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {savingAddress ? "Saving..." : "Continue to Payment"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {checkoutStep === 2 && (
              <div className="p-5 sm:p-7">
                <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                        <CreditCard size={20} />
                      </div>

                      <div>
                        <h3 className="font-black">
                          Payment Gateway
                        </h3>
                        <p className="text-xs text-slate-500">
                          Demo payment selection — no real charge is made.
                        </p>
                      </div>
                    </div>

                    {isHybrid(selectedReward) ? (
                      <>
                      <div className="space-y-2.5">
                        {[
                          {
                            id: "upi",
                            label: "UPI",
                            description: "Google Pay, PhonePe, Paytm etc.",
                            icon: Smartphone,
                          },
                          {
                            id: "card",
                            label: "Credit / Debit Card",
                            description: "Visa, Mastercard, RuPay etc.",
                            icon: CreditCard,
                          },
                          {
                            id: "netbanking",
                            label: "Net Banking",
                            description: "Select your bank and continue.",
                            icon: WalletCards,
                          },
                        ].map((method) => {
                          const MethodIcon = method.icon
                          const active =
                            paymentMethod === method.id

                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() =>
                                setPaymentMethod(method.id)
                              }
                              className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                                active
                                  ? "border-[#176b45] bg-[#f2faf5] shadow-sm"
                                  : "border-slate-200 bg-white hover:border-[#b9d9c7]"
                              }`}
                            >
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  active
                                    ? "bg-[#176b45] text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <MethodIcon size={18} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold">
                                  {method.label}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {method.description}
                                </p>
                              </div>

                              <div
                                className={`h-4 w-4 rounded-full border-2 ${
                                  active
                                    ? "border-[#176b45] bg-[#176b45] shadow-[inset_0_0_0_3px_white]"
                                    : "border-slate-300"
                                }`}
                              />
                            </button>
                          )
                        })}
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        {paymentMethod === "upi" && (
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-bold text-slate-600">
                              UPI ID
                            </span>
                            <input
                              value={paymentDetails.upi}
                              onChange={(event) =>
                                setPaymentDetails((current) => ({
                                  ...current,
                                  upi: event.target.value,
                                }))
                              }
                              placeholder="example@upi"
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                            />
                          </label>
                        )}

                        {paymentMethod === "card" && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                              <span className="mb-1.5 block text-xs font-bold text-slate-600">
                                Cardholder Name
                              </span>
                              <input
                                value={paymentDetails.cardName}
                                onChange={(event) =>
                                  setPaymentDetails((current) => ({
                                    ...current,
                                    cardName: event.target.value,
                                  }))
                                }
                                placeholder="Name on card"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                              />
                            </label>
                            <label className="sm:col-span-2">
                              <span className="mb-1.5 block text-xs font-bold text-slate-600">
                                Card Number
                              </span>
                              <input
                                inputMode="numeric"
                                value={paymentDetails.cardNumber}
                                onChange={(event) =>
                                  setPaymentDetails((current) => ({
                                    ...current,
                                    cardNumber: event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 16),
                                  }))
                                }
                                placeholder="1234 5678 9012 3456"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                              />
                            </label>
                            <label>
                              <span className="mb-1.5 block text-xs font-bold text-slate-600">
                                Expiry
                              </span>
                              <input
                                inputMode="numeric"
                                value={paymentDetails.expiry}
                                onChange={(event) =>
                                  setPaymentDetails((current) => ({
                                    ...current,
                                    expiry: event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 4)
                                      .replace(/(\d{2})(\d)/, "$1/$2"),
                                  }))
                                }
                                placeholder="MM/YY"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                              />
                            </label>
                            <label>
                              <span className="mb-1.5 block text-xs font-bold text-slate-600">
                                CVV
                              </span>
                              <input
                                type="password"
                                inputMode="numeric"
                                value={paymentDetails.cvv}
                                onChange={(event) =>
                                  setPaymentDetails((current) => ({
                                    ...current,
                                    cvv: event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 4),
                                  }))
                                }
                                placeholder="•••"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                              />
                            </label>
                          </div>
                        )}

                        {paymentMethod === "netbanking" && (
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-bold text-slate-600">
                              Select Bank
                            </span>
                            <select
                              value={paymentDetails.bank}
                              onChange={(event) =>
                                setPaymentDetails((current) => ({
                                  ...current,
                                  bank: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#176b45] focus:ring-4 focus:ring-[#176b45]/10"
                            >
                              <option value="">Choose your bank</option>
                              <option>State Bank of India</option>
                              <option>HDFC Bank</option>
                              <option>ICICI Bank</option>
                              <option>Axis Bank</option>
                              <option>Kotak Mahindra Bank</option>
                            </select>
                          </label>
                        )}
                      </div>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-[#cfe4d6] bg-[#f5fbf7] p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#176b45] text-white">
                            <WalletCards size={20} />
                          </div>

                          <div>
                            <p className="font-black text-[#176b45]">
                              Eco-Credits Only
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              No cash payment is required for this reward.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ORDER SUMMARY */}
                  <div className="rounded-2xl border border-[#dcebe2] bg-[#f8fcf9] p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Order Summary
                    </p>

                    <div className="mt-4 flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#176b45] shadow-sm">
                        <Gift size={19} />
                      </div>

                      <div>
                        <p className="font-black">
                          {selectedReward.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedReward.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2.5 border-t border-[#dcebe2] pt-4 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">
                          Eco-Credits
                        </span>
                        <span className="font-bold">
                          -{getRequiredCredits(selectedReward).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">
                          Cash Payment
                        </span>
                        <span className="font-bold text-[#176b45]">
                          {formatCash(getCashPrice(selectedReward))}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3 border-t border-[#dcebe2] pt-3">
                        <span className="font-bold">
                          Total
                        </span>
                        <span className="font-black text-[#176b45]">
                          {isHybrid(selectedReward)
                            ? `${getRequiredCredits(
                                selectedReward
                              ).toLocaleString("en-IN")} Credits + ${formatCash(
                                getCashPrice(selectedReward)
                              )}`
                            : `${getRequiredCredits(
                                selectedReward
                              ).toLocaleString("en-IN")} Credits`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-white p-3">
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-[#176b45]"
                        />
                        <p className="text-xs leading-5 text-slate-500">
                          {addressForm.name}, {addressForm.street},{" "}
                          {addressForm.city} - {addressForm.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!paymentIsValid) {
                        alert(
                          paymentMethod === "upi"
                            ? "Please enter a valid UPI ID."
                            : paymentMethod === "card"
                              ? "Please complete the card details."
                              : "Please select your bank."
                        )
                        return
                      }

                      setCheckoutStep(3)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#125a39]"
                  >
                    Continue to Review
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — CONFIRM */}
            {checkoutStep === 3 && (
              <div className="p-5 sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                    <CheckCircle2 size={20} />
                  </div>

                  <div>
                    <h3 className="font-black">
                      Review & Confirm Order
                    </h3>
                    <p className="text-xs text-slate-500">
                      Please check your details before placing the order.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-[#dcebe2] bg-[#f8fcf9] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Deliver To
                        </p>
                        <p className="mt-1 font-black text-slate-800">
                          {addressForm.name}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {addressForm.street}
                          {addressForm.landmark
                            ? `, ${addressForm.landmark}`
                            : ""}
                          <br />
                          {addressForm.city}, {addressForm.state} -{" "}
                          {addressForm.pincode}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {addressForm.phone} · {addressForm.email}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCheckoutStep(1)}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#176b45] hover:bg-[#edf8f1]"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#dcebe2] bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Payment
                        </p>
                        <p className="mt-1 font-black text-slate-800">
                          {isHybrid(selectedReward)
                            ? paymentMethod === "upi"
                              ? "UPI"
                              : paymentMethod === "card"
                                ? "Credit / Debit Card"
                                : "Net Banking"
                            : "Eco-Credits"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {isHybrid(selectedReward)
                            ? paymentMethod === "upi"
                              ? paymentDetails.upi
                              : paymentMethod === "card"
                                ? `•••• ${paymentDetails.cardNumber
                                    .replace(/\D/g, "")
                                    .slice(-4)}`
                                : paymentDetails.bank
                            : "No cash payment required"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCheckoutStep(2)}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#176b45] hover:bg-[#edf8f1]"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#cfe4d6] bg-[#f5fbf7] p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Order Total
                    </p>

                    <div className="mt-3 space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Eco-Credits</span>
                        <span className="font-bold">
                          {getRequiredCredits(selectedReward).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Cash Payment</span>
                        <span className="font-bold text-[#176b45]">
                          {formatCash(getCashPrice(selectedReward))}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-[#dcebe2] pt-3">
                        <span className="font-black">You Pay</span>
                        <span className="font-black text-[#176b45]">
                          {isHybrid(selectedReward)
                            ? `${getRequiredCredits(
                                selectedReward
                              ).toLocaleString("en-IN")} Credits + ${formatCash(
                                getCashPrice(selectedReward)
                              )}`
                            : `${getRequiredCredits(
                                selectedReward
                              ).toLocaleString("en-IN")} Credits`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                  Please verify your address, payment method, and order total.
                  Once you click <strong>Place Order</strong>, the Eco-Credits
                  will be deducted and your order confirmation will be generated.
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(2)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={16} />
                    Back to Payment
                  </button>

                  <button
                    type="button"
                    onClick={completeOrder}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#125a39]"
                  >
                    <Lock size={16} />
                    {isHybrid(selectedReward)
                      ? "Pay & Place Order"
                      : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {order && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm sm:py-10">
          <div className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/30 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
            <div className="bg-gradient-to-br from-[#105c3b] via-[#176b45] to-[#259a5d] px-6 py-8 text-center text-white sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-8 ring-white/5">
                <CheckCircle2 size={34} />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-green-100">
                Order Confirmed
              </p>

              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                Reward Successfully Redeemed!
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-green-50/90">
                Your demo order has been created and your Eco-Credits
                have been deducted.
              </p>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#dcebe2] bg-[#f8fcf9] p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Reward
                  </p>
                  <p className="mt-1 font-black">
                    {order.title}
                  </p>
                  <p className="mt-1 text-sm text-[#176b45]">
                    {order.subtitle}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dcebe2] bg-[#f8fcf9] p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Order
                  </p>
                  <p className="mt-1 font-mono text-sm font-black">
                    {order.orderId}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.date}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#dcebe2] bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin size={17} className="text-[#176b45]" />
                  <p className="font-black">
                    Delivery / Contact Address
                  </p>
                </div>

                <p className="text-sm leading-6 text-slate-600">
                  {order.address.name},{" "}
                  {order.address.phone}
                  <br />
                  {order.address.street}, {order.address.city} -{" "}
                  {order.address.pincode}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-[#dcebe2] bg-[#f8fcf9] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Payment Breakdown
                </p>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Eco-Credits deducted
                    </span>
                    <span className="font-bold">
                      -{Number(order.credits).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Cash paid
                    </span>
                    <span className="font-bold text-[#176b45]">
                      {formatCash(order.cash)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#dcebe2] pt-2">
                    <span className="text-slate-500">
                      Payment method
                    </span>
                    <span className="font-bold">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-green-700/70">
                    Digital Voucher / Reward Code
                  </p>
                  <p className="mt-2 break-all font-mono text-sm font-black text-[#176b45]">
                    {order.code}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-700/70">
                    Tracking Code
                  </p>
                  <p className="mt-2 break-all font-mono text-sm font-black text-blue-700">
                    {order.trackingCode}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    closeSuccess()
                    loadRewardsData()
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Continue Shopping
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeSuccess()
                    loadRewardsData()
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "smooth",
                    })
                  }}
                  className="flex-1 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#125a39]"
                >
                  View Order History
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] text-slate-400">
                Payment gateway and voucher generation are simulated
                for this project prototype.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RedeemRewards
