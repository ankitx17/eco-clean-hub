import { useMemo, useState } from "react"
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Coins,
  Eye,
  Play,
  Plus,
  TrendingUp,
  Video,
  X,
} from "lucide-react"
import { Link } from "react-router-dom"

const STORAGE_KEY = "eco-clean-hub-eco-video-hub"

const legacyIds = new Set([
  "eco-001",
  "eco-002",
  "eco-003",
  "eco-004",
  "eco-005",
  "eco-006",
  "eco-feed-001",
  "eco-feed-002",
  "eco-feed-003",
])

const initialVideos = [
  {
    id: "eco-yt-001",
    creator: "Eco Community Creator",
    title: "Eco Action Community Video 1",
    description:
      "A community environmental action shared through the Eco Clean Hub.",
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
    thumbnail:
      "https://img.youtube.com/vi/FysNW1_i3lM/hqdefault.jpg",
  },
  {
    id: "eco-yt-002",
    creator: "Aarav Green Team",
    title: "Community Lake Cleanup Drive",
    description:
      "Community members working together to clean and improve a local environment.",
    url: "https://www.youtube.com/embed/zlC6BNWr-Co",
    platform: "YouTube",
    category: "Tree Plantation",
    location: "Community",
    views: 12840,
    reward: 250,
    verified: true,
    trending: true,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail:
      "https://img.youtube.com/vi/zlC6BNWr-Co/hqdefault.jpg",
  },
  {
    id: "eco-yt-003",
    creator: "Green Community Creator",
    title: "Eco Action Community Video 2",
    description:
      "A verified environmental action shared by the Eco Clean Hub community.",
    url: "https://www.youtube.com/embed/cV2gBU6hKfY",
    platform: "YouTube",
    category: "Recycling Drive",
    location: "Community",
    views: 9340,
    reward: 400,
    verified: true,
    trending: false,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail:
      "https://img.youtube.com/vi/cV2gBU6hKfY/hqdefault.jpg",
  },
  {
    id: "eco-yt-004",
    creator: "Green Youth Collective",
    title: "100 Trees Plantation Challenge",
    description:
      "A community tree plantation activity focused on creating a greener environment.",
    url: "https://www.youtube.com/embed/Ga_QcJqcGcc",
    platform: "YouTube",
    category: "Awareness",
    location: "Community",
    views: 9340,
    reward: 400,
    verified: true,
    trending: true,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail:
      "https://img.youtube.com/vi/Ga_QcJqcGcc/hqdefault.jpg",
  },
  {
    id: "eco-yt-005",
    creator: "Eco Green Creator",
    title: "Community Environmental Action",
    description:
      "Environmental awareness and community action shared through Eco Clean Hub.",
    url: "https://www.youtube.com/embed/eaJz6XUPVuc",
    platform: "YouTube",
    category: "Cleanup",
    location: "Community",
    views: 6210,
    reward: 150,
    verified: false,
    trending: false,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail:
      "https://img.youtube.com/vi/eaJz6XUPVuc/hqdefault.jpg",
  },
  {
    id: "eco-yt-006",
    creator: "Eco Action Team",
    title: "Green Awareness Community Video",
    description:
      "A community-focused environmental awareness video.",
    url: "https://www.youtube.com/embed/BkWMJkn1Q2E",
    platform: "YouTube",
    category: "Awareness",
    location: "Community",
    views: 4380,
    reward: 100,
    verified: false,
    trending: false,
    submittedByMe: false,
    creditConfirmed: true,
    thumbnail:
      "https://img.youtube.com/vi/BkWMJkn1Q2E/hqdefault.jpg",
  },
]

function formatNumber(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return "0"
  }

  return new Intl.NumberFormat("en-IN").format(number)
}

function getYouTubeVideoId(url) {
  if (!url) {
    return ""
  }

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").split("/")[0]
    }

    if (!parsed.hostname.includes("youtube.com")) {
      return ""
    }

    const queryId = parsed.searchParams.get("v")

    if (queryId) {
      return queryId
    }

    const parts = parsed.pathname.split("/").filter(Boolean)

    if (
      (parts[0] === "embed" ||
        parts[0] === "shorts" ||
        parts[0] === "live") &&
      parts[1]
    ) {
      return parts[1]
    }
  } catch {
    return ""
  }

  return ""
}

function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url)

  return videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : ""
}

function getYouTubeThumbnail(url) {
  const videoId = getYouTubeVideoId(url)

  return videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : ""
}

function loadVideos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return initialVideos
    }

    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return initialVideos
    }

    const cleanSavedVideos = parsed.filter((video) => {
      if (!video || typeof video !== "object") {
        return false
      }

      if (legacyIds.has(video.id)) {
        return false
      }

      const oldDummyUrls = [
        "dQw4w9WgXcQ",
        "ysz5S6PUM-U",
        "www.instagram.com",
        "www.facebook.com",
      ]

      if (
        typeof video.url === "string" &&
        oldDummyUrls.some((value) => video.url.includes(value))
      ) {
        return false
      }

      return true
    })

    const currentInitialVideos = initialVideos.map((initialVideo) => {
      const savedVersion = cleanSavedVideos.find(
        (video) => video.id === initialVideo.id,
      )

      return savedVersion
        ? {
            ...initialVideo,
            ...savedVersion,
            thumbnail:
              getYouTubeThumbnail(savedVersion.url) ||
              initialVideo.thumbnail,
          }
        : initialVideo
    })

    const userVideos = cleanSavedVideos.filter(
      (video) =>
        !initialVideos.some(
          (initialVideo) => initialVideo.id === video.id,
        ),
    )

    return [...currentInitialVideos, ...userVideos]
  } catch {
    return initialVideos
  }
}

function FeedCard({ video, onWatch }) {
  const thumbnail =
    video.thumbnail ||
    getYouTubeThumbnail(video.url) ||
    ""

  return (
    <article className="w-[290px] shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[330px]">
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-800">
            <Video className="h-12 w-12 text-slate-500" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <button
          type="button"
          onClick={() => onWatch(video)}
          className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-emerald-700 shadow-xl transition hover:scale-110"
          aria-label={`Watch ${video.title}`}
        >
          <Play className="ml-0.5 h-5 w-5 fill-current" />
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

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {video.creator}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(video.views)} views
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {video.platform}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-bold text-slate-900">
          {video.title}
        </h3>

        {video.location && (
          <p className="mt-2 truncate text-xs font-medium text-slate-500">
            📍 {video.location}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600">
            <Coins className="h-4 w-4" />
            {formatNumber(video.reward)} ZenjiCoins
          </span>

          <button
            type="button"
            onClick={() => onWatch(video)}
            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Watch
          </button>
        </div>
      </div>
    </article>
  )
}

function VideoPreviewModal({ video, onClose }) {
  const embedUrl = getYouTubeEmbedUrl(video.url)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">
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
            aria-label="Close video"
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
                Video preview unavailable
              </p>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                This video cannot be previewed inside the dashboard.
              </p>

              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Open Original Video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EcoVideoFeed() {
  const [videos] = useState(() => loadVideos())
  const [watchingVideo, setWatchingVideo] = useState(null)

  const feedVideos = useMemo(() => {
    return videos
      .filter((video) => video.verified || video.trending)
      .sort((a, b) => {
        const trendingScore =
          Number(b.trending) - Number(a.trending)

        if (trendingScore !== 0) {
          return trendingScore
        }

        const verifiedScore =
          Number(b.verified) - Number(a.verified)

        if (verifiedScore !== 0) {
          return verifiedScore
        }

        return Number(b.views || 0) - Number(a.views || 0)
      })
      .slice(0, 8)
  }, [videos])

  function scrollFeed(direction) {
    const container = document.getElementById(
      "eco-video-feed-scroll",
    )

    if (!container) {
      return
    }

    container.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    })
  }

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
              <Video className="h-4 w-4" />
              Community Impact
            </div>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Trending Eco Videos
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Discover verified environmental actions shared by the
              Eco Clean Hub community.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/eco-video-hub"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "instant",
                })
              }}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#176b45] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125a39]"
            >
              <Plus className="h-4 w-4" />
              Submit Eco Video
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => scrollFeed("left")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
              aria-label="Previous videos"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollFeed("right")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
              aria-label="Next videos"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {feedVideos.length > 0 ? (
          <div
            id="eco-video-feed-scroll"
            className="mt-5 flex gap-4 overflow-x-auto pb-3"
          >
            {feedVideos.map((video) => (
              <FeedCard
                key={video.id}
                video={video}
                onWatch={setWatchingVideo}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
            <Video className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-bold text-slate-700">
              No community videos yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Verified community videos will appear here.
            </p>

            <Link
              to="/eco-video-hub"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Submit Eco Video
            </Link>
          </div>
        )}
      </section>

      {watchingVideo && (
        <VideoPreviewModal
          video={watchingVideo}
          onClose={() => setWatchingVideo(null)}
        />
      )}
    </>
  )
}