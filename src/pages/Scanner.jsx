import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ImagePlus,
  RefreshCw,
  ScanLine,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { Link } from "react-router-dom"
import { classifyWaste } from "../services/aiService"
import useAuth from "../hooks/useAuth"

function Scanner() {
  const { user } = useAuth()

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [mode, setMode] = useState("start")
  const [image, setImage] = useState(null)
  const [error, setError] = useState("")
  const [cameraLoading, setCameraLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (image?.url) {
        URL.revokeObjectURL(image.url)
      }
    }
  }, [image])

  const setSelectedImage = (file) => {
    if (!file) return

    setError("")
    setResult(null)

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10 MB.")
      return
    }

    const imageUrl = URL.createObjectURL(file)

    setImage({
      file,
      url: imageUrl,
      name: file.name,
    })

    stopCamera()
    setMode("preview")
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]

    if (file) {
      setSelectedImage(file)
    }

    event.target.value = ""
  }

  const openUpload = () => {
    setError("")
    fileInputRef.current?.click()
  }

  const startCamera = async () => {
    setError("")
    setCameraLoading(true)
    setResult(null)

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Camera is not supported by this browser. Please use image upload."
        )
        setCameraLoading(false)
        return
      }

      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      setMode("camera")

      requestAnimationFrame(async () => {
        const video = videoRef.current

        if (!video || !streamRef.current) {
          return
        }

        video.srcObject = streamRef.current

        try {
          await video.play()
        } catch (playError) {
          console.error("Camera playback error:", playError)
          setError("Unable to start camera preview. Please try again.")
        }
      })
    } catch (cameraError) {
      console.error(cameraError)

      setError(
        "Camera permission was denied or the camera is unavailable. You can upload an image instead."
      )

      stopCamera()
      setMode("start")
    } finally {
      setCameraLoading(false)
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is not ready yet. Please wait a moment.")
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext("2d")

    if (!context) {
      setError("Unable to capture the image. Please try again.")
      return
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Unable to create the captured image.")
          return
        }

        const file = new File(
          [blob],
          `eco-scan-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        )

        setSelectedImage(file)
      },
      "image/jpeg",
      0.9
    )
  }

  const cancelCamera = () => {
    stopCamera()
    setMode("start")
    setError("")
  }

  const changeImage = () => {
    setError("")
    setResult(null)
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    if (image?.url) {
      URL.revokeObjectURL(image.url)
    }

    stopCamera()

    setImage(null)
    setResult(null)
    setAnalyzing(false)
    setMode("start")
    setError("")
  }

  const retakePhoto = () => {
    if (image?.url) {
      URL.revokeObjectURL(image.url)
    }

    setImage(null)
    setResult(null)
    setError("")
    startCamera()
  }

  const saveScanActivity = (classification) => {
    if (!user?.uid || !classification) {
      return
    }

    try {
      const activityKey = `eco_clean_hub_activity_${user.uid}`

      const storedActivities = JSON.parse(
        localStorage.getItem(activityKey) || "[]"
      )

      const existingActivities = Array.isArray(storedActivities)
        ? storedActivities
        : []

      const newActivity = {
        id: `scan_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        userId: user.uid,
        title: `${classification.category} waste scanned`,
        category: classification.category,
        type: classification.type,
        confidence: Number(classification.confidence) || 0,
        guidance: Array.isArray(classification.guidance)
          ? classification.guidance
          : [],
        status: "Scanned",

        // No fake impact values.
        // These will be updated later when verification/reward
        // actually records real environmental impact.
        credits: 0,
        weightKg: 0,
        recycledKg: 0,
        co2Kg: 0,
        waterLiters: 0,
        treesEquivalent: 0,

        createdAt: new Date().toISOString(),
      }

      const updatedActivities = [
        newActivity,
        ...existingActivities,
      ]

      localStorage.setItem(
        activityKey,
        JSON.stringify(updatedActivities)
      )

      window.dispatchEvent(
        new Event("eco-clean-hub-activity-updated")
      )
    } catch (storageError) {
      console.error("Failed to save scan activity:", storageError)
    }
  }

  const analyzeWaste = async () => {
    if (!image?.file || analyzing) return

    setError("")
    setAnalyzing(true)
    setResult(null)

    try {
      const classification = await classifyWaste(image.file)

      setResult(classification)

      saveScanActivity(classification)
    } catch (analysisError) {
      console.error(analysisError)
      setError("Unable to analyze this image. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6faf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Top navigation */}
        <header className="mb-6 flex items-center justify-between gap-4">
   <Link
  to="/dashboard"
  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-[#0b8f4d]"
>
  <ArrowLeft size={18} />
  Back to Dashboard
</Link>

          <div className="flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-bold text-[#0b8f4d] shadow-sm">
            <Sparkles size={16} />
            AI Waste Scanner
          </div>
        </header>

        {/* Main scanner */}
        <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-xl">

          {/* Header */}
          <div className="border-b border-slate-100 px-6 py-7 sm:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0b8f4d]">
                  <ScanLine size={15} />
                  Smart Waste Identification
                </div>

                <h1 className="mt-3 text-3xl font-black tracking-tight text-[#102119] sm:text-4xl">
                  Scan your waste
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Capture a photo or upload an image of your waste item.
                  We&apos;ll prepare it for AI classification.
                </p>
              </div>

              <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
                <CheckCircle2 size={15} className="text-[#0b8f4d]" />
                Camera ready
              </div>

            </div>
          </div>

          <div className="p-6 sm:p-10">

            {/* Hidden upload input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Hidden canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* START SCREEN */}
            {mode === "start" && (
              <div className="grid gap-5 lg:grid-cols-2">

                {/* Camera option */}
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={cameraLoading}
                  className="group relative overflow-hidden rounded-3xl border border-green-100 bg-[#10251a] p-7 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 sm:p-9"
                >
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-green-400/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-400/15 text-green-300">
                      {cameraLoading ? (
                        <RefreshCw
                          size={27}
                          className="animate-spin"
                        />
                      ) : (
                        <Camera size={27} />
                      )}
                    </div>

                    <h2 className="mt-6 text-xl font-bold text-white">
                      {cameraLoading
                        ? "Opening camera..."
                        : "Use Camera"}
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-green-100/70">
                      Take a fresh photo of the waste item using your
                      device camera.
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-400 px-4 py-2.5 text-sm font-bold text-[#10251a] transition group-hover:bg-green-300">
                      <Camera size={17} />
                      Open Camera
                    </div>
                  </div>
                </button>

                {/* Upload option */}
                <button
                  type="button"
                  onClick={openUpload}
                  className="group rounded-3xl border-2 border-dashed border-green-200 bg-[#f7fcf8] p-7 text-left transition hover:-translate-y-1 hover:border-green-300 hover:bg-green-50 sm:p-9"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-[#0b8f4d]">
                    <ImagePlus size={27} />
                  </div>

                  <h2 className="mt-6 text-xl font-bold text-[#14231a]">
                    Upload Image
                  </h2>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Choose a clear JPG, PNG or WebP image from your
                    device.
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b8f4d] px-4 py-2.5 text-sm font-bold text-white transition group-hover:bg-[#087b42]">
                    <Upload size={17} />
                    Choose Image
                  </div>
                </button>

              </div>
            )}

            {/* CAMERA SCREEN */}
            {mode === "camera" && (
              <div>

                <div className="relative overflow-hidden rounded-[2rem] bg-[#08160d] shadow-2xl">

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="aspect-[4/3] w-full object-cover sm:aspect-video"
                  />

                  <div className="pointer-events-none absolute inset-0">

                    <div className="absolute inset-x-6 top-6 flex items-center justify-between">
                      <div className="rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                        LIVE CAMERA
                      </div>

                      <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                        Ready
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative h-56 w-56 sm:h-64 sm:w-64">

                        <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-green-300" />
                        <div className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-green-300" />
                        <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-green-300" />
                        <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-green-300" />

                        <div className="absolute left-3 right-3 top-1/2 h-px bg-green-300/80 shadow-[0_0_14px_rgba(134,239,172,1)]" />
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 text-center text-xs font-medium text-white/80">
                      Keep one waste item inside the frame
                    </div>

                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">

                  <button
                    type="button"
                    onClick={cancelCamera}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <X size={18} />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b8f4d] px-8 py-4 font-bold text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-[#087b42]"
                  >
                    <Camera size={20} />
                    Capture Photo
                  </button>

                  <button
                    type="button"
                    onClick={openUpload}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-5 py-3 font-semibold text-[#0b8f4d] transition hover:bg-green-50"
                  >
                    <Upload size={18} />
                    Upload Instead
                  </button>

                </div>

              </div>
            )}

            {/* PREVIEW SCREEN */}
            {mode === "preview" && image && (
              <div>

                <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100">

                  <img
                    src={image.url}
                    alt="Selected waste item"
                    className="mx-auto max-h-[560px] w-full object-contain"
                  />

                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                    <CheckCircle2
                      size={15}
                      className="text-green-400"
                    />
                    Image captured
                  </div>

                </div>

                {/* Image details */}
                <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Selected image
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-[#14231a]">
                      {image.name}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#0b8f4d]">
                    <CheckCircle2 size={16} />
                    Ready for analysis
                  </div>

                </div>

                {/* Image actions */}
                {!result && !analyzing && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">

                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-5 py-3.5 font-semibold text-[#0b8f4d] transition hover:bg-green-50"
                    >
                      <Camera size={18} />
                      Retake
                    </button>

                    <button
                      type="button"
                      onClick={changeImage}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <RefreshCw size={18} />
                      Change Image
                    </button>

                    <button
                      type="button"
                      onClick={removeImage}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3.5 font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>

                  </div>
                )}

                {/* AI Analysis */}
                <div className="mt-6 rounded-2xl border border-green-100 bg-[#f7fcf8] p-5">

                  {/* Ready to analyze */}
                  {!result && !analyzing && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#0b8f4d]">
                          <Sparkles size={19} />
                        </div>

                        <div>
                          <h3 className="font-bold text-[#14231a]">
                            Ready for AI analysis
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Analyze this image to identify the waste type
                            and get disposal guidance.
                          </p>
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={analyzeWaste}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3 font-bold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#087b42]"
                      >
                        <Sparkles size={17} />
                        Analyze Waste
                      </button>

                    </div>
                  )}

                  {/* Analyzing */}
                  {analyzing && (
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#0b8f4d]">
                        <RefreshCw
                          size={19}
                          className="animate-spin"
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-[#14231a]">
                          Analyzing your waste...
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Please wait while Eco Clean Hub processes the
                          image.
                        </p>
                      </div>

                    </div>
                  )}

                  {/* Classification result */}
                  {result && !analyzing && (
                    <div>

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#0b8f4d]">
                          <CheckCircle2 size={19} />
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#0b8f4d]">
                            Classification complete
                          </p>

                          <h3 className="mt-1 text-2xl font-black text-[#14231a]">
                            {result.category}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {result.type}
                          </p>
                        </div>

                      </div>

                      {/* Confidence */}
                      <div className="mt-5 rounded-2xl bg-white p-4">

                        <div className="flex items-center justify-between">

                          <span className="text-sm font-semibold text-slate-600">
                            Confidence
                          </span>

                          <span className="text-lg font-black text-[#0b8f4d]">
                            {result.confidence}%
                          </span>

                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-green-100">
                          <div
                            className="h-full rounded-full bg-[#0b8f4d] transition-all duration-700"
                            style={{
                              width: `${result.confidence}%`,
                            }}
                          />
                        </div>

                      </div>

                      {/* Disposal guidance */}
                      <div className="mt-4 rounded-2xl border border-green-100 bg-white p-4">

                        <h4 className="font-bold text-[#14231a]">
                          Disposal guidance
                        </h4>

                        <ul className="mt-3 space-y-2">

                          {result.guidance.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm leading-6 text-slate-600"
                            >
                              <CheckCircle2
                                size={16}
                                className="mt-1 shrink-0 text-[#0b8f4d]"
                              />

                              <span>{item}</span>
                            </li>
                          ))}

                        </ul>

                      </div>

                      {/* Next actions */}
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">

                        <button
                          type="button"
                          onClick={removeImage}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3.5 font-bold text-white transition hover:bg-[#087b42]"
                        >
                          <Camera size={18} />
                          Scan Another Item
                        </button>

                        <button
                          type="button"
                          onClick={analyzeWaste}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-5 py-3.5 font-semibold text-[#0b8f4d] transition hover:bg-green-50"
                        >
                          <RefreshCw size={18} />
                          Analyze Again
                        </button>

                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">

                <X size={18} className="mt-0.5 shrink-0" />

                <div>
                  <p className="font-bold">
                    Scanner issue
                  </p>

                  <p className="mt-1 leading-6">
                    {error}
                  </p>
                </div>

              </div>
            )}

          </div>
        </section>

        {/* Tips */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
            <div className="text-lg">💡</div>

            <p className="mt-2 text-sm font-bold text-[#14231a]">
              Good lighting
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Avoid very dark or overexposed photos.
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
            <div className="text-lg">📦</div>

            <p className="mt-2 text-sm font-bold text-[#14231a]">
              One item
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Keep one waste item clearly visible.
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
            <div className="text-lg">📱</div>

            <p className="mt-2 text-sm font-bold text-[#14231a]">
              Keep it steady
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              A sharp image helps classification.
            </p>
          </div>

        </div>

      </div>
    </main>
  )
}

export default Scanner