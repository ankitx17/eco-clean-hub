import { useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Droplets,
  Download,
  FileText,
  Gift,
  Heart,
  Leaf,
  Lock,
  MapPin,
  Printer,
  ShieldCheck,
  Sparkles,
  TreePine,
  User,
  Users,
  WalletCards,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const DONATION_STORAGE_KEY = "eco_clean_hub_donations"

const campaigns = [
  {
    id: "trees",
    title: "Tree Plantation",
    description:
      "Restore green cover by supporting native tree plantation and long-term community care.",
    raised: 78500,
    target: 100000,
    icon: TreePine,
    location: "Community green zones",
    impact: "Every ₹500 supports a tree-care contribution.",
  },
  {
    id: "cleanup",
    title: "Urban Cleanup",
    description:
      "Fund neighborhood cleanup drives, waste collection equipment and volunteer action.",
    raised: 54200,
    target: 75000,
    icon: Sparkles,
    location: "Urban communities",
    impact: "Your support strengthens local cleanup drives.",
  },
  {
    id: "river",
    title: "River Restoration",
    description:
      "Help remove waste from vulnerable waterways and support restoration awareness programs.",
    raised: 91500,
    target: 150000,
    icon: Droplets,
    location: "River-side communities",
    impact: "Your contribution helps protect shared water ecosystems.",
  },
]

const paymentMethods = [
  {
    id: "upi",
    label: "UPI",
    description: "Google Pay, PhonePe, Paytm & more",
    icon: WalletCards,
  },
  {
    id: "card",
    label: "Card",
    description: "Credit or debit card",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "Secure bank transfer",
    icon: ShieldCheck,
  },
]

const defaultDonors = [
  {
    name: "Aarav Sharma",
    amount: 1000,
    campaign: "Tree Plantation",
    time: "12 min ago",
  },
  {
    name: "Priya Mehta",
    amount: 500,
    campaign: "Urban Cleanup",
    time: "28 min ago",
  },
  {
    name: "Rahul Verma",
    amount: 2500,
    campaign: "River Restoration",
    time: "41 min ago",
  },
  {
    name: "Eco Warriors Club",
    amount: 5000,
    campaign: "Tree Plantation",
    time: "1 hr ago",
  },
]

const impactLines = [
  "Thank you for choosing action over indifference.",
  "Every contribution gives our communities a stronger green future.",
  "Your generosity turns environmental concern into measurable action.",
  "Together, we can restore cleaner streets, rivers and neighborhoods.",
  "Your support helps volunteers create change where it matters most.",
  "Every rupee can become a seed of cleaner and healthier communities.",
  "Your contribution strengthens the people working for our planet.",
  "Small acts of giving can create lasting environmental transformation.",
  "Thank you for helping Eco Clean Hub grow a culture of responsibility.",
  "The future is greener when we build it together.",
]

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`

const createContributionId = () => {
  const time = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()

  return `ECH-${time}-${random}`
}

const formatDateTime = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)

function Donation() {
  const navigate = useNavigate()

  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [amount, setAmount] = useState(500)
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("upi")

  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [donorPhone, setDonorPhone] = useState("")
  const [donorCity, setDonorCity] = useState("")

  const [showTerms, setShowTerms] = useState(false)
  const [success, setSuccess] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [certificateOpen, setCertificateOpen] = useState(false)

  const [donatedAmount, setDonatedAmount] = useState(0)
  const [contributionId, setContributionId] = useState("")
  const [donationDate, setDonationDate] = useState("")
  const [donationError, setDonationError] = useState("")

  const [recentDonors, setRecentDonors] = useState(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(DONATION_STORAGE_KEY) || "[]"
      )

      if (!Array.isArray(stored)) {
        return defaultDonors
      }

      const storedDonors = stored
        .slice(-4)
        .reverse()
        .map((item) => ({
          name: item.donorName || "Community Donor",
          amount: item.amount || 0,
          campaign: item.campaign || "Green Fund",
          time: "Just now",
        }))

      return [...storedDonors, ...defaultDonors].slice(0, 4)
    } catch {
      return defaultDonors
    }
  })

  const openDonation = (campaign) => {
    setSelectedCampaign(campaign)
    setAmount(500)
    setCustomAmount("")
    setPaymentMethod("upi")

    setDonorName("")
    setDonorEmail("")
    setDonorPhone("")
    setDonorCity("")

    setDonationError("")
    setSuccess(false)
    setReceiptOpen(false)
    setCertificateOpen(false)
  }

  const closeDonation = () => {
    setSelectedCampaign(null)
    setSuccess(false)
    setReceiptOpen(false)
    setCertificateOpen(false)
    setDonationError("")
  }

  const getDonationAmount = () => {
    const custom = Number(customAmount)

    if (customAmount !== "" && custom > 0) {
      return custom
    }

    return Number(amount)
  }

  const completeDonation = () => {
    const finalAmount = getDonationAmount()

    if (!donorName.trim()) {
      setDonationError("Please enter your full name.")
      return
    }

    if (!donorEmail.trim() || !donorEmail.includes("@")) {
      setDonationError("Please enter a valid email address.")
      return
    }

    if (!donorPhone.trim() || donorPhone.trim().length < 10) {
      setDonationError("Please enter a valid 10-digit phone number.")
      return
    }

    if (!donorCity.trim()) {
      setDonationError("Please enter your city.")
      return
    }

    if (!finalAmount || finalAmount < 10) {
      setDonationError("Minimum donation amount is ₹10.")
      return
    }

    if (!selectedCampaign) {
      return
    }

    const newContributionId = createContributionId()
    const now = new Date()
    const formattedDate = formatDateTime(now)

    const donationRecord = {
      id: newContributionId,
      donorName: donorName.trim(),
      email: donorEmail.trim(),
      phone: donorPhone.trim(),
      city: donorCity.trim(),
      campaign: selectedCampaign.title,
      campaignId: selectedCampaign.id,
      amount: finalAmount,
      paymentMethod,
      status: "completed",
      createdAt: now.toISOString(),
      formattedDate,
    }

    try {
      const existing = JSON.parse(
        localStorage.getItem(DONATION_STORAGE_KEY) || "[]"
      )

      const records = Array.isArray(existing) ? existing : []

      localStorage.setItem(
        DONATION_STORAGE_KEY,
        JSON.stringify([...records, donationRecord])
      )
    } catch (error) {
      console.error("Unable to save donation record:", error)
    }

    setRecentDonors((current) => [
      {
        name: donationRecord.donorName,
        amount: donationRecord.amount,
        campaign: donationRecord.campaign,
        time: "Just now",
      },
      ...current,
    ].slice(0, 4))

    setContributionId(newContributionId)
    setDonationDate(formattedDate)
    setDonatedAmount(finalAmount)
    setDonationError("")
    setSuccess(true)
  }

  const printDocument = (type) => {
    const documentTitle =
      type === "certificate"
        ? "Eco Clean Hub Contribution Certificate"
        : "Eco Clean Hub Donation Receipt"

    const content =
      type === "certificate"
        ? `
          <div class="certificate">
            <div class="brand">ECO CLEAN HUB</div>
            <div class="small">GREEN COMMUNITY INITIATIVE</div>

            <div class="leaf">🌿</div>

            <h1>Contribution Certificate</h1>

            <p class="intro">
              This certificate proudly recognizes
            </p>

            <h2>${donorName}</h2>

            <p class="intro">
              for making a meaningful contribution towards
            </p>

            <h3>${selectedCampaign?.title || "Eco Clean Hub Green Fund"}</h3>

            <div class="amount">${formatCurrency(donatedAmount)}</div>

            <p class="body">
              Your contribution supports community-led environmental
              action and helps create cleaner, healthier and greener
              spaces for everyone.
            </p>

            <div class="details">
              <div><strong>Contribution ID</strong><span>${contributionId}</span></div>
              <div><strong>Date</strong><span>${donationDate}</span></div>
              <div><strong>City</strong><span>${donorCity}</span></div>
            </div>

            <p class="footer">
              Thank you for helping build a cleaner future.
            </p>
          </div>
        `
        : `
          <div class="receipt">
            <div class="brand">ECO CLEAN HUB</div>
            <div class="small">DONATION RECEIPT</div>

            <div class="success">✓</div>

            <h1>Donation Receipt</h1>

            <p class="muted">
              Thank you for supporting environmental action.
            </p>

            <div class="receipt-box">
              <div><span>Contribution ID</span><strong>${contributionId}</strong></div>
              <div><span>Donor</span><strong>${donorName}</strong></div>
              <div><span>Email</span><strong>${donorEmail}</strong></div>
              <div><span>Phone</span><strong>${donorPhone}</strong></div>
              <div><span>City</span><strong>${donorCity}</strong></div>
              <div><span>Campaign</span><strong>${selectedCampaign?.title || "Green Fund"}</strong></div>
              <div><span>Payment Method</span><strong>${paymentMethod.toUpperCase()}</strong></div>
              <div><span>Date</span><strong>${donationDate}</strong></div>
            </div>

            <div class="total">
              <span>Total Contribution</span>
              <strong>${formatCurrency(donatedAmount)}</strong>
            </div>

            <p class="footer">
              This receipt records your contribution to the Eco Clean Hub
              Green Fund.
            </p>
          </div>
        `

    const printWindow = window.open("", "_blank", "width=900,height=700")

    if (!printWindow) {
      setDonationError(
        "Please allow pop-ups in your browser to print the document."
      )
      return
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${documentTitle}</title>
          <meta charset="UTF-8" />
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              background: #f5faf7;
              color: #14231a;
              font-family: Arial, Helvetica, sans-serif;
            }

            .receipt,
            .certificate {
              max-width: 760px;
              margin: 0 auto;
              background: white;
              padding: 48px;
              border: 1px solid #d9e9df;
              border-radius: 24px;
            }

            .certificate {
              text-align: center;
              border: 8px double #0b8f4d;
            }

            .brand {
              color: #0b8f4d;
              font-size: 18px;
              font-weight: 800;
              letter-spacing: 3px;
            }

            .small {
              margin-top: 6px;
              color: #64748b;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 2px;
            }

            .leaf,
            .success {
              margin: 28px auto 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 70px;
              height: 70px;
              border-radius: 50%;
              background: #e8f8ee;
              font-size: 32px;
            }

            .success {
              color: #0b8f4d;
              font-size: 38px;
              font-weight: 800;
            }

            h1 {
              margin: 12px 0;
              font-size: 34px;
            }

            h2 {
              margin: 24px 0 10px;
              color: #0b8f4d;
              font-size: 28px;
            }

            h3 {
              margin: 12px 0;
              font-size: 21px;
            }

            .intro,
            .muted {
              color: #64748b;
              line-height: 1.7;
            }

            .amount {
              margin: 28px auto;
              color: #0b8f4d;
              font-size: 40px;
              font-weight: 900;
            }

            .body {
              max-width: 580px;
              margin: 25px auto;
              color: #475569;
              line-height: 1.8;
            }

            .details,
            .receipt-box {
              margin-top: 30px;
              border: 1px solid #dce9e1;
              border-radius: 16px;
              overflow: hidden;
            }

            .details div,
            .receipt-box div {
              display: flex;
              justify-content: space-between;
              gap: 30px;
              padding: 13px 16px;
              border-bottom: 1px solid #edf2ef;
            }

            .details div:last-child,
            .receipt-box div:last-child {
              border-bottom: 0;
            }

            .details span,
            .receipt-box span {
              color: #64748b;
            }

            .details strong,
            .receipt-box strong {
              text-align: right;
            }

            .total {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              padding: 18px;
              border-radius: 16px;
              background: #eaf8ef;
              color: #0b8f4d;
              font-size: 18px;
              font-weight: 800;
            }

            .footer {
              margin-top: 32px;
              color: #64748b;
              font-size: 13px;
              line-height: 1.7;
            }

            @media print {
              body {
                padding: 0;
                background: white;
              }

              .receipt,
              .certificate {
                border-radius: 0;
                box-shadow: none;
              }
            }
          </style>
        </head>

        <body>
          ${content}
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6faf7] px-4 py-6 sm:px-6 lg:px-8">
      <style>{`
        @keyframes donationFadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes donationFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes donationPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }

        @keyframes donationSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .donation-fade-up {
          animation: donationFadeUp 0.55s ease-out both;
        }

        .donation-float {
          animation: donationFloat 4s ease-in-out infinite;
        }

        .donation-pulse {
          animation: donationPulse 3s ease-in-out infinite;
        }

        .donation-spin-slow {
          animation: donationSpin 24s linear infinite;
        }
      `}</style>

      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-3 rounded-xl px-1 py-2 text-base font-semibold text-slate-600 transition hover:text-[#0b8f4d]"
        >
          <ArrowLeft size={21} />
          Back to Dashboard
        </button>


        {/* Hero */}
        <section className="donation-fade-up relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b8f4d] via-[#176b45] to-[#063c23] p-7 text-white shadow-xl sm:p-10 lg:p-12">

          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-green-300/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur">
                <Heart size={15} />
                Green Fund
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Donation & Green Fund
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-green-50/85 sm:text-lg">
                Put your contribution where it creates real environmental
                momentum. Support cleaner communities, healthier waterways
                and a greener future.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur transition hover:-translate-y-1">
                  <p className="text-2xl font-black">₹2.24L+</p>
                  <p className="text-xs text-green-50/70">
                    Community raised
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur transition hover:-translate-y-1">
                  <p className="text-2xl font-black">3</p>
                  <p className="text-xs text-green-50/70">
                    Active campaigns
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur transition hover:-translate-y-1">
                  <p className="text-2xl font-black">100%</p>
                  <p className="text-xs text-green-50/70">
                    Transparency focus
                  </p>
                </div>
              </div>
            </div>


            {/* Animated illustration */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="donation-float relative flex aspect-square items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur">

                <div className="donation-spin-slow absolute h-64 w-64 rounded-full border border-white/10" />

                <div className="absolute h-48 w-48 rounded-full border border-white/10" />

                <div className="donation-pulse relative flex h-36 w-36 items-center justify-center rounded-full bg-white/15 shadow-xl">
                  <TreePine size={72} strokeWidth={1.5} />
                </div>

                <div className="absolute left-7 top-9 rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <Leaf size={24} />
                </div>

                <div className="absolute bottom-9 right-7 rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <Droplets size={24} />
                </div>

                <div className="absolute bottom-7 left-9 rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <Users size={22} />
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* Campaigns */}
        <section className="mt-8">
          <div className="mb-5 donation-fade-up">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0b8f4d]">
              Active campaigns
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#14231a]">
              Choose where your impact goes
            </h2>

            <p className="mt-2 max-w-2xl text-slate-500">
              Select a campaign and contribute directly to an environmental
              initiative supported by the Eco Clean Hub community.
            </p>
          </div>


          <div className="grid gap-5 lg:grid-cols-3">
            {campaigns.map((campaign, index) => {
              const Icon = campaign.icon
              const percentage = Math.min(
                100,
                Math.round(
                  (campaign.raised / campaign.target) * 100
                )
              )

              return (
                <article
                  key={campaign.id}
                  className="donation-fade-up group rounded-3xl border border-[#dfeae2] bg-white p-6 shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[#0b8f4d] transition duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon size={25} />
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#176b45]">
                      {percentage}% funded
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-black text-[#14231a]">
                    {campaign.title}
                  </h3>

                  <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
                    {campaign.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <MapPin size={14} />
                    {campaign.location}
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-[#14231a]">
                        {formatCurrency(campaign.raised)}
                      </span>

                      <span className="text-slate-400">
                        of {formatCurrency(campaign.target)}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-green-100">
                      <div
                        className="h-full rounded-full bg-[#0b8f4d] transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-400">
                    {campaign.impact}
                  </p>

                  <button
                    type="button"
                    onClick={() => openDonation(campaign)}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3.5 font-bold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#087b42] hover:shadow-lg"
                  >
                    <Gift size={18} />
                    Donate Now
                  </button>
                </article>
              )
            })}
          </div>
        </section>


        {/* Transparency + Donors */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">

          <div className="rounded-3xl border border-[#dfeae2] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d]">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h2 className="text-xl font-black text-[#14231a]">
                  Transparency & Guidelines
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Understand how contributions are handled.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTerms((current) => !current)}
              className="mt-6 flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-[#f8fbf9] px-4 py-4 text-left transition hover:bg-green-50"
            >
              <span className="font-bold text-[#176b45]">
                Terms & Conditions / Read More
              </span>

              <ChevronDown
                size={19}
                className={`transition-transform duration-300 ${
                  showTerms ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ${
                showTerms
                  ? "mt-4 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-4 rounded-2xl border border-green-100 bg-green-50/50 p-5 text-sm leading-6 text-slate-600">
                  <div>
                    <p className="font-bold text-[#14231a]">
                      Fund utilization
                    </p>
                    <p>
                      Contributions are intended for the campaign selected
                      by the donor, including approved environmental
                      activities, community operations and project support.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-[#14231a]">
                      Transparency
                    </p>
                    <p>
                      Campaign progress and contribution summaries are
                      presented to help donors understand how community
                      funding is being directed.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-[#14231a]">
                      Tax documentation
                    </p>
                    <p>
                      Where applicable, official donation receipts or tax
                      documentation may be provided. Any tax exemption or
                      deduction depends on donor eligibility and applicable
                      laws.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-[#14231a]">
                      Donation policy
                    </p>
                    <p>
                      Donations should be made voluntarily. Campaign
                      availability, project timelines and utilization may
                      change based on operational requirements and
                      environmental priorities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="rounded-3xl border border-[#dfeae2] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#14231a]">
                  Recent Donors
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Community contributions and transparency log.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d]">
                <Users size={20} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {recentDonors.map((donor, index) => (
                <div
                  key={`${donor.name}-${donor.time}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-green-100 hover:bg-green-50/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-black text-[#176b45]">
                    {donor.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#14231a]">
                      {donor.name}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {donor.campaign} · {donor.time}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-black text-[#0b8f4d]">
                    {formatCurrency(donor.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </section>


        {/* Impact Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            [TreePine, "1,240+", "Green actions supported"],
            [Users, "680+", "Community contributors"],
            [Leaf, "24", "Community projects"],
          ].map(([Icon, value, label]) => (
            <div
              key={label}
              className="group rounded-3xl border border-green-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d] transition group-hover:scale-110">
                <Icon size={22} />
              </div>

              <p className="mt-5 text-3xl font-black text-[#14231a]">
                {value}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </section>


        {/* Exactly 10 red impact lines */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <Heart className="text-rose-600" size={24} />

            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
                Thank You & Impact
              </p>

              <h2 className="mt-1 text-2xl font-black text-rose-900">
                Your contribution creates momentum.
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {impactLines.map((line, index) => (
              <p
                key={index}
                className="text-sm font-semibold leading-6 text-rose-700 sm:text-base"
              >
                {line}
              </p>
            ))}
          </div>
        </section>

      </div>


      {/* Donation Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDonation()
            }
          }}
        >
          <div className="donation-scale max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">

            {!success ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b8f4d]">
                      Support campaign
                    </p>

                    <h2 className="mt-1 text-xl font-black text-[#14231a]">
                      {selectedCampaign.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={closeDonation}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                    aria-label="Close donation modal"
                  >
                    <X size={19} />
                  </button>
                </div>


                <div className="p-6">

                  {/* Donor details */}
                  <div className="rounded-2xl border border-green-100 bg-green-50/50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0b8f4d]">
                        <User size={19} />
                      </div>

                      <div>
                        <h3 className="font-black text-[#14231a]">
                          Contributor Details
                        </h3>

                        <p className="text-xs text-slate-500">
                          These details will appear on your receipt and certificate.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">

                      <input
                        type="text"
                        value={donorName}
                        onChange={(event) => {
                          setDonorName(event.target.value)
                          setDonationError("")
                        }}
                        placeholder="Full name"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#0b8f4d] focus:ring-2 focus:ring-green-100"
                      />

                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(event) => {
                          setDonorEmail(event.target.value)
                          setDonationError("")
                        }}
                        placeholder="Email address"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#0b8f4d] focus:ring-2 focus:ring-green-100"
                      />

                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(event) => {
                          setDonorPhone(event.target.value)
                          setDonationError("")
                        }}
                        placeholder="Phone number"
                        maxLength={10}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#0b8f4d] focus:ring-2 focus:ring-green-100"
                      />

                      <input
                        type="text"
                        value={donorCity}
                        onChange={(event) => {
                          setDonorCity(event.target.value)
                          setDonationError("")
                        }}
                        placeholder="City"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#0b8f4d] focus:ring-2 focus:ring-green-100"
                      />

                    </div>
                  </div>


                  {/* Amount */}
                  <div className="mt-6">
                    <p className="text-sm font-bold text-[#14231a]">
                      Choose contribution
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {[100, 500, 1000].map((quickAmount) => (
                        <button
                          key={quickAmount}
                          type="button"
                          onClick={() => {
                            setAmount(quickAmount)
                            setCustomAmount("")
                            setDonationError("")
                          }}
                          className={`rounded-xl border px-4 py-3 text-sm font-black transition ${
                            amount === quickAmount &&
                            customAmount === ""
                              ? "border-[#0b8f4d] bg-green-50 text-[#0b8f4d]"
                              : "border-slate-200 bg-white text-slate-600 hover:border-green-200 hover:bg-green-50"
                          }`}
                        >
                          ₹{quickAmount}
                        </button>
                      ))}
                    </div>


                    <div className="mt-3 flex items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-[#0b8f4d]">
                      <span className="font-bold text-slate-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="10"
                        value={customAmount}
                        onChange={(event) => {
                          setCustomAmount(event.target.value)
                          setDonationError("")
                        }}
                        placeholder="Enter custom amount"
                        className="w-full bg-transparent px-3 py-3 text-sm font-semibold outline-none"
                      />
                    </div>
                  </div>


                  {/* Payment */}
                  <div className="mt-6">
                    <p className="text-sm font-bold text-[#14231a]">
                      Payment method
                    </p>

                    <div className="mt-3 space-y-2">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon

                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() =>
                              setPaymentMethod(method.id)
                            }
                            className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                              paymentMethod === method.id
                                ? "border-[#0b8f4d] bg-green-50"
                                : "border-slate-200 hover:border-green-200"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                paymentMethod === method.id
                                  ? "bg-white text-[#0b8f4d]"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <Icon size={19} />
                            </div>

                            <div className="flex-1">
                              <p className="text-sm font-bold text-[#14231a]">
                                {method.label}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {method.description}
                              </p>
                            </div>

                            {paymentMethod === method.id && (
                              <CheckCircle2
                                size={19}
                                className="text-[#0b8f4d]"
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>


                  {donationError && (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                      {donationError}
                    </div>
                  )}


                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    <Lock size={15} />
                    Payment processing should be connected to a secure
                    payment gateway before accepting real money.
                  </div>


                  <button
                    type="button"
                    onClick={completeDonation}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-4 font-black text-white shadow-lg shadow-green-900/15 transition hover:-translate-y-0.5 hover:bg-[#087b42]"
                  >
                    <Heart size={18} />
                    Complete Contribution · {formatCurrency(getDonationAmount())}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-7 sm:p-10">

                <div className="text-center">
                  <div className="donation-pulse mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#0b8f4d]">
                    <CheckCircle2 size={34} />
                  </div>

                  <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#0b8f4d]">
                    Contribution Recorded
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-[#14231a]">
                    Thank you, {donorName}!
                  </h2>

                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                    Your contribution of{" "}
                    <strong className="text-[#0b8f4d]">
                      {formatCurrency(donatedAmount)}
                    </strong>{" "}
                    has been recorded for{" "}
                    <strong>{selectedCampaign?.title}</strong>.
                  </p>
                </div>


                {/* Contribution ID */}
                <div className="mt-7 rounded-2xl border border-green-100 bg-green-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#0b8f4d]">
                        Contribution ID
                      </p>

                      <p className="mt-1 font-mono text-sm font-black text-[#14231a]">
                        {contributionId}
                      </p>
                    </div>

                    <p className="text-xs font-medium text-slate-500">
                      {donationDate}
                    </p>
                  </div>
                </div>


                {/* Donor information */}
                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <User size={17} className="text-[#0b8f4d]" />

                    <p className="font-black text-[#14231a]">
                      Contributor Information
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">Name</p>
                      <p className="font-bold text-slate-700">
                        {donorName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="break-all font-bold text-slate-700">
                        {donorEmail}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="font-bold text-slate-700">
                        {donorPhone}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">City</p>
                      <p className="font-bold text-slate-700">
                        {donorCity}
                      </p>
                    </div>
                  </div>
                </div>


                {/* Documents */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() => setReceiptOpen(true)}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d] transition group-hover:scale-105">
                        <FileText size={21} />
                      </div>

                      <Download
                        size={17}
                        className="text-slate-400"
                      />
                    </div>

                    <p className="mt-4 font-black text-[#14231a]">
                      Donation Receipt
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      View, print or save your contribution receipt.
                    </p>
                  </button>


                  <button
                    type="button"
                    onClick={() => setCertificateOpen(true)}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d] transition group-hover:scale-105">
                        <ShieldCheck size={21} />
                      </div>

                      <Download
                        size={17}
                        className="text-slate-400"
                      />
                    </div>

                    <p className="mt-4 font-black text-[#14231a]">
                      Contribution Certificate
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      View, print or save your green contribution certificate.
                    </p>
                  </button>

                </div>


                <div className="mt-6 rounded-2xl bg-green-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0b8f4d]">
                    Your impact
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your contribution strengthens community-led environmental
                    action and helps move this campaign closer to its goal.
                  </p>
                </div>


                <button
                  type="button"
                  onClick={closeDonation}
                  className="mt-6 w-full rounded-xl bg-[#0b8f4d] px-5 py-3.5 font-bold text-white transition hover:bg-[#087b42]"
                >
                  Done
                </button>

              </div>
            )}

          </div>
        </div>
      )}


      {/* Receipt Preview */}
      {receiptOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b8f4d]">
                  Document
                </p>

                <h2 className="mt-1 text-xl font-black text-[#14231a]">
                  Donation Receipt
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setReceiptOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X size={19} />
              </button>
            </div>


            <div className="p-6">
              <div className="rounded-3xl border border-green-100 bg-[#fbfefc] p-6">

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black tracking-[0.2em] text-[#0b8f4d]">
                      ECO CLEAN HUB
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Donation Receipt
                    </p>
                  </div>

                  <CheckCircle2
                    size={32}
                    className="text-[#0b8f4d]"
                  />
                </div>

                <div className="my-6 h-px bg-green-100" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">
                      Contributor
                    </p>
                    <p className="mt-1 font-black text-[#14231a]">
                      {donorName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Contribution ID
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-black text-[#14231a]">
                      {contributionId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Campaign
                    </p>
                    <p className="mt-1 font-bold text-slate-700">
                      {selectedCampaign?.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Date
                    </p>
                    <p className="mt-1 font-bold text-slate-700">
                      {donationDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 break-all font-bold text-slate-700">
                      {donorEmail}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Payment Method
                    </p>
                    <p className="mt-1 font-bold uppercase text-slate-700">
                      {paymentMethod}
                    </p>
                  </div>
                </div>


                <div className="mt-6 flex items-center justify-between rounded-2xl bg-green-50 px-5 py-4">
                  <span className="font-bold text-slate-600">
                    Total Contribution
                  </span>

                  <span className="text-2xl font-black text-[#0b8f4d]">
                    {formatCurrency(donatedAmount)}
                  </span>
                </div>

              </div>


              <button
                type="button"
                onClick={() => printDocument("receipt")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3.5 font-black text-white transition hover:bg-[#087b42]"
              >
                <Printer size={18} />
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Certificate Preview */}
      {certificateOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b8f4d]">
                  Recognition
                </p>

                <h2 className="mt-1 text-xl font-black text-[#14231a]">
                  Contribution Certificate
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setCertificateOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X size={19} />
              </button>
            </div>


            <div className="p-6">
              <div className="rounded-[2rem] border-4 border-double border-[#0b8f4d] bg-gradient-to-br from-white to-green-50 p-7 text-center sm:p-10">

                <p className="text-sm font-black tracking-[0.25em] text-[#0b8f4d]">
                  ECO CLEAN HUB
                </p>

                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Green Community Initiative
                </p>

                <div className="mx-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                  🌿
                </div>

                <h3 className="mt-6 text-3xl font-black text-[#14231a]">
                  Contribution Certificate
                </h3>

                <p className="mt-5 text-sm text-slate-500">
                  This certificate proudly recognizes
                </p>

                <p className="mt-3 text-2xl font-black text-[#0b8f4d]">
                  {donorName}
                </p>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
                  for making a meaningful contribution towards
                </p>

                <p className="mt-3 text-lg font-black text-[#14231a]">
                  {selectedCampaign?.title}
                </p>

                <p className="mt-5 text-4xl font-black text-[#0b8f4d]">
                  {formatCurrency(donatedAmount)}
                </p>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-600">
                  Your contribution supports community-led environmental
                  action and helps create cleaner, healthier and greener
                  spaces for everyone.
                </p>


                <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Contribution ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs font-black text-slate-700">
                      {contributionId}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-xs font-black text-slate-700">
                      {donationDate}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      City
                    </p>

                    <p className="mt-1 text-xs font-black text-slate-700">
                      {donorCity}
                    </p>
                  </div>
                </div>

                <p className="mt-8 text-sm font-bold text-[#176b45]">
                  Thank you for helping build a cleaner future.
                </p>

              </div>


              <button
                type="button"
                onClick={() => printDocument("certificate")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3.5 font-black text-white transition hover:bg-[#087b42]"
              >
                <Printer size={18} />
                Print / Save Certificate as PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default Donation