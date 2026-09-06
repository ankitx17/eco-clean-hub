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

import {
  useLocation,
  useNavigate,
} from "react-router-dom"

import {
  useEffect,
  useState,
} from "react"

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"

import {
  verifyCleanupPhotos,
} from "../services/cleanupVerificationService"

import {
  uploadImageToCloudinary,
} from "../services/cloudinaryService"

import useAuth from "../hooks/useAuth"

import { db } from "../services/firebase"


function SubmitCleanup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const mode =
    location.state?.mode || "SOLO"

  const terrain =
    location.state?.terrain || "Other"

  const [bags, setBags] = useState("")
  const [wasteKg, setWasteKg] = useState("")
  const [description, setDescription] = useState("")

  const [currentLocation, setCurrentLocation] =
    useState("")

  const [savedManualLocation, setSavedManualLocation] =
    useState("")

  const [isGettingLocation, setIsGettingLocation] =
    useState(false)

  const [beforePhoto, setBeforePhoto] =
    useState(null)

  const [afterPhoto, setAfterPhoto] =
    useState(null)

  const [actionPhoto, setActionPhoto] =
    useState(null)

  const [verificationStatus, setVerificationStatus] =
    useState("idle")

  const [verificationScore, setVerificationScore] =
    useState(null)

  const [verificationReason, setVerificationReason] =
    useState("")

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [submitted, setSubmitted] =
    useState(false)

  const [submissionId, setSubmissionId] =
    useState("")


  // =====================================================
  // LOAD SAVED LOCATION
  // =====================================================

  useEffect(() => {
    const savedLocation =
      localStorage.getItem("cleanupLocation")

    if (savedLocation) {
      setSavedManualLocation(savedLocation)
    }
  }, [])


  // =====================================================
  // RESET AI VERIFICATION
  // =====================================================

  const resetVerification = () => {
    setVerificationStatus("idle")
    setVerificationScore(null)
    setVerificationReason("")
  }


  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (
    event,
    setter
  ) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please upload a valid image file."
      )

      event.target.value = ""

      return
    }

    const maxSize =
      5 * 1024 * 1024

    if (file.size > maxSize) {
      alert(
        "Image size should be less than 5MB."
      )

      event.target.value = ""

      return
    }

    const previewUrl =
      URL.createObjectURL(file)

    setter({
      file,
      preview: previewUrl,
    })

    // Changing a photo invalidates
    // previous AI verification.
    resetVerification()

    event.target.value = ""
  }


  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (
    image,
    setter
  ) => {
    if (image?.preview) {
      URL.revokeObjectURL(
        image.preview
      )
    }

    setter(null)

    resetVerification()
  }


  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Location is not supported by your browser."
      )

      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude

        const longitude =
          position.coords.longitude

        try {
          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`
            )

          if (!response.ok) {
            throw new Error(
              "Unable to find location name."
            )
          }

          const data =
            await response.json()

          const address =
            data.address || {}

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
            throw new Error(
              "Location name not found."
            )
          }

          setCurrentLocation(
            locationName
          )

          localStorage.setItem(
            "cleanupLocation",
            locationName
          )
        } catch (error) {
          console.error(
            "Location name error:",
            error
          )

          const fallbackLocation =
            `${latitude.toFixed(
              6
            )}, ${longitude.toFixed(6)}`

          setCurrentLocation(
            fallbackLocation
          )

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
        console.error(
          "Geolocation error:",
          error
        )

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


  // =====================================================
  // AI VERIFICATION
  // =====================================================

  const handleVerify = async () => {
    if (
      !beforePhoto ||
      !afterPhoto ||
      !actionPhoto
    ) {
      alert(
        "Please upload Before, After and Action photos first."
      )

      return
    }

    setVerificationStatus(
      "checking"
    )

    setVerificationScore(null)
    setVerificationReason("")

    try {
      const result =
        await verifyCleanupPhotos({
          beforePhoto:
            beforePhoto.file,

          afterPhoto:
            afterPhoto.file,

          actionPhoto:
            actionPhoto.file,
        })

      if (!result.verified) {
        setVerificationStatus(
          "idle"
        )

        setVerificationScore(null)

        setVerificationReason(
          result.reason || ""
        )

        alert(
          result.reason ||
            "The AI could not verify this cleanup submission. Please check your photos and try again."
        )

        return
      }

      setVerificationScore(
        result.score
      )

      setVerificationStatus(
        "verified"
      )
    } catch (error) {
      console.error(
        "Cleanup verification failed:",
        error
      )

      setVerificationStatus(
        "idle"
      )

      setVerificationScore(null)

      setVerificationReason("")

      alert(
        error.message ||
          "Unable to verify cleanup photos. Please try again."
      )
    }
  }


  // =====================================================
  // SUBMIT TO CLOUDINARY + FIRESTORE
  // =====================================================

  const handleSubmit = async () => {
    if (!user?.uid) {
      alert(
        "Please login before submitting a cleanup."
      )

      return
    }

    if (
      !wasteKg ||
      Number(wasteKg) <= 0
    ) {
      alert(
        "Please enter the waste weight in kg."
      )

      return
    }

    if (
      !bags ||
      Number(bags) <= 0
    ) {
      alert(
        "Please enter the number of bags."
      )

      return
    }

    if (
      !beforePhoto ||
      !afterPhoto ||
      !actionPhoto
    ) {
      alert(
        "Please upload Before, After and Action photos."
      )

      return
    }

    if (
      verificationStatus !==
      "verified"
    ) {
      alert(
        "Please verify your cleanup photos first."
      )

      return
    }

    setIsSubmitting(true)

    try {
      const submittedWaste =
        Number(wasteKg)

      const finalLocation =
        currentLocation ||
        savedManualLocation ||
        "Location not provided"


      // =================================================
      // STEP 1: CREATE TEMPORARY SUBMISSION ID
      // =================================================
      //
      // We create a local unique ID first so that
      // Cloudinary uploads can be grouped logically.
      //

      const temporarySubmissionId =
        `${user.uid}-${Date.now()}`


      // =================================================
      // STEP 2: UPLOAD 3 PHOTOS TO CLOUDINARY
      // =================================================

      const [
        beforeUpload,
        afterUpload,
        actionUpload,
      ] = await Promise.all([
        uploadImageToCloudinary(
          beforePhoto.file
        ),

        uploadImageToCloudinary(
          afterPhoto.file
        ),

        uploadImageToCloudinary(
          actionPhoto.file
        ),
      ])


      // Make sure Cloudinary returned
      // valid URLs for all three images.

      if (
        !beforeUpload?.url ||
        !afterUpload?.url ||
        !actionUpload?.url
      ) {
        throw new Error(
          "One or more cleanup photos could not be uploaded to Cloudinary."
        )
      }


      // =================================================
      // STEP 3: CREATE FIRESTORE SUBMISSION
      // =================================================
      //
      // AI verification is NOT admin approval.
      //
      // Submission starts as PENDING.
      //
      // No credits are awarded here.
      //

      const submissionData = {
        userId: user.uid,

        userName:
          user.displayName ||
          "Citizen",

        userEmail:
          user.email || "",

        mode,

        terrain,

        bags:
          Number(bags),

        wasteKg:
          submittedWaste,

        description:
          description.trim(),

        location:
          finalLocation,

        verificationScore:
          Number(
            verificationScore
          ) || 0,

        aiVerified: true,

        aiResult:
          "AI verification successful",

        status:
          "pending",


        // ===============================================
        // CLOUDINARY IMAGE URLS
        // ===============================================

        beforeImageUrl:
          beforeUpload.url,

        afterImageUrl:
          afterUpload.url,

        actionImageUrl:
          actionUpload.url,


        // ===============================================
        // CLOUDINARY PUBLIC IDS
        // ===============================================

        beforeImagePublicId:
          beforeUpload.publicId ||
          "",

        afterImagePublicId:
          afterUpload.publicId ||
          "",

        actionImagePublicId:
          actionUpload.publicId ||
          "",


        // ===============================================
        // ORIGINAL PHOTO INFORMATION
        // ===============================================

        beforePhotoName:
          beforePhoto.file?.name ||
          "",

        afterPhotoName:
          afterPhoto.file?.name ||
          "",

        actionPhotoName:
          actionPhoto.file?.name ||
          "",

        beforePhotoType:
          beforePhoto.file?.type ||
          "",

        afterPhotoType:
          afterPhoto.file?.type ||
          "",

        actionPhotoType:
          actionPhoto.file?.type ||
          "",


        // ===============================================
        // TEMPORARY CLIENT REFERENCE
        // ===============================================

        clientSubmissionId:
          temporarySubmissionId,


        // ===============================================
        // ADMIN REVIEW FIELDS
        // ===============================================

        reviewedBy:
          null,

        reviewedAt:
          null,

        verifiedAt:
          null,

        rejectionReason:
          "",


        // ===============================================
        // FIRESTORE TIMESTAMP
        // ===============================================

        submittedAt:
          serverTimestamp(),
      }


      const documentReference =
        await addDoc(
          collection(
            db,
            "cleanupSubmissions"
          ),
          submissionData
        )


      // Save actual Firestore ID
      // for the success screen.

      setSubmissionId(
        documentReference.id
      )


      // ===============================================
      // IMPORTANT
      // ===============================================
      //
      // DO NOT award credits here.
      //
      // Credits should only be added
      // after admin approval.
      //
      // DO NOT update:
      // - verifiedActions
      // - wasteRecycled
      // - verified activity
      //
      // from this citizen submission.
      //
      // ===============================================

      setSubmitted(true)
    } catch (error) {
      console.error(
        "Cleanup submission failed:",
        error
      )

      alert(
        error.message ||
          "Unable to submit cleanup. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }


  // =====================================================
  // SUCCESS SCREEN
  // =====================================================

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f6faf7] px-4 py-10 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl">

          <section className="rounded-[2rem] border border-green-100 bg-white p-8 text-center shadow-xl sm:p-12">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#176b45]">
              <CheckCircle2
                size={42}
              />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#176b45]">
              Eco Clean Hub
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-800">
              Cleanup Submitted
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
              Your cleanup has been submitted
              successfully and is now waiting for
              admin verification.
            </p>

            <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-[#edf8f1] p-6">

              <p className="text-sm font-semibold text-slate-500">
                Verification Status
              </p>

              <p className="mt-2 text-2xl font-black text-[#176b45]">
                Pending Review
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                AI verification passed. Eco-Credits
                will be added only after an admin
                approves your submission.
              </p>

            </div>

            {submissionId && (
              <div className="mx-auto mt-5 max-w-sm rounded-xl bg-slate-50 px-4 py-3">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Submission ID
                </p>

                <p className="mt-1 break-all text-xs font-semibold text-slate-600">
                  {submissionId}
                </p>

              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#125637]"
              >
                <ArrowLeft
                  size={17}
                />

                Back to Dashboard
              </button>


              <button
                type="button"
                onClick={() =>
                  navigate("/activity")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#176b45] bg-white px-5 py-3 text-sm font-bold text-[#176b45] transition hover:bg-[#edf8f1]"
              >
                View Activity
              </button>

            </div>

          </section>

        </div>

      </main>
    )
  }


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f6faf7] px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-[#0b8f4d]"
            >
              <ArrowLeft
                size={18}
              />

              Back
            </button>


            <div className="mt-5 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-[#0b8f4d]">
                <Sparkles
                  size={24}
                />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b8f4d]">
                  Eco Clean Hub
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-[#102119]">
                  Submit Cleanup
                </h1>

              </div>

            </div>

          </div>


          <div className="inline-flex items-center gap-2 self-start rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-bold text-[#0b8f4d] shadow-sm sm:self-auto">

            <ShieldCheck
              size={16}
            />

            AI Verified Proof

          </div>

        </header>


        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">

          {/* =================================================
              LEFT COLUMN
              ================================================= */}

          <div className="space-y-5">

            {/* CLEANUP DETAILS */}

            <section className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                  <Weight
                    size={20}
                  />
                </div>

                <div>

                  <h2 className="font-bold">
                    Cleanup Details
                  </h2>

                  <p className="text-xs text-slate-400">
                    Tell us about your cleanup
                  </p>

                </div>

              </div>


              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Number of Bags
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={bags}
                    onChange={(event) =>
                      setBags(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 3"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-green-100"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Waste Weight (kg)
                  </label>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={wasteKg}
                    onChange={(event) =>
                      setWasteKg(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 4.5"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-green-100"
                  />

                </div>

              </div>


              <div className="mt-4">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe what you cleaned..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-green-100"
                />

              </div>

            </section>


            {/* LOCATION */}

            <section className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                  <MapPin
                    size={20}
                  />
                </div>

                <div>

                  <h2 className="font-bold">
                    Cleanup Location
                  </h2>

                  <p className="text-xs text-slate-400">
                    Add the location of your cleanup
                  </p>

                </div>

              </div>


              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Current Location
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {currentLocation ||
                    savedManualLocation ||
                    "Location not selected"}
                </p>

              </div>


              <button
                type="button"
                onClick={
                  getCurrentLocation
                }
                disabled={
                  isGettingLocation
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#176b45] px-4 py-3 text-sm font-semibold text-[#176b45] transition hover:bg-[#edf8f1] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isGettingLocation ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation
                      size={17}
                    />

                    Use My Location
                  </>
                )}

              </button>

            </section>

          </div>


          {/* =================================================
              RIGHT COLUMN
              ================================================= */}

          <div className="space-y-5">

            {/* PHOTOS */}

            <section className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                  <Camera
                    size={20}
                  />
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
                  image={
                    beforePhoto
                  }
                  onChange={(
                    event
                  ) =>
                    handleImageChange(
                      event,
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
                  image={
                    afterPhoto
                  }
                  onChange={(
                    event
                  ) =>
                    handleImageChange(
                      event,
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
                  image={
                    actionPhoto
                  }
                  onChange={(
                    event
                  ) =>
                    handleImageChange(
                      event,
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


            {/* AI VERIFICATION */}

            <section className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                    <ShieldCheck
                      size={20}
                    />
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


                {verificationStatus ===
                  "verified" && (
                  <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    AI Verified
                  </div>
                )}

              </div>


              {/* IDLE */}

              {verificationStatus ===
                "idle" && (
                <div className="mt-4">

                  <p className="mb-4 text-sm leading-6 text-slate-500">
                    AI will compare your Before,
                    After and Action photos to
                    check whether the cleanup
                    activity appears genuine.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleVerify
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#176b45] px-4 py-3 text-sm font-semibold text-[#176b45] transition hover:bg-[#edf8f1]"
                  >

                    <ShieldCheck
                      size={17}
                    />

                    Verify Photos

                  </button>

                </div>
              )}


              {/* CHECKING */}

              {verificationStatus ===
                "checking" && (
                <div className="mt-4 rounded-xl bg-[#edf8f1] p-4">

                  <div className="flex items-center gap-3">

                    <Loader2
                      size={20}
                      className="animate-spin text-[#176b45]"
                    />

                    <div>

                      <p className="text-sm font-semibold text-[#176b45]">
                        AI is checking your photos...
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Comparing Before, After
                        and Action photos. Please
                        wait a moment.
                      </p>

                    </div>

                  </div>

                </div>
              )}


              {/* VERIFIED */}

              {verificationStatus ===
                "verified" && (
                <div className="mt-4 rounded-xl bg-green-50 p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-bold text-green-700">
                        AI verification passed
                      </p>

                      <p className="mt-1 text-xs text-green-600">
                        Your submission can now
                        be sent to the admin for
                        final verification.
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


            {/* REWARD */}

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
                    Eco-Credits after admin approval
                  </p>

                </div>


                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">

                  <Sparkles
                    size={26}
                  />

                </div>

              </div>


              <button
                type="button"
                onClick={
                  handleSubmit
                }
                disabled={
                  isSubmitting ||
                  verificationStatus !==
                    "verified"
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[#176b45] transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isSubmitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Uploading & Submitting...
                  </>
                ) : (
                  <>
                    <Send
                      size={18}
                    />

                    Submit for Verification
                  </>
                )}

              </button>

            </section>

          </div>

        </div>

      </div>

    </main>
  )
}


// =======================================================
// PHOTO UPLOAD COMPONENT
// =======================================================

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
            onClick={
              onRemove
            }
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition hover:text-red-600"
          >

            <X
              size={15}
            />

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
            onChange={
              onChange
            }
            className="hidden"
          />

        </label>

      )}

    </div>
  )
}


export default SubmitCleanup