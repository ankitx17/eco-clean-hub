import {
  BadgeCheck,
  Check,
  Clock3,
  Coins,
  ExternalLink,
  Filter,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  Video,
  X,
  XCircle,
} from "lucide-react"

import {
  useEffect,
  useMemo,
  useState,
} from "react"


const STORAGE_KEY =
  "eco-clean-hub-eco-video-hub"


function formatNumber(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return "0"
  }

  return new Intl.NumberFormat(
    "en-IN"
  ).format(number)
}


function formatDate(value) {
  if (!value) {
    return "—"
  }

  try {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return "—"
    }

    return date.toLocaleString("en-IN")
  } catch {
    return "—"
  }
}


function getStatus(video) {
  if (video.rejected) {
    return "rejected"
  }

  if (video.verified) {
    return "approved"
  }

  return "pending"
}


function getYouTubeVideoId(url) {
  try {
    const parsed = new URL(
      String(url || "").trim()
    )

    const hostname =
      parsed.hostname.toLowerCase()

    const parts =
      parsed.pathname
        .split("/")
        .filter(Boolean)

    if (
      hostname === "youtu.be" ||
      hostname.endsWith(".youtu.be")
    ) {
      return parts[0] || ""
    }

    if (
      hostname.includes("youtube.com")
    ) {
      const queryId =
        parsed.searchParams.get("v")

      if (queryId) {
        return queryId
      }

      if (
        (
          parts[0] === "shorts" ||
          parts[0] === "embed" ||
          parts[0] === "live"
        ) &&
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


function getEmbedUrl(url) {
  const videoId =
    getYouTubeVideoId(url)

  return videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : ""
}


function getThumbnail(video) {
  if (video.thumbnail) {
    return video.thumbnail
  }

  const videoId =
    getYouTubeVideoId(video.url)

  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }

  return ""
}


function loadVideos() {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      )

    if (!saved) {
      return []
    }

    const parsed =
      JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}


function saveVideos(videos) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(videos)
    )
  } catch (error) {
    console.error(
      "Failed to save videos:",
      error
    )
  }
}


function StatusBadge({ status }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
        <BadgeCheck size={14} />
        Approved
      </span>
    )
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
        <XCircle size={14} />
        Rejected
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
      <Clock3 size={14} />
      Pending
    </span>
  )
}


function VideoPreviewModal({
  video,
  onClose,
}) {
  const embedUrl =
    getEmbedUrl(video.url)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div className="min-w-0">

            <h2 className="truncate text-lg font-black text-slate-900">
              {video.title ||
                "Eco Video"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {video.creator ||
                video.realName ||
                "Unknown creator"}
              {" · "}
              {video.category ||
                "Environmental Activity"}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>

        </div>


        {/* Video */}

        <div className="aspect-video bg-black">

          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={
                video.title ||
                "Eco Video"
              }
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">

              <Video
                size={48}
                className="text-slate-500"
              />

              <p className="mt-4 text-lg font-bold text-white">
                External Video
              </p>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                This platform does not support
                inline preview for this video.
              </p>

              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Open Original Video
                <ExternalLink size={16} />
              </a>

            </div>
          )}

        </div>


        {/* Details */}

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400">
              Creator
            </p>

            <p className="mt-1 font-bold text-slate-800">
              {video.creator ||
                video.realName ||
                "Unknown"}
            </p>
          </div>


          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400">
              Category
            </p>

            <p className="mt-1 font-bold text-slate-800">
              {video.category ||
                "—"}
            </p>
          </div>


          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400">
              Location
            </p>

            <p className="mt-1 font-bold text-slate-800">
              {video.location ||
                "—"}
            </p>
          </div>


          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400">
              Submitted
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800">
              {formatDate(
                video.submittedAt
              )}
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}


function ReviewModal({
  video,
  onClose,
  onApprove,
  onReject,
}) {
  const [reward, setReward] =
    useState(
      String(video.reward || 100)
    )

  const [rejectReason, setRejectReason] =
    useState("")

  const [mode, setMode] =
    useState("approve")


  const handleApprove = () => {
    const amount =
      Math.max(
        0,
        Number(reward) || 0
      )

    onApprove(amount)
  }


  const handleReject = () => {
    const reason =
      rejectReason.trim()

    if (!reason) {
      return
    }

    onReject(reason)
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">

          <div>

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck size={24} />
            </div>

            <h2 className="text-xl font-black text-slate-900">
              Review Eco Video
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Verify the submitted environmental
              content before approving the reward.
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>

        </div>


        {/* Submission information */}

        <div className="p-6">

          <div className="rounded-2xl bg-slate-50 p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <User size={20} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="font-black text-slate-900">
                  {video.creator ||
                    video.realName ||
                    "Unknown Creator"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {video.email ||
                    "No email provided"}
                </p>

              </div>

              <StatusBadge
                status={getStatus(video)}
              />

            </div>


            <div className="mt-5">

              <h3 className="text-lg font-black text-slate-900">
                {video.title ||
                  "Untitled Eco Video"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {video.description ||
                  "No description provided."}
              </p>

            </div>


            <div className="mt-4 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">

                <p className="text-xs text-slate-400">
                  Category
                </p>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {video.category ||
                    "—"}
                </p>

              </div>


              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">

                <p className="text-xs text-slate-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {video.location ||
                    "—"}
                </p>

              </div>


              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">

                <p className="text-xs text-slate-400">
                  Platform
                </p>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {video.platform ||
                    "—"}
                </p>

              </div>

            </div>

          </div>


          {/* Watch video */}

          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Play size={18} />
              </div>

              <div>

                <p className="text-sm font-bold text-slate-800">
                  Open Submitted Video
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Review the original source before making a decision.
                </p>

              </div>

            </div>

            <ExternalLink
              size={18}
              className="text-slate-400"
            />

          </a>


          {/* Decision buttons */}

          <div className="mt-6 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() =>
                setMode("approve")
              }
              className={[
                "rounded-2xl border px-4 py-3 text-sm font-bold transition",
                mode === "approve"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              Approve Video
            </button>


            <button
              type="button"
              onClick={() =>
                setMode("reject")
              }
              className={[
                "rounded-2xl border px-4 py-3 text-sm font-bold transition",
                mode === "reject"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              Reject Video
            </button>

          </div>


          {/* Approve */}

          {mode === "approve" && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

              <div className="flex items-center gap-2">

                <Coins
                  size={19}
                  className="text-emerald-700"
                />

                <label className="text-sm font-bold text-emerald-900">
                  ZenjiCoins Reward
                </label>

              </div>

              <input
                type="number"
                min="0"
                max="100000"
                value={reward}
                onChange={(event) =>
                  setReward(
                    event.target.value
                  )
                }
                className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              />

              <p className="mt-2 text-xs leading-5 text-emerald-700">
                Set the reward amount after checking
                the video's authenticity and environmental impact.
              </p>

            </div>
          )}


          {/* Reject */}

          {mode === "reject" && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">

              <label className="text-sm font-bold text-red-900">
                Rejection Reason
              </label>

              <textarea
                value={rejectReason}
                onChange={(event) =>
                  setRejectReason(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Explain why this video is being rejected..."
                className="mt-3 w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-red-500"
              />

            </div>
          )}


          {/* Action */}

          <div className="mt-6 flex gap-3">

            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>


            {mode === "approve" ? (
              <button
                type="button"
                onClick={handleApprove}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Check size={18} />
                Approve & Reward
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle size={18} />
                Reject Video
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}


function VideoReview() {
  const [videos, setVideos] =
    useState([])

  const [search, setSearch] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState("all")

  const [loading, setLoading] =
    useState(true)

  const [selectedVideo, setSelectedVideo] =
    useState(null)

  const [watchingVideo, setWatchingVideo] =
    useState(null)

  const [notice, setNotice] =
    useState("")


  // =====================================================
  // LOAD VIDEOS
  // =====================================================

  const loadVideos = () => {
    setLoading(true)

    const saved =
      loadVideosFromStorage()

    setVideos(saved)

    setLoading(false)
  }


  useEffect(() => {
    loadVideos()
  }, [])


  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {

    const total =
      videos.length

    const pending =
      videos.filter(
        (video) =>
          getStatus(video) ===
          "pending"
      ).length

    const approved =
      videos.filter(
        (video) =>
          getStatus(video) ===
          "approved"
      ).length

    const rejected =
      videos.filter(
        (video) =>
          getStatus(video) ===
          "rejected"
      ).length

    const rewards =
      videos.reduce(
        (total, video) =>
          total +
          Number(video.reward || 0),
        0
      )

    return {
      total,
      pending,
      approved,
      rejected,
      rewards,
    }

  }, [videos])


  // =====================================================
  // FILTER
  // =====================================================

  const filteredVideos =
    useMemo(() => {

      const query =
        search.trim().toLowerCase()

      return videos.filter(
        (video) => {

          const status =
            getStatus(video)

          if (
            statusFilter !== "all" &&
            status !== statusFilter
          ) {
            return false
          }

          if (!query) {
            return true
          }

          const searchable = [
            video.creator,
            video.realName,
            video.email,
            video.title,
            video.category,
            video.location,
            video.platform,
          ]
            .map(
              (value) =>
                String(
                  value || ""
                ).toLowerCase()
            )
            .join(" ")

          return searchable.includes(
            query
          )
        }
      )

    }, [
      videos,
      search,
      statusFilter,
    ])


  // =====================================================
  // UPDATE VIDEO
  // =====================================================

  const updateVideo = (
    videoId,
    updates
  ) => {

    const nextVideos =
      videos.map(
        (video) =>
          video.id === videoId
            ? {
                ...video,
                ...updates,
              }
            : video
      )

    setVideos(nextVideos)

    saveVideos(nextVideos)
  }


  // =====================================================
  // APPROVE
  // =====================================================

  const handleApprove = (
    amount
  ) => {

    if (!selectedVideo) {
      return
    }

    updateVideo(
      selectedVideo.id,
      {
        verified: true,
        rejected: false,
        reward: amount,
        verifiedAt:
          new Date().toISOString(),
      }
    )

    setSelectedVideo(null)

    setNotice(
      `${formatNumber(amount)} ZenjiCoins approved for ${
        selectedVideo.creator ||
        selectedVideo.realName ||
        "the creator"
      }.`
    )

    window.setTimeout(
      () => setNotice(""),
      4000
    )
  }


  // =====================================================
  // REJECT
  // =====================================================

  const handleReject = (
    reason
  ) => {

    if (!selectedVideo) {
      return
    }

    updateVideo(
      selectedVideo.id,
      {
        verified: false,
        rejected: true,
        reward: 0,
        rejectionReason:
          reason,
        rejectedAt:
          new Date().toISOString(),
      }
    )

    setSelectedVideo(null)

    setNotice(
      "Video submission rejected successfully."
    )

    window.setTimeout(
      () => setNotice(""),
      4000
    )
  }


  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#176b45]">
            Management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#14231a]">
            Eco Video Review
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review community environmental videos,
            verify authenticity and approve ZenjiCoin rewards.
          </p>

        </div>


        <button
          type="button"
          onClick={loadVideos}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#176b45] hover:text-[#176b45]"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* =================================================
          NOTICE
          ================================================= */}

      {notice && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">

          <Check size={18} />

          {notice}

        </div>
      )}


      {/* =================================================
          STATS
          ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Total Videos
          </p>

          <p className="mt-2 text-3xl font-black text-[#14231a]">
            {stats.total}
          </p>

          <Video
            size={20}
            className="mt-3 text-[#176b45]"
          />

        </div>


        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Pending Review
          </p>

          <p className="mt-2 text-3xl font-black text-amber-600">
            {stats.pending}
          </p>

          <Clock3
            size={20}
            className="mt-3 text-amber-500"
          />

        </div>


        <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Approved
          </p>

          <p className="mt-2 text-3xl font-black text-green-600">
            {stats.approved}
          </p>

          <BadgeCheck
            size={20}
            className="mt-3 text-green-600"
          />

        </div>


        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Rejected
          </p>

          <p className="mt-2 text-3xl font-black text-red-600">
            {stats.rejected}
          </p>

          <XCircle
            size={20}
            className="mt-3 text-red-600"
          />

        </div>


        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Rewards
          </p>

          <p className="mt-2 text-3xl font-black text-[#14231a]">
            {formatNumber(
              stats.rewards
            )}
          </p>

          <Coins
            size={20}
            className="mt-3 text-amber-500"
          />

        </div>

      </div>


      {/* =================================================
          FILTERS
          ================================================= */}

      <section className="rounded-3xl border border-[#dce9e1] bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search creator, email, title, category..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#176b45] focus:bg-white"
            />

          </div>


          <div className="relative">

            <Filter
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-semibold text-slate-700 outline-none focus:border-[#176b45]"
            >

              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>

            </select>

          </div>

        </div>

      </section>


      {/* =================================================
          REVIEW QUEUE
          ================================================= */}

      <section className="overflow-hidden rounded-3xl border border-[#dce9e1] bg-white shadow-sm">

        <div className="border-b border-[#edf2ee] p-6">

          <h2 className="text-lg font-black text-[#14231a]">
            Video Verification Queue
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredVideos.length} video
            {filteredVideos.length === 1
              ? ""
              : "s"} found
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead>

              <tr className="border-b border-[#edf2ee] bg-[#f8fbf9] text-left">

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Video
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Creator
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Category
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Submitted
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reward
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-14 text-center"
                  >

                    <RefreshCw
                      size={24}
                      className="mx-auto animate-spin text-[#176b45]"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      Loading videos...
                    </p>

                  </td>

                </tr>

              ) : filteredVideos.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-14 text-center"
                  >

                    <Video
                      size={36}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-4 font-bold text-slate-600">
                      No video submissions found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      New community video submissions
                      will appear here for review.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredVideos.map(
                  (video) => {

                    const status =
                      getStatus(video)

                    return (
                      <tr
                        key={video.id}
                        className="border-b border-[#edf2ee] last:border-b-0"
                      >

                        {/* Video */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                              {getThumbnail(
                                video
                              ) ? (
                                <img
                                  src={getThumbnail(
                                    video
                                  )}
                                  alt={
                                    video.title ||
                                    "Eco video"
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Video
                                    size={20}
                                    className="text-slate-400"
                                  />
                                </div>
                              )}

                            </div>


                            <div className="min-w-0 max-w-xs">

                              <p className="truncate text-sm font-bold text-slate-800">
                                {video.title ||
                                  "Untitled Video"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {video.platform ||
                                  "External"}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Creator */}

                        <td className="px-6 py-4">

                          <p className="text-sm font-bold text-slate-700">
                            {video.creator ||
                              video.realName ||
                              "Unknown"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {video.email ||
                              "No email"}
                          </p>

                        </td>


                        {/* Category */}

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                            {video.category ||
                              "—"}
                          </span>

                        </td>


                        {/* Date */}

                        <td className="px-6 py-4">

                          <p className="text-xs font-medium text-slate-500">
                            {formatDate(
                              video.submittedAt
                            )}
                          </p>

                        </td>


                        {/* Reward */}

                        <td className="px-6 py-4">

                          <div className="inline-flex items-center gap-1.5 text-sm font-black text-amber-600">

                            <Coins size={15} />

                            {formatNumber(
                              video.reward || 0
                            )}

                          </div>

                        </td>


                        {/* Status */}

                        <td className="px-6 py-4">

                          <StatusBadge
                            status={status}
                          />

                        </td>


                        {/* Action */}

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                setWatchingVideo(
                                  video
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Play
                                size={14}
                              />
                              Watch
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                setSelectedVideo(
                                  video
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#176b45] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0f5b39]"
                            >
                              <ShieldCheck
                                size={14}
                              />
                              {status ===
                              "pending"
                                ? "Review"
                                : "View"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =================================================
          REVIEW MODAL
          ================================================= */}

      {selectedVideo && (
        <ReviewModal
          video={selectedVideo}
          onClose={() =>
            setSelectedVideo(null)
          }
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}


      {/* =================================================
          VIDEO MODAL
          ================================================= */}

      {watchingVideo && (
        <VideoPreviewModal
          video={watchingVideo}
          onClose={() =>
            setWatchingVideo(null)
          }
        />
      )}

    </div>
  )
}


// Separate function so loadVideos()
// doesn't conflict with state function.

function loadVideosFromStorage() {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      )

    if (!saved) {
      return []
    }

    const parsed =
      JSON.parse(saved)

    return Array.isArray(parsed)
      ? parsed
      : []
  } catch {
    return []
  }
}


export default VideoReview