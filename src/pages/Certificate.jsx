import {
  Award,
  CheckCircle2,
  Download,
  ImagePlus,
  Leaf,
  Lock,
  Sparkles,
  Upload,
  X,
} from "lucide-react"

import { useEffect, useRef, useState } from "react"
import useAuth from "../hooks/useAuth"

import { getCreditBalance } from "../services/creditService"


const LEVELS = [
  {
    name: "Bronze",
    credits: 3000,
    icon: "🥉",
  },
  {
    name: "Silver",
    credits: 7000,
    icon: "🥈",
  },
  {
    name: "Gold",
    credits: 10000,
    icon: "🥇",
  },
]


function Certificate() {
  const { user } = useAuth()

  const [credits, setCredits] = useState(0)
  const [photo, setPhoto] = useState("")
  const [showCertificate, setShowCertificate] = useState(false)

  const fileInputRef = useRef(null)


  /* =====================================================
     LOAD ECO CREDITS
     Same source as Eco-Credits Wallet
     ===================================================== */

  const loadCredits = () => {
    if (!user?.uid) {
      setCredits(0)
      return
    }

    const balance = Number(
      getCreditBalance(user.uid),
    ) || 0

    setCredits(balance)
  }


  /* =====================================================
     LOAD SAVED PHOTO
     ===================================================== */

  const loadPhoto = () => {
    const savedPhoto = localStorage.getItem(
      "ecoCertificatePhoto",
    )

    if (savedPhoto) {
      setPhoto(savedPhoto)
    }
  }


  useEffect(() => {
    loadCredits()
    loadPhoto()

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


  /* =====================================================
     PHOTO UPLOAD
     ===================================================== */

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload an image smaller than 5MB.")
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const imageData = reader.result

      localStorage.setItem(
        "ecoCertificatePhoto",
        imageData,
      )

      setPhoto(imageData)
    }

    reader.readAsDataURL(file)
  }


  /* =====================================================
     CURRENT LEVEL
     ===================================================== */

  const currentLevel =
    credits >= 10000
      ? LEVELS[2]
      : credits >= 7000
        ? LEVELS[1]
        : credits >= 3000
          ? LEVELS[0]
          : null


  /* =====================================================
     NEXT LEVEL
     ===================================================== */

  const nextLevel =
    LEVELS.find(
      (level) => credits < level.credits,
    ) || null


  const remainingCredits = nextLevel
    ? nextLevel.credits - credits
    : 0


  /* =====================================================
     OVERALL PROGRESS
     ===================================================== */

  const overallProgress = Math.min(
    (credits / 10000) * 100,
    100,
  )


  /* =====================================================
     USER NAME
     ===================================================== */

  const userName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Eco Warrior"


  return (
    <div className="min-h-screen bg-[#f3f8f5] text-[#14231a]">


      {/* =================================================
          HEADER
          ================================================= */}

      <header className="border-b border-[#d8e7de] bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#176b45] text-white shadow-sm">
              <Leaf size={21} />
            </div>

            <div>

              <h1 className="text-sm font-bold text-[#173426]">
                Eco<span className="text-[#176b45]">Clean</span>
              </h1>

              <p className="text-[8px] font-bold tracking-[0.3em] text-[#176b45]">
                HUB
              </p>

            </div>

          </div>


          <div className="hidden items-center gap-2 rounded-full bg-[#edf8f1] px-3 py-1.5 text-[10px] font-bold text-[#176b45] sm:flex">

            <Award size={13} />

            CERTIFICATES

          </div>

        </div>

      </header>


      {/* =================================================
          MAIN
          ================================================= */}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">


        {/* =================================================
            PAGE TITLE
            ================================================= */}

        <section className="mb-5 text-center">

          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#dcf5e6] text-[#176b45] shadow-sm">

            <Award size={23} />

          </div>


          <h2 className="text-2xl font-extrabold tracking-tight text-[#10291d] sm:text-3xl">
            Eco Clean Certificates
          </h2>


          <p className="mx-auto mt-1 max-w-lg text-xs text-slate-500 sm:text-sm">
            Earn Bronze, Silver and Gold certificates
            as your Eco-Credits grow.
          </p>

        </section>


        {/* =================================================
            PHOTO UPLOAD
            ================================================= */}

        <section className="mb-5 rounded-2xl border border-[#d5e6dc] bg-white p-4 shadow-sm sm:p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              {/* PHOTO */}
              <div className="relative">

                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#c9e1d1] bg-[#edf8f1] text-[#176b45]">

                  {photo ? (

                    <img
                      src={photo}
                      alt="Certificate profile"
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <ImagePlus size={23} />

                  )}

                </div>


                {/* SMALL UPLOAD BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#176b45] text-white shadow-md transition hover:bg-[#125a39]"
                >

                  <Upload size={12} />

                </button>

              </div>


              <div>

                <h3 className="text-sm font-bold text-[#173426]">
                  Certificate Photo
                </h3>

                <p className="mt-0.5 max-w-md text-[11px] leading-5 text-slate-400">
                  Upload your photo and it will appear on
                  your premium certificate.
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#176b45] bg-white px-4 py-2.5 text-xs font-bold text-[#176b45] transition hover:bg-[#edf8f1]"
            >

              <ImagePlus size={15} />

              {photo ? "Change Photo" : "Upload Photo"}

            </button>


            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

          </div>

        </section>


        {/* =================================================
            CREDIT PROGRESS
            ================================================= */}

        <section className="mb-5 rounded-2xl border border-[#d5e6dc] bg-white p-4 shadow-sm sm:p-5">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Your Eco-Credits
              </p>

              <div className="mt-1 flex items-end gap-2">

                <span className="text-3xl font-extrabold text-[#176b45]">
                  {credits.toLocaleString()}
                </span>

                <span className="mb-1 text-[11px] text-slate-400">
                  / 10,000
                </span>

              </div>

            </div>


            <div className="rounded-xl bg-[#edf8f1] px-3 py-2 text-right">

              <p className="text-[9px] text-slate-400">

                {nextLevel
                  ? `${nextLevel.name} certificate`
                  : "All levels unlocked"}

              </p>

              <p className="mt-0.5 text-xs font-bold text-[#176b45]">

                {nextLevel
                  ? `${remainingCredits.toLocaleString()} to go`
                  : "Completed ✓"}

              </p>

            </div>

          </div>


          {/* =================================================
              LEVEL PROGRESS
              ================================================= */}

          <div className="mt-6 px-1 sm:px-2">

            <div className="relative">

              {/* BACKGROUND LINE */}

              <div className="absolute left-0 right-0 top-4 h-1.5 rounded-full bg-[#dfeae4]" />


              {/* GREEN PROGRESS */}

              <div
                className="absolute left-0 top-4 h-1.5 rounded-full bg-[#176b45] transition-all duration-700"
                style={{
                  width: `${overallProgress}%`,
                }}
              />


              {/* LEVEL MARKERS */}

              <div className="relative flex justify-between">

                {LEVELS.map((level) => {

                  const unlocked =
                    credits >= level.credits

                  return (
                    <div
                      key={level.name}
                      className="flex w-20 flex-col items-center"
                    >

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                          unlocked
                            ? "bg-[#176b45] text-white"
                            : "bg-[#e5efe9] text-[#176b45]"
                        }`}
                      >

                        {unlocked ? (
                          <span className="text-sm">
                            {level.icon}
                          </span>
                        ) : (
                          <Lock size={12} />
                        )}

                      </div>


                      <p
                        className={`mt-2 text-[10px] font-bold ${
                          unlocked
                            ? "text-[#176b45]"
                            : "text-slate-500"
                        }`}
                      >
                        {level.name}
                      </p>


                      <p className="text-[8px] text-slate-400">
                        {level.credits.toLocaleString()}
                      </p>

                    </div>
                  )
                })}

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            BRONZE / SILVER / GOLD CARDS
            ================================================= */}

        <section className="mb-5 grid gap-3 md:grid-cols-3">

          {LEVELS.map((level) => {

            const unlocked =
              credits >= level.credits

            const levelProgress =
              Math.min(
                (credits / level.credits) * 100,
                100,
              )

            const remaining =
              Math.max(
                level.credits - credits,
                0,
              )

            return (
              <div
                key={level.name}
                className="rounded-2xl border border-[#238356] bg-[#176b45] p-4 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#155f3e]"
              >

                {/* TOP */}

                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">

                    {level.icon}

                  </div>


                  {unlocked ? (

                    <span className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#176b45]">

                      <CheckCircle2 size={10} />

                      Unlocked

                    </span>

                  ) : (

                    <span className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold text-[#176b45]">

                      <Lock size={10} />

                      Locked

                    </span>

                  )}

                </div>


                {/* NAME */}

                <h3 className="mt-3 text-base font-extrabold text-white">
                  {level.name}
                </h3>


                {/* REQUIRED */}

                <p className="text-[10px] text-green-100">
                  {level.credits.toLocaleString()} Eco-Credits
                </p>


                {/* PROGRESS */}

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/30">

                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{
                      width: `${levelProgress}%`,
                    }}
                  />

                </div>


                {/* REMAINING */}

                <p className="mt-2 text-[9px] text-green-100">

                  {unlocked
                    ? "Certificate unlocked"
                    : `${remaining.toLocaleString()} credits remaining`}

                </p>

              </div>
            )
          })}

        </section>


        {/* =================================================
            CERTIFICATE LOCK / UNLOCK
            ================================================= */}

        <section className="mb-5">

          {currentLevel ? (

            /* =================================================
               UNLOCKED
               ================================================= */

            <div className="rounded-2xl border border-[#b8dcc6] bg-gradient-to-br from-white to-[#edf8f1] p-6 shadow-sm">

              <div className="flex flex-col items-center text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#176b45] text-white shadow-md">

                  <Award size={27} />

                </div>


                <h3 className="mt-3 text-xl font-extrabold">
                  {currentLevel.name} Certificate Unlocked!
                </h3>


                <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                  Congratulations! You have reached the{" "}
                  {currentLevel.credits.toLocaleString()}{" "}
                  Eco-Credit milestone.
                </p>


                <button
                  onClick={() =>
                    setShowCertificate(true)
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#176b45] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#125a39]"
                >

                  <Award size={15} />

                  View Certificate

                </button>

              </div>

            </div>

          ) : (

            /* =================================================
               LOCKED
               ================================================= */

            <div className="relative overflow-hidden rounded-2xl border border-[#cfe3d7] bg-gradient-to-br from-white via-[#f8fcf9] to-[#edf8f1] p-6 shadow-sm">

              {/* DECORATION */}

              <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[#dff3e7]" />


              <div className="relative flex flex-col items-center text-center">

                {/* LOCK ICON */}

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b8d9c4] bg-[#e6f5ec] text-[#176b45] shadow-sm">

                  <Lock size={25} />

                </div>


                <h3 className="mt-3 text-xl font-extrabold">
                  Certificates Locked
                </h3>


                <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                  Keep completing eco-friendly missions
                  to unlock your certificates.
                </p>


                {/* NEXT MILESTONE */}

                <div className="mt-4 rounded-xl border border-dashed border-[#b9d9c6] bg-white px-6 py-3 shadow-sm">

                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Next Milestone
                  </p>


                  <p className="mt-1 text-base font-extrabold text-[#176b45]">

                    {nextLevel?.icon}{" "}
                    {nextLevel?.name} —{" "}
                    {nextLevel?.credits.toLocaleString()}

                  </p>


                  <p className="text-[9px] text-slate-400">

                    {remainingCredits.toLocaleString()}{" "}
                    credits remaining

                  </p>

                </div>


                {/* DEMO */}

                <button
                  onClick={() =>
                    setShowCertificate(true)
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#176b45] bg-white px-5 py-2.5 text-xs font-bold text-[#176b45] transition hover:bg-[#edf8f1]"
                >

                  <Award size={15} />

                  View Demo Certificate

                </button>


                <p className="mt-1 text-[8px] text-slate-400">
                  Preview only • No signature
                </p>

              </div>

            </div>

          )}

        </section>


        {/* =================================================
            PREMIUM CERTIFICATE LEVEL INFO
            ================================================= */}

        <section className="rounded-2xl border border-[#d2e3d9] bg-white p-4 shadow-sm">

          {/* HEADER */}

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f5eb] text-[#176b45] shadow-sm">

              <Sparkles size={18} />

            </div>


            <div>

              <h3 className="text-sm font-extrabold text-[#173426]">
                Certificate Levels
              </h3>

              <p className="mt-0.5 text-[9px] text-slate-400">
                Grow your Eco-Credits and unlock every level.
              </p>

            </div>

          </div>


          {/* THREE PREMIUM BOXES */}

          <div className="grid gap-3 sm:grid-cols-3">


            {/* =================================================
                BRONZE
                ================================================= */}

            <div className="group relative overflow-hidden rounded-xl border border-[#e4cdbd] bg-gradient-to-br from-[#fffaf7] to-[#f7eee8] p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="absolute right-0 top-0 h-14 w-14 rounded-bl-full bg-[#ead6c8]/50" />

              <div className="relative">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ead6c8] text-sm shadow-sm">
                    🥉
                  </div>

                  <div>

                    <p className="text-xs font-extrabold text-[#8b5735]">
                      Bronze
                    </p>

                    <p className="text-[8px] text-[#9b765f]">
                      Starter Achievement
                    </p>

                  </div>

                </div>


                <div className="mt-3 flex items-center justify-between gap-2">

                  <p className="text-[10px] font-semibold text-slate-500">
                    3,000 Eco-Credits
                  </p>

                  <span className="rounded-full bg-[#ead6c8] px-2 py-0.5 text-[8px] font-bold text-[#8b5735]">
                    LEVEL 01
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                SILVER
                ================================================= */}

            <div className="group relative overflow-hidden rounded-xl border border-[#d2dce0] bg-gradient-to-br from-[#fbfcfd] to-[#eef2f4] p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="absolute right-0 top-0 h-14 w-14 rounded-bl-full bg-[#dbe3e7]/60" />

              <div className="relative">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dce4e8] text-sm shadow-sm">
                    🥈
                  </div>

                  <div>

                    <p className="text-xs font-extrabold text-[#64717a]">
                      Silver
                    </p>

                    <p className="text-[8px] text-[#87939a]">
                      Advanced Achievement
                    </p>

                  </div>

                </div>


                <div className="mt-3 flex items-center justify-between gap-2">

                  <p className="text-[10px] font-semibold text-slate-500">
                    7,000 Eco-Credits
                  </p>

                  <span className="rounded-full bg-[#dce4e8] px-2 py-0.5 text-[8px] font-bold text-[#64717a]">
                    LEVEL 02
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                GOLD
                ================================================= */}

            <div className="group relative overflow-hidden rounded-xl border border-[#e5d39e] bg-gradient-to-br from-[#fffdf5] to-[#faf3d9] p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="absolute right-0 top-0 h-14 w-14 rounded-bl-full bg-[#f0dfaa]/50" />

              <div className="relative">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0dfaa] text-sm shadow-sm">
                    🥇
                  </div>

                  <div>

                    <p className="text-xs font-extrabold text-[#a17413]">
                      Gold
                    </p>

                    <p className="text-[8px] text-[#a78a4d]">
                      Highest Achievement
                    </p>

                  </div>

                </div>


                <div className="mt-3 flex items-center justify-between gap-2">

                  <p className="text-[10px] font-semibold text-slate-500">
                    10,000 Eco-Credits
                  </p>

                  <span className="rounded-full bg-[#f0dfaa] px-2 py-0.5 text-[8px] font-bold text-[#a17413]">
                    LEVEL 03
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          PREMIUM CERTIFICATE MODAL
          ===================================================== */}

      {showCertificate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#061b12]/80 p-3 backdrop-blur-sm sm:p-6">

          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-2 shadow-2xl sm:p-4">


            {/* CLOSE */}

            <button
              onClick={() =>
                setShowCertificate(false)
              }
              className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-md transition hover:text-[#176b45]"
            >

              <X size={17} />

            </button>


            {/* =================================================
                CERTIFICATE
                ================================================= */}

            <div className="rounded-xl border-[5px] border-[#176b45] bg-[#fffdf7] p-1 sm:p-3">

              <div className="border border-[#b89135] p-4 sm:p-8 md:p-10">


                {/* BRAND */}

                <div className="text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#176b45] text-white shadow-md">

                    <Leaf size={24} />

                  </div>


                  <p className="mt-3 text-[9px] font-extrabold tracking-[0.35em] text-[#176b45]">
                    ECO CLEAN HUB
                  </p>


                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9a7a31]">
                    Certificate of Achievement
                  </p>


                  <h2 className="mt-4 font-serif text-2xl font-bold text-[#173426] sm:text-4xl md:text-5xl">
                    Certificate of Eco Impact
                  </h2>


                  <div className="mx-auto mt-3 h-0.5 w-20 bg-[#b89135]" />

                </div>


                {/* =================================================
                    PHOTO
                    ================================================= */}

                <div className="mt-6 flex flex-col items-center">


                  <div className="relative">

                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#e8f5ed] shadow-lg ring-2 ring-[#b89135]">

                      {photo ? (

                        <img
                          src={photo}
                          alt="Certificate recipient"
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <Leaf
                          size={35}
                          className="text-[#176b45]"
                        />

                      )}

                    </div>


                    {/* BADGE */}

                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#176b45] text-white shadow-md">

                      <Award size={14} />

                    </div>

                  </div>


                  <p className="mt-5 text-[10px] text-slate-500">
                    This certificate is proudly presented to
                  </p>


                  <h3 className="mt-1 text-2xl font-bold text-[#176b45] sm:text-3xl">
                    {userName}
                  </h3>


                  <p className="mx-auto mt-3 max-w-xl text-center text-[10px] leading-5 text-slate-500 sm:text-xs">
                    In recognition of dedication towards
                    responsible waste management, recycling
                    and creating a cleaner, greener future.
                  </p>

                </div>


                {/* =================================================
                    LEVEL BADGE
                    ================================================= */}

                <div className="mt-5 flex justify-center">

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d8c28a] bg-[#fff9e8] px-5 py-2">

                    <span className="text-lg">
                      {currentLevel?.icon || "🌱"}
                    </span>

                    <div className="text-left">

                      <p className="text-[8px] font-bold uppercase tracking-wider text-[#9a7a31]">
                        Achievement Level
                      </p>

                      <p className="text-sm font-extrabold text-[#176b45]">
                        {currentLevel?.name || "Demo"} Certificate
                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    CERTIFICATE DETAILS
                    ================================================= */}

                <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3">


                  <div className="rounded-xl border border-[#d9c68e] bg-[#fffaf0] p-3 text-center">

                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      Eco-Credits
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-[#176b45]">

                      {currentLevel
                        ? `${currentLevel.credits.toLocaleString()}+`
                        : `${credits.toLocaleString()}`}

                    </p>

                  </div>


                  <div className="rounded-xl border border-[#cfe3d6] bg-[#f3faf6] p-3 text-center">

                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      Recognition
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-[#176b45]">
                      Eco Warrior
                    </p>

                  </div>

                </div>


                {/* =================================================
                    FOOTER
                    ================================================= */}

                <div className="mt-7 flex flex-col items-center justify-center">

                  <div className="h-px w-36 bg-slate-300" />

                  <p className="mt-2 text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                    Demo Certificate • No Signature
                  </p>


                  <div className="mt-4 flex items-center gap-2 text-[8px] font-bold tracking-[0.2em] text-[#176b45]">

                    <Leaf size={11} />

                    ECO CLEAN HUB

                  </div>

                </div>


              </div>

            </div>


            {/* DOWNLOAD */}

            <div className="flex justify-center py-3">

              <button
                onClick={() =>
                  alert(
                    "Certificate download system will be added later.",
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#176b45] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#125a39]"
              >

                <Download size={15} />

                Download Certificate

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}


export default Certificate