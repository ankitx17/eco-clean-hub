import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  Navigation,
  Send,
  ShieldCheck,
  Sparkles,
  Weight,
  X,
} from "lucide-react"

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

function SubmitCleanup() {
  const navigate = useNavigate()
  const location = useLocation()

  const mode = location.state?.mode || "SOLO"
  const terrain = location.state?.terrain || "Other"

  const [bags, setBags] = useState("")
  const [wasteKg, setWasteKg] = useState("")
  const [description, setDescription] = useState("")

  const [currentLocation, setCurrentLocation] = useState("")
  const [savedManualLocation, setSavedManualLocation] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const [beforePhoto, setBeforePhoto] = useState(null)
  const [afterPhoto, setAfterPhoto] = useState(null)
  const [actionPhoto, setActionPhoto] = useState(null)

  const [verificationStatus, setVerificationStatus] = useState("idle")
  const [verificationScore, setVerificationScore] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // --------------------------------------------------
  // LOAD SAVED LOCATION
  // --------------------------------------------------

  useEffect(() => {
    const savedLocation = localStorage.getItem("cleanupLocation")

    if (savedLocation) {
      setSavedManualLocation(savedLocation)
    }
  }, [])

  // --------------------------------------------------
  // IMAGE HANDLER
  // --------------------------------------------------

  const handleImageChange = (event, setter) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.")
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      alert("Image size should be less than 5MB.")
      return
    }

    const previewUrl = URL.createObjectURL(file)

    setter({
      file,
      preview: previewUrl,
    })
  }

  const removeImage = (image, setter) => {
    if (image?.preview) {
      URL.revokeObjectURL(image.preview)
    }

    setter(null)
  }

  // --------------------------------------------------
  // GET LOCATION NAME
  // --------------------------------------------------

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Location is not supported by your browser.")
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`
          )

          if (!response.ok) {
            throw new Error("Unable to find location name.")
          }

          const data = await response.json()
          const address = data.address || {}

          const locationParts = [
            address.road,
            address.neighbourhood,
            address.suburb,
            address.city ||
              address.town ||
              address.village ||
              address.municipality,
            address.state,
            address.country,
          ].filter(Boolean)

          const locationName =
            locationParts.length > 0
              ? locationParts.join(", ")
              : data.display_name

          if (!locationName) {
            throw new Error("Location name not found.")
          }

          setCurrentLocation(locationName)

          localStorage.setItem(
            "cleanupLocation",
            locationName
          )
        } catch (error) {
          console.error("Location name error:", error)

          // Fallback to coordinates if location name fails
          const fallbackLocation = `${latitude.toFixed(
            6
          )}, ${longitude.toFixed(6)}`

          setCurrentLocation(fallbackLocation)

          localStorage.setItem(
            "cleanupLocation",
            fallbackLocation
          )

          alert(
            "Location name could not be found. Your coordinates have been saved instead."
          )
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)

        setIsGettingLocation(false)

        if (error.code === 1) {
          alert(
            "Location permission was denied. Please allow location access from your browser."
          )
        } else {
          alert(
            "Unable to get your location. Please try again."
          )
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // --------------------------------------------------
  // DEMO AI VERIFICATION
  // --------------------------------------------------

  const handleVerify = () => {
    if (!beforePhoto || !afterPhoto || !actionPhoto) {
      alert(
        "Please upload Before, After and Action photos first."
      )
      return
    }

    setVerificationStatus("checking")
    setVerificationScore(null)

    // Prototype AI verification
    setTimeout(() => {
      setVerificationStatus("verified")
      setVerificationScore(92)
    }, 2000)
  }

  // --------------------------------------------------
  // SUBMIT CLEANUP
  // --------------------------------------------------

  const handleSubmit = () => {
    if (!wasteKg || Number(wasteKg) <= 0) {
      alert("Please enter the waste weight in kg.")
      return
    }

    if (!bags || Number(bags) <= 0) {
      alert("Please enter the number of bags.")
      return
    }

    if (!beforePhoto || !afterPhoto || !actionPhoto) {
      alert(
        "Please upload Before, After and Action photos."
      )
      return
    }

    if (verificationStatus !== "verified") {
      alert("Please verify your cleanup photos first.")
      return
    }

    setIsSubmitting(true)

    // Small delay for prototype submit experience
    setTimeout(() => {
      // ---------------------------------------------
      // ECO CREDITS
      // ---------------------------------------------

      const currentCredits =
        Number(localStorage.getItem("ecoCredits")) || 0

      const newCredits = currentCredits + 10

      localStorage.setItem(
        "ecoCredits",
        newCredits.toString()
      )

      // ---------------------------------------------
      // WASTE RECYCLED
      // ---------------------------------------------

      const currentWaste =
        Number(localStorage.getItem("wasteRecycled")) || 0

      const submittedWaste = Number(wasteKg)

      const newWaste =
        currentWaste + submittedWaste

      localStorage.setItem(
        "wasteRecycled",
        newWaste.toString()
      )

      // ---------------------------------------------
      // VERIFIED ACTIONS
      // ---------------------------------------------

      const currentActions =
        Number(localStorage.getItem("verifiedActions")) || 0

      const newActions = currentActions + 1

      localStorage.setItem(
        "verifiedActions",
        newActions.toString()
      )

      // ---------------------------------------------
      // SAVE MISSION DATA
      // ---------------------------------------------

      const finalLocation =
        currentLocation ||
        savedManualLocation ||
        "Location not provided"

      const submissionData = {
        mode,
        terrain,
        bags: Number(bags),
        wasteKg: submittedWaste,
        description,
        location: finalLocation,
        verificationScore,
        reward: 10,
        submittedAt: new Date().toISOString(),
      }

      localStorage.setItem(
        "lastCleanupSubmission",
        JSON.stringify(submissionData)
      )

      localStorage.setItem(
        "missionSubmitted",
        "true"
      )

      // ---------------------------------------------
      // SAVE ACTIVITY
      // ---------------------------------------------

      const existingActivities = JSON.parse(
        localStorage.getItem("cleanupActivities") || "[]"
      )

      existingActivities.unshift({
        title: "Cleanup mission completed",
        date: new Date().toLocaleString(),
        credits: "+10",
        wasteKg: submittedWaste,
        status: "Verified",
        mode,
        terrain,
        location: finalLocation,
      })

      localStorage.setItem(
        "cleanupActivities",
        JSON.stringify(existingActivities)
      )

      setIsSubmitting(false)
      setSubmitted(true)
    }, 800)
  }

  // --------------------------------------------------
  // SUCCESS SCREEN
  // --------------------------------------------------

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6faf7] px-4 py-10 text-[#14231a]">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-[#dfeae3] bg-white p-8 text-center shadow-lg sm:p-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#176b45]">
              <CheckCircle2 size={42} />
            </div>

            <h1 className="mt-6 text-3xl font-bold">
              Mission Submitted!
            </h1>

            <p className="mt-3 text-slate-500">
              Your cleanup activity has been successfully
              verified and submitted.
            </p>

            <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-[#edf8f1] p-5">

              <p className="text-sm font-medium text-slate-500">
                Eco-Credits Earned
              </p>

              <p className="mt-1 text-4xl font-bold text-[#176b45]">
                +10
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Waste recycled:{" "}
                {Number(wasteKg).toFixed(1)} kg
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Location:{" "}
                {currentLocation ||
                  savedManualLocation ||
                  "Location not provided"}
              </p>

            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 font-semibold text-white transition hover:bg-[#125a39]"
            >
              Go to Dashboard

              <ArrowLeft
                size={18}
                className="rotate-180"
              />
            </button>

          </div>
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#14231a]">

      {/* HEADER */}

      <header className="border-b border-[#dfeae3] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#176b45]"
          >
            <ArrowLeft size={18} />
            Back
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

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">

        {/* TITLE */}

        <div className="mb-6">

          <div className="flex flex-wrap items-center gap-2">

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-[#176b45]">
              {mode}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {terrain}
            </span>

          </div>

          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Submit Cleanup Mission
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add your cleanup details and verify your activity.
          </p>

        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">

          {/* LEFT SIDE */}

          <div className="space-y-5">

            {/* MISSION DETAILS */}

            <section className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                  <Weight size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Cleanup Details
                  </h2>

                  <p className="text-xs text-slate-400">
                    Tell us what you collected
                  </p>
                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* WASTE KG */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Waste Weight
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={wasteKg}
                      onChange={(e) =>
                        setWasteKg(e.target.value)
                      }
                      placeholder="e.g. 2.5"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-green-100"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      kg
                    </span>

                  </div>

                </div>

                {/* BAGS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Number of Bags
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={bags}
                    onChange={(e) =>
                      setBags(e.target.value)
                    }
                    placeholder="e.g. 3"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-green-100"
                  />

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="mt-4">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={3}
                  placeholder="Briefly describe your cleanup activity..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-green-100"
                />

              </div>

            </section>

            {/* LOCATION */}

            <section className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Cleanup Location
                  </h2>

                  <p className="text-xs text-slate-400">
                    Add where the cleanup happened
                  </p>
                </div>

              </div>

              <div className="rounded-xl bg-slate-50 p-4">

                <div className="flex items-start gap-3">

                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-[#176b45]"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-medium text-slate-400">
                      Current location
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                      {currentLocation ||
                        savedManualLocation ||
                        "Location not selected"}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#176b45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#125a39] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Finding Location...
                    </>
                  ) : (
                    <>
                      <Navigation size={16} />
                      Use My Location
                    </>
                  )}
                </button>

              </div>

            </section>

          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-5">

            {/* PHOTOS */}

            <section className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                  <Camera size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Cleanup Photos
                  </h2>

                  <p className="text-xs text-slate-400">
                    Upload proof of your activity
                  </p>
                </div>

              </div>

              <div className="grid gap-3 sm:grid-cols-3">

                <PhotoUpload
                  title="Before"
                  image={beforePhoto}
                  onChange={(e) =>
                    handleImageChange(
                      e,
                      setBeforePhoto
                    )
                  }
                  onRemove={() =>
                    removeImage(
                      beforePhoto,
                      setBeforePhoto
                    )
                  }
                />

                <PhotoUpload
                  title="After"
                  image={afterPhoto}
                  onChange={(e) =>
                    handleImageChange(
                      e,
                      setAfterPhoto
                    )
                  }
                  onRemove={() =>
                    removeImage(
                      afterPhoto,
                      setAfterPhoto
                    )
                  }
                />

                <PhotoUpload
                  title="Action"
                  image={actionPhoto}
                  onChange={(e) =>
                    handleImageChange(
                      e,
                      setActionPhoto
                    )
                  }
                  onRemove={() =>
                    removeImage(
                      actionPhoto,
                      setActionPhoto
                    )
                  }
                />

              </div>

            </section>

            {/* VERIFICATION */}

            <section className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                    <ShieldCheck size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold">
                      AI Verification
                    </h2>

                    <p className="text-xs text-slate-400">
                      Check your uploaded proof
                    </p>
                  </div>

                </div>

                {verificationStatus === "verified" && (
                  <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Verified
                  </div>
                )}

              </div>

              {/* IDLE */}

              {verificationStatus === "idle" && (
                <div className="mt-4">

                  <p className="mb-4 text-sm leading-6 text-slate-500">
                    Our prototype verification will check
                    whether all three cleanup photos are
                    uploaded.
                  </p>

                  <button
                    type="button"
                    onClick={handleVerify}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#176b45] px-4 py-3 text-sm font-semibold text-[#176b45] transition hover:bg-[#edf8f1]"
                  >
                    <ShieldCheck size={17} />
                    Verify Photos
                  </button>

                </div>
              )}

              {/* CHECKING */}

              {verificationStatus === "checking" && (
                <div className="mt-4 rounded-xl bg-[#edf8f1] p-4">

                  <div className="flex items-center gap-3">

                    <Loader2
                      size={20}
                      className="animate-spin text-[#176b45]"
                    />

                    <div>

                      <p className="text-sm font-semibold text-[#176b45]">
                        Checking your photos...
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Please wait a moment.
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* VERIFIED */}

              {verificationStatus === "verified" && (
                <div className="mt-4 rounded-xl bg-green-50 p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-bold text-green-700">
                        Photos verified successfully
                      </p>

                      <p className="mt-1 text-xs text-green-600">
                        Your cleanup proof looks valid.
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-2xl font-bold text-[#176b45]">
                        {verificationScore}%
                      </p>

                      <p className="text-[10px] text-slate-400">
                        confidence
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </section>

            {/* REWARD + SUBMIT */}

            <section className="rounded-2xl bg-[#176b45] p-5 text-white shadow-lg">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-sm text-green-100">
                    Mission Reward
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    +10
                  </p>

                  <p className="mt-1 text-xs text-green-100">
                    Eco-Credits per verified submission
                  </p>

                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles size={26} />
                </div>

              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  verificationStatus !== "verified"
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[#176b45] transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Cleanup
                  </>
                )}
              </button>

            </section>

          </div>

        </div>

      </main>

    </div>
  )
}

// --------------------------------------------------
// PHOTO UPLOAD COMPONENT
// --------------------------------------------------

function PhotoUpload({
  title,
  image,
  onChange,
  onRemove,
}) {
  return (
    <div>

      <p className="mb-2 text-xs font-semibold text-slate-600">
        {title} Photo
      </p>

      {image ? (
        <div className="relative overflow-hidden rounded-xl border border-green-200 bg-green-50">

          <img
            src={image.preview}
            alt={`${title} cleanup`}
            className="h-32 w-full object-cover"
          />

          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition hover:text-red-600"
          >
            <X size={15} />
          </button>

          <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-green-700">
            Uploaded
          </div>

        </div>
      ) : (
        <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center transition hover:border-[#176b45] hover:bg-[#edf8f1]">

          <ImagePlus
            size={24}
            className="text-[#176b45]"
          />

          <span className="mt-2 text-xs font-semibold text-slate-600">
            Upload Photo
          </span>

          <span className="mt-1 text-[10px] text-slate-400">
            Max 5MB
          </span>

          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
          />

        </label>
      )}

    </div>
  )
}

export default SubmitCleanup