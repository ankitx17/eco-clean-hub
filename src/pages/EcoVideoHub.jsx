import { useMemo, useState } from "react"
import useAuth from "../hooks/useAuth"
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Filter,
  Link as LinkIcon,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  User,
  Video,
  X,
  Coins,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const STORAGE_KEY = "eco-clean-hub-eco-video-hub"

const categories = [
  "Cleanup",
  "Tree Plantation",
  "Recycling Drive",
  "Awareness",
]

const initialVideos = [
  {
    id: "eco-yt-001",
    creator: "Eco Community Creator",
    creatorInitials: "EC",
    realName: "Eco Community Creator",
    title: "Eco Action Community Video 1",
    description: "Community environmental activity shared through the Eco Clean Hub video feed.",
    url: "https://www.youtube.com/embed/FysNW1_i3lM",
    platform: "YouTube",
    category: "Cleanup",
    location: "Community",
    views: 12840,
    reward: 250,
    verified: true,
    trending: true,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail: "https://img.youtube.com/vi/FysNW1_i3lM/hqdefault.jpg",
  },
  {
    id: "eco-yt-002",
    creator: "Green Community Creator",
    creatorInitials: "GC",
    realName: "Green Community Creator",
    title: "Eco Action Community Video 2",
    description: "Environmental action video shared by the community.",
    url: "https://www.youtube.com/embed/zlC6BNWr-Co",
    platform: "YouTube",
    category: "Tree Plantation",
    location: "Community",
    views: 9340,
    reward: 400,
    verified: true,
    trending: true,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail: "https://img.youtube.com/vi/zlC6BNWr-Co/hqdefault.jpg",
  },
  {
    id: "eco-yt-003",
    creator: "Eco Action Creator",
    creatorInitials: "EA",
    realName: "Eco Action Creator",
    title: "Eco Action Community Video 3",
    description: "Environmental activity video shared through the community feed.",
    url: "https://www.youtube.com/embed/cV2gBU6hKfY",
    platform: "YouTube",
    category: "Recycling Drive",
    location: "Community",
    views: 6210,
    reward: 150,
    verified: true,
    trending: false,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail: "https://img.youtube.com/vi/cV2gBU6hKfY/hqdefault.jpg",
  },
  {
    id: "eco-yt-004",
    creator: "Green Action Creator",
    creatorInitials: "GA",
    realName: "Green Action Creator",
    title: "Eco Action Community Video 4",
    description: "Community environmental awareness video.",
    url: "https://www.youtube.com/embed/Ga_QcJqcGcc",
    platform: "YouTube",
    category: "Awareness",
    location: "Community",
    views: 4380,
    reward: 100,
    verified: true,
    trending: false,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail: "https://img.youtube.com/vi/Ga_QcJqcGcc/hqdefault.jpg",
  },
  {
    id: "eco-yt-005",
    creator: "Eco Community Team",
    creatorInitials: "ET",
    realName: "Eco Community Team",
    title: "Eco Action Community Video 5",
    description: "Environmental action shared by an Eco Clean Hub community creator.",
    url: "https://www.youtube.com/embed/eaJz6XUPVuc",
    platform: "YouTube",
    category: "Cleanup",
    location: "Community",
    views: 3150,
    reward: 0,
    verified: false,
    trending: false,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail: "https://img.youtube.com/vi/eaJz6XUPVuc/hqdefault.jpg",
  },
  {
    id: "eco-yt-006",
    creator: "Eco Impact Team",
    creatorInitials: "EI",
    realName: "Eco Impact Team",
    title: "Eco Action Community Video 6",
    description: "Environmental impact video shared through the community feed.",
    url: "https://www.youtube.com/embed/BkWMJkn1Q2E",
    platform: "YouTube",
    category: "Awareness",
    location: "Community",
    views: 2760,
    reward: 0,
    verified: false,
    trending: false,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail: "https://img.youtube.com/vi/BkWMJkn1Q2E/hqdefault.jpg",
  },
]

function loadSavedVideos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return initialVideos
    }

    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return initialVideos
    }

    return [
      ...parsed,
      ...initialVideos.filter(
        (video) => !parsed.some((item) => item.id === video.id)
      ),
    ]
  } catch {
    return initialVideos
  }
}

function saveVideos(videos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
  } catch {
    // Ignore restricted browser storage environments.
  }
}

function getPlatform(url) {
  const value = String(url || "").trim().toLowerCase()

  if (value.includes("youtube.com") || value.includes("youtu.be")) {
    return "YouTube"
  }

  if (value.includes("instagram.com")) {
    return "Instagram"
  }

  if (value.includes("facebook.com") || value.includes("fb.watch")) {
    return "Facebook"
  }

  return ""
}

function getYouTubeVideoId(url) {
  try {
    const parsed = new URL(String(url || "").trim())
    const hostname = parsed.hostname.toLowerCase()
    const parts = parsed.pathname.split("/").filter(Boolean)

    if (hostname === "youtu.be" || hostname.endsWith(".youtu.be")) {
      return parts[0] || ""
    }

    if (hostname.includes("youtube.com")) {
      const queryId = parsed.searchParams.get("v")

      if (queryId) {
        return queryId
      }

      if (
        (parts[0] === "shorts" ||
          parts[0] === "embed" ||
          parts[0] === "live") &&
        parts[1]
      ) {
        return parts[1]
      }
    }
  } catch {
    return ""
  }

  return ""
}

function getYouTubeThumbnail(url) {
  const videoId = getYouTubeVideoId(url)

  return videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : ""
}

function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url)

  return videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : ""
}

function formatNumber(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return "0"
  }

  return new Intl.NumberFormat("en-IN").format(number)
}

function getPlatformIcon(platform) {
  if (
    platform === "YouTube" ||
    platform === "Instagram" ||
    platform === "Facebook"
  ) {
    return <Video className="h-4 w-4" />
  }

  return <LinkIcon className="h-4 w-4" />
}

function getInitials(name) {
  return String(name || "EC")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function AppLogo() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner ring-1 ring-white/20">
      <span className="text-xl">🌿</span>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2 text-emerald-100">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-2xl font-bold text-white">
        {formatNumber(value)}
      </p>
    </div>
  )
}

function PlatformBadge({ platform }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {getPlatformIcon(platform)}
      {platform}
    </span>
  )
}

function VideoCard({ video, onWatch, onVerify, canVerify }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <button
          type="button"
          onClick={() => onWatch(video)}
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-emerald-700 shadow-xl transition hover:scale-110"
          aria-label={`Watch ${video.title}`}
        >
          <Play className="ml-0.5 h-6 w-6 fill-current" />
        </button>

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {video.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          )}

          {video.trending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending
            </span>
          )}
        </div>

        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {video.category}
        </span>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {video.creatorInitials || getInitials(video.creator)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {video.creator}
              </p>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(video.views)} views
              </div>
            </div>
          </div>

          <PlatformBadge platform={video.platform} />
        </div>

        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          {video.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {video.description}
        </p>

        {video.location && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {video.location}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600">
            <Coins className="h-4 w-4" />
            {formatNumber(video.reward)} ZenjiCoins
          </div>

          <div className="flex items-center gap-2">
            {!video.verified && canVerify && (
              <button
                type="button"
                onClick={() => onVerify(video)}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                Verify & Reward
              </button>
            )}

            <button
              type="button"
              onClick={() => onWatch(video)}
              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Watch
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function SubmissionModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    realName: "",
    contactNumber: "",
    email: "",
    title: "",
    url: "",
    category: "Cleanup",
    location: "",
    description: "",
    creditConfirmed: false,
  })

  const [error, setError] = useState("")

  const platform = getPlatform(form.url)
  const youtubeVideoId = getYouTubeVideoId(form.url)
  const youtubeThumbnail = getYouTubeThumbnail(form.url)

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setError("")
  }

  function handleSubmit(event) {
    event.preventDefault()

    const detectedPlatform = getPlatform(form.url)

    if (!form.realName.trim()) {
      setError("Real Name is required.")
      return
    }

    if (!form.contactNumber.trim()) {
      setError("Contact Number is required.")
      return
    }

    const contactDigits = form.contactNumber.replace(/[^\d]/g, "")

    if (contactDigits.length < 7) {
      setError("Please enter a valid Contact Number.")
      return
    }

    if (!form.email.trim()) {
      setError("Email Address is required.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid Email Address.")
      return
    }

    if (!form.title.trim()) {
      setError("Video Title is required.")
      return
    }

    if (form.title.trim().length < 5) {
      setError("Video Title should contain at least 5 characters.")
      return
    }

    if (!detectedPlatform) {
      setError(
        "Please enter a valid YouTube, Instagram, or Facebook video URL."
      )
      return
    }

    if (detectedPlatform === "YouTube" && !getYouTubeVideoId(form.url)) {
      setError("Please enter a valid YouTube video, Shorts, youtu.be, or embed URL.")
      return
    }

    if (!form.location.trim()) {
      setError("Location / City is required.")
      return
    }

    if (!form.description.trim()) {
      setError("Environmental activity description is required.")
      return
    }

    if (!form.creditConfirmed) {
      setError(
        "You must confirm the Eco Clean Hub / Zenji platform credit requirement."
      )
      return
    }

    onSubmit({
      ...form,
      realName: form.realName.trim(),
      creatorName: form.realName.trim(),
      contactNumber: form.contactNumber.trim(),
      email: form.email.trim().toLowerCase(),
      title: form.title.trim(),
      url: form.url.trim(),
      category: form.category,
      location: form.location.trim(),
      description: form.description.trim(),
      platform: detectedPlatform,
      creditConfirmed: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Submit Eco Video
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Share genuine environmental action and earn ZenjiCoins.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Submission Verification
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  Please provide accurate information. Your video may be
                  reviewed before ZenjiCoin rewards are approved.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Real Name *
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={form.realName}
                  onChange={(event) =>
                    updateField("realName", event.target.value)
                  }
                  placeholder="Your real name"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Contact Number *
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="tel"
                  value={form.contactNumber}
                  onChange={(event) =>
                    updateField("contactNumber", event.target.value)
                  }
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address *
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Video Title *
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              placeholder="Example: Community Lake Cleanup Drive"
              maxLength={120}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />

            <p className="mt-1 text-xs text-slate-400">
              Give your environmental activity a clear title.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Video URL *
            </label>

            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="url"
                value={form.url}
                onChange={(event) =>
                  updateField("url", event.target.value)
                }
                placeholder="YouTube / Instagram / Facebook video URL"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {platform && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  {getPlatformIcon(platform)}
                  {platform} detected
                </span>

                {platform === "YouTube" && youtubeVideoId && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Video ID detected
                  </span>
                )}
              </div>
            )}

            {platform === "YouTube" && youtubeThumbnail && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={youtubeThumbnail}
                  alt="YouTube video preview"
                  className="aspect-video w-full object-cover"
                />

                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Video Preview
                    </p>
                    <p className="text-xs text-slate-500">
                      Thumbnail automatically matched to your YouTube video.
                    </p>
                  </div>

                  <Play className="h-5 w-5 shrink-0 text-emerald-600" />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category *
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location / City *
              </label>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={form.location}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                  placeholder="Delhi, Mumbai, Bengaluru..."
                  autoComplete="address-level2"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Environmental Activity Description *
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={4}
              placeholder="Explain the environmental work shown in your video..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <label className="flex cursor-pointer gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <input
              type="checkbox"
              checked={form.creditConfirmed}
              onChange={(event) =>
                updateField("creditConfirmed", event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-emerald-600"
            />

            <span className="text-sm leading-6 text-red-900">
              I confirm that this video explicitly mentions or credits{" "}
              <strong>Eco Clean Hub / Zenji</strong>. I understand that
              submissions without genuine platform credit may be rejected.
            </span>
          </label>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:scale-[1.01]"
            >
              <Upload className="h-4 w-4" />
              Submit Video
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function VideoPlayerModal({ video, onClose }) {
  const embedUrl = getYouTubeEmbedUrl(video.url)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate font-bold text-white">
              {video.title}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {video.creator} · {video.category}
              {video.location ? ` · ${video.location}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <Video className="h-12 w-12 text-slate-500" />

              <p className="mt-4 text-lg font-bold text-white">
                External platform preview
              </p>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                This platform does not provide a universal inline embed for
                this link. Open the original video to watch it.
              </p>

              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Open Original Video
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VerifyModal({ video, onClose, onApprove }) {
  const [approvedAmount, setApprovedAmount] = useState(
    String(video.reward || 100)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Verify & Reward
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Review this submission for authenticity and environmental
              impact.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="font-bold text-slate-900">{video.title}</p>

          <p className="mt-1 text-sm text-slate-500">
            Submitted by {video.creator}
          </p>

          {video.location && (
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {video.location}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <PlatformBadge platform={video.platform} />

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              {video.category}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            ZenjiCoins to award
          </label>

          <input
            type="number"
            min="0"
            max="100000"
            value={approvedAmount}
            onChange={(event) => setApprovedAmount(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <p className="text-sm leading-6 text-emerald-800">
              Approving this submission marks it as verified and records the
              reward amount in the demo ZenjiCoin wallet balance.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              onApprove(Math.max(0, Number(approvedAmount) || 0))
            }
            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20"
          >
            Approve & Reward
          </button>
        </div>
      </div>
    </div>
  )
}

function Guidelines() {
  const [open, setOpen] = useState(false)

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Community Guidelines & ZenjiCoin Terms
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Read the rules before submitting environmental content.
            </p>
          </div>
        </div>

        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-200 px-5 pb-6 pt-5 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">
                Authentic Content
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Submit original, genuine environmental work. Fake, staged,
                misleading, stolen, or materially reused content can be
                rejected.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">
                Eco Clean Hub / Zenji Credit
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                The submitted video must explicitly mention or credit Eco
                Clean Hub / Zenji as required by the submission declaration.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">
                Anti-Fraud Review
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Moderators may review the source, context, creator, timing,
                authenticity, and environmental impact before awarding
                rewards.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">
                ZenjiCoin Redemption
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                ZenjiCoins are impact rewards. Approval and redemption remain
                subject to Eco Clean Hub rules, verification, availability,
                and applicable program terms.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm leading-6 text-amber-900">
              By submitting a video, you confirm that the information and
              content are truthful to the best of your knowledge. Repeated
              abuse, fraud, fake engagement, or misleading submissions can
              result in rejection, reward reversal, or account restrictions.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

function RedImpactWarning() {
  return (
    <section className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm sm:p-7">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <h2 className="text-lg font-extrabold text-red-700">
          Zero-Tolerance Impact Integrity
        </h2>
      </div>

      <div className="space-y-1 text-sm font-semibold leading-7 text-red-600">
        <p>
          1. Fake environmental content has zero tolerance in Eco Clean Hub.
        </p>
        <p>
          2. Every claimed environmental action must remain authentic and
          verifiable.
        </p>
        <p>
          3. Reused, stolen, manipulated, or misleading videos may be
          rejected.
        </p>
        <p>
          4. False claims can permanently damage community trust and platform
          integrity.
        </p>
        <p>
          5. ZenjiCoin rewards are reserved for genuine environmental impact.
        </p>
        <p>
          6. Verification may include creator, source, activity, and impact
          review.
        </p>
        <p>
          7. Attempted reward abuse can result in reward reversal and account
          restrictions.
        </p>
        <p>
          8. Community moderators may reject content that fails authenticity
          requirements.
        </p>
        <p>
          9. Real-world environmental accountability is more important than
          views or virality.
        </p>
        <p>
          10. Protect the mission: clean actions, honest proof, and
          responsible impact reporting.
        </p>
      </div>
    </section>
  )
}

export default function EcoVideoHub() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const isAdmin = String(role || "").toLowerCase() === "admin"

  const [videos, setVideos] = useState(() => loadSavedVideos())
  const [activeFilter, setActiveFilter] = useState("All Videos")
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [watchingVideo, setWatchingVideo] = useState(null)
  const [verifyingVideo, setVerifyingVideo] = useState(null)
  const [notice, setNotice] = useState("")

  const stats = useMemo(() => {
    const totalVideos = videos.length

    const distributed = videos.reduce(
      (total, video) => total + (Number(video.reward) || 0),
      0
    )

    const creators = new Set(
      videos
        .map((video) => String(video.creator || "").trim())
        .filter(Boolean)
    ).size

    return {
      totalVideos,
      distributed,
      creators,
    }
  }, [videos])

  const filteredVideos = useMemo(() => {
    if (activeFilter === "Trending") {
      return videos.filter((video) => video.trending)
    }

    if (activeFilter === "Verified & Rewarded") {
      return videos.filter(
        (video) => video.verified && Number(video.reward) > 0
      )
    }

    if (activeFilter === "My Submissions") {
      return videos.filter((video) => video.submittedByMe)
    }

    return videos
  }, [activeFilter, videos])

  function updateVideos(nextVideos) {
    setVideos(nextVideos)
    saveVideos(nextVideos)
  }

  function showNotice(message) {
    setNotice(message)

    window.setTimeout(() => {
      setNotice("")
    }, 4000)
  }

  function handleSubmitVideo(form) {
    const submittedUrl = form.url.trim()
    const submittedYouTubeId = getYouTubeVideoId(submittedUrl)

    if (submittedYouTubeId) {
      const duplicate = videos.some(
        (video) => getYouTubeVideoId(video.url) === submittedYouTubeId
      )

      if (duplicate) {
        showNotice("This YouTube video has already been submitted.")
        return
      }
    }

    const newVideo = {
      id: `eco-${Date.now()}`,
      creator: form.realName,
      creatorInitials: getInitials(form.realName),
      realName: form.realName,
      contactNumber: form.contactNumber,
      email: form.email,
      title: form.title,
      description: form.description,
      url: form.url,
      platform: form.platform,
      category: form.category,
      location: form.location,
      views: 0,
      reward: 0,
      verified: false,
      trending: false,
      submittedByMe: true,
      creditConfirmed: true,
      submittedAt: new Date().toISOString(),
      thumbnail:
        getYouTubeThumbnail(form.url) ||
        "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
    }

    const nextVideos = [newVideo, ...videos]

    updateVideos(nextVideos)

    setShowSubmissionModal(false)
    setActiveFilter("My Submissions")

    showNotice(
      "Video submitted successfully for community verification."
    )
  }

  function handleApproveVideo(amount) {
    if (!isAdmin) return
    if (!verifyingVideo) {
      return
    }

    const targetId = verifyingVideo.id

    const nextVideos = videos.map((video) => {
      if (video.id !== targetId) {
        return video
      }

      return {
        ...video,
        verified: true,
        reward: amount,
      }
    })

    updateVideos(nextVideos)

    setVerifyingVideo(null)

    showNotice(
      `${formatNumber(amount)} ZenjiCoins approved for ${verifyingVideo.creator}.`
    )
  }

  return (
    <div className="min-h-screen bg-[#f6faf7]">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-600 to-green-700 p-5 shadow-xl shadow-emerald-900/10 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div className="max-w-3xl">
                <div className="mb-5 flex items-center gap-3">
                  <AppLogo />

                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-50">
                    Community Impact Hub
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Zenji Eco-Video Hub
                </h1>

                <p className="mt-4 text-lg font-semibold text-emerald-50 sm:text-xl">
                  Proof in Action: Clean, Share & Earn ZenjiCoins
                </p>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-100 sm:text-base">
                  Share genuine environmental work, inspire your community,
                  and let verified impact earn recognition through the Zenji
                  reward ecosystem.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setShowSubmissionModal(true) }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-extrabold text-emerald-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                <Plus className="h-5 w-5" />
                Submit Eco Video
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Video className="h-4 w-4" />}
                label="Total Videos"
                value={stats.totalVideos}
              />

              <StatCard
                icon={<Coins className="h-4 w-4" />}
                label="ZenjiCoins Distributed"
                value={stats.distributed}
              />

              <StatCard
                icon={<User className="h-4 w-4" />}
                label="Active Green Creators"
                value={stats.creators}
              />
            </div>
          </div>
        </section>

        {notice && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <Check className="h-5 w-5 shrink-0" />
            {notice}
          </div>
        )}

        <section className="mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                Community Feed
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Environmental Proof in Action
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Filter className="h-4 w-4" />
              {filteredVideos.length} videos shown
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {[
              "All Videos",
              "Trending",
              "Verified & Rewarded",
              "My Submissions",
            ].map((filter) => {
              const active = activeFilter === filter

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                  }`}
                >
                  {filter}
                </button>
              )
            })}
          </div>

          {filteredVideos.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onWatch={setWatchingVideo}
                  onVerify={setVerifyingVideo}
                  canVerify={isAdmin}
                
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <Video className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 font-bold text-slate-900">
                No videos in this filter
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Submit a genuine environmental video to start building your
                impact profile.
              </p>

              <button
                type="button"
                onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setShowSubmissionModal(true) }}
                className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Submit Eco Video
              </button>
            </div>
          )}
        </section>

        <section className="mt-10 overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-800 p-6 shadow-xl shadow-emerald-900/10 sm:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-50">
                <Upload className="h-4 w-4" />
                Community Submission
              </div>

              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Submit Your Eco Video
              </h2>

              <p className="mt-3 text-sm leading-7 text-emerald-50 sm:text-base">
                Show the real environmental work happening around you. Submit
                your video, add the activity details, and send it for community
                verification.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase text-emerald-100">
                    Step 1
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    Add your video
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase text-emerald-100">
                    Step 2
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    Explain the impact
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase text-emerald-100">
                    Step 3
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    Get verified
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setShowSubmissionModal(true) }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-emerald-700 shadow-xl transition hover:-translate-y-1 hover:bg-emerald-50"
            >
              <Plus className="h-5 w-5" />
              Submit Eco Video
            </button>
          </div>
        </section>

        <Guidelines />

        <section className="mt-8 rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Zenji Impact Rewards
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Genuine ground-work, community leadership, and verified
                  environmental storytelling can qualify for ZenjiCoin
                  rewards.
                </p>
              </div>
            </div>

            <div className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-amber-600 shadow-sm ring-1 ring-slate-200">
              <Award className="h-5 w-5" />
              Impact-first rewards
            </div>
          </div>
        </section>

        <RedImpactWarning />

        <footer className="pb-8 pt-8 text-center text-xs leading-6 text-slate-500">
          Eco Clean Hub community content is subject to verification, platform
          rules, and applicable ZenjiCoin program policies.
        </footer>
      </main>

      {showSubmissionModal && (
        <SubmissionModal
          onClose={() => setShowSubmissionModal(false)}
          onSubmit={handleSubmitVideo}
        />
      )}

      {watchingVideo && (
        <VideoPlayerModal
          video={watchingVideo}
          onClose={() => setWatchingVideo(null)}
        />
      )}

      {verifyingVideo && (
        <VerifyModal
          video={verifyingVideo}
          onClose={() => setVerifyingVideo(null)}
          onApprove={handleApproveVideo}
        />
      )}
    </div>
  )
}






