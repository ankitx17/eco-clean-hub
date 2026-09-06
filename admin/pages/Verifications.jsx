import { useEffect, useMemo, useState } from "react"

import {
  CheckCircle2,
  Clock3,
  Eye,
  Image as ImageIcon,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react"

import {
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore"

import {
  getDownloadURL,
  ref,
} from "firebase/storage"

import {
  db,
  storage,
} from "../../src/services/firebase"

function Verifications() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSubmission, setSelectedSubmission] =
    useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const [resolvedImages, setResolvedImages] = useState({
    before: "",
    after: "",
    action: "",
  })

  const [imagesLoading, setImagesLoading] =
    useState(false)

  // =====================================================
  // LOAD CLEANUP SUBMISSIONS
  // =====================================================

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      setError("")

      const snapshot = await getDocs(
        collection(db, "cleanupSubmissions")
      )

      const submissionList = snapshot.docs.map(
        (documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        })
      )

      // Newest first
      submissionList.sort((a, b) => {
        const getTime = (value) => {
          if (!value) {
            return 0
          }

          if (
            typeof value.toDate === "function"
          ) {
            return value.toDate().getTime()
          }

          const date = new Date(value)

          return Number.isNaN(date.getTime())
            ? 0
            : date.getTime()
        }

        return (
          getTime(b.submittedAt || b.createdAt) -
          getTime(a.submittedAt || a.createdAt)
        )
      })

      setSubmissions(submissionList)
    } catch (err) {
      console.error(
        "Failed to load verification submissions:",
        err
      )

      setError(
        "Verification submissions load nahi ho paayi. Firestore rules ya cleanupSubmissions collection check karo."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  // =====================================================
  // FILTER
  // =====================================================

  const filteredSubmissions = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase()

    return submissions.filter((submission) => {
      const status = String(
        submission.status || "pending"
      ).toLowerCase()

      if (
        statusFilter !== "all" &&
        status !== statusFilter
      ) {
        return false
      }

      if (!searchValue) {
        return true
      }

      const userName = String(
        submission.userName ||
          submission.name ||
          ""
      ).toLowerCase()

      const userEmail = String(
        submission.userEmail ||
          submission.email ||
          ""
      ).toLowerCase()

      const terrain = String(
        submission.terrain || ""
      ).toLowerCase()

      const mode = String(
        submission.mode || ""
      ).toLowerCase()

      const description = String(
        submission.description || ""
      ).toLowerCase()

      const wasteType = String(
        submission.wasteType ||
          submission.wasteCategory ||
          ""
      ).toLowerCase()

      return (
        userName.includes(searchValue) ||
        userEmail.includes(searchValue) ||
        terrain.includes(searchValue) ||
        mode.includes(searchValue) ||
        description.includes(searchValue) ||
        wasteType.includes(searchValue)
      )
    })
  }, [
    submissions,
    search,
    statusFilter,
  ])

  // =====================================================
  // COUNTS
  // =====================================================

  const totalCount = submissions.length

  const pendingCount = submissions.filter(
    (submission) =>
      String(
        submission.status || "pending"
      ).toLowerCase() === "pending"
  ).length

  const approvedCount = submissions.filter(
    (submission) => {
      const status = String(
        submission.status || ""
      ).toLowerCase()

      return (
        status === "approved" ||
        status === "verified"
      )
    }
  ).length

  const rejectedCount = submissions.filter(
    (submission) =>
      String(
        submission.status || ""
      ).toLowerCase() === "rejected"
  ).length

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateVerificationStatus = async (
    submissionId,
    newStatus
  ) => {
    try {
      setUpdatingId(submissionId)

      const submissionReference = doc(
        db,
        "cleanupSubmissions",
        submissionId
      )

      await updateDoc(
        submissionReference,
        {
          status: newStatus,
          verifiedAt: new Date(),
        }
      )

      setSubmissions(
        (currentSubmissions) =>
          currentSubmissions.map(
            (submission) =>
              submission.id === submissionId
                ? {
                    ...submission,
                    status: newStatus,
                    verifiedAt: new Date(),
                  }
                : submission
          )
      )

      setSelectedSubmission(
        (current) =>
          current?.id === submissionId
            ? {
                ...current,
                status: newStatus,
                verifiedAt: new Date(),
              }
            : current
      )
    } catch (err) {
      console.error(
        "Failed to update verification:",
        err
      )

      alert(
        "Verification status update nahi ho saka. Firestore rules check karo."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "Date unavailable"
    }

    try {
      const date =
        typeof value?.toDate === "function"
          ? value.toDate()
          : new Date(value)

      if (Number.isNaN(date.getTime())) {
        return "Date unavailable"
      }

      return date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    } catch {
      return "Date unavailable"
    }
  }

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyles = (status) => {
    const value = String(
      status || "pending"
    ).toLowerCase()

    if (
      value === "approved" ||
      value === "verified"
    ) {
      return {
        badge:
          "bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
        label: "Approved",
      }
    }

    if (value === "rejected") {
      return {
        badge:
          "bg-red-50 text-red-700",
        icon: XCircle,
        label: "Rejected",
      }
    }

    return {
      badge:
        "bg-amber-50 text-amber-700",
      icon: Clock3,
      label: "Pending",
    }
  }

  // =====================================================
  // DIRECT IMAGE VALUE
  // =====================================================

  const getDirectImageValue = (
    submission,
    type
  ) => {
    if (type === "before") {
      return (
        submission.beforeImageUrl ||
        submission.beforePhotoUrl ||
        submission.beforePhoto ||
        submission.beforeImagePath ||
        submission.beforeStoragePath ||
        submission.beforePath ||
        ""
      )
    }

    if (type === "after") {
      return (
        submission.afterImageUrl ||
        submission.afterPhotoUrl ||
        submission.afterPhoto ||
        submission.afterImagePath ||
        submission.afterStoragePath ||
        submission.afterPath ||
        ""
      )
    }

    return (
      submission.actionImageUrl ||
      submission.actionPhotoUrl ||
      submission.actionPhoto ||
      submission.actionImagePath ||
      submission.actionStoragePath ||
      submission.actionPath ||
      ""
    )
  }

  // =====================================================
  // RESOLVE STORAGE IMAGE
  // =====================================================

  const resolveStorageImage = async (
    submission,
    type
  ) => {
    const directValue =
      getDirectImageValue(
        submission,
        type
      )

    // ---------------------------------------------------
    // 1. Direct Firebase download URL
    // ---------------------------------------------------

    if (directValue) {
      const value = String(directValue)

      if (
        value.startsWith("http://") ||
        value.startsWith("https://")
      ) {
        return value
      }

      // -------------------------------------------------
      // 2. Direct Firebase Storage path
      // -------------------------------------------------

      try {
        return await getDownloadURL(
          ref(storage, value)
        )
      } catch (error) {
        console.warn(
          `Direct ${type} storage path failed:`,
          error
        )
      }
    }

    // ---------------------------------------------------
    // 3. Rebuild path used by SubmitCleanup
    // ---------------------------------------------------

    const userId = submission.userId

    const submissionId =
      submission.id ||
      submission.submissionId

    if (!userId || !submissionId) {
      return ""
    }

    let photoName = ""

    if (type === "before") {
      photoName =
        submission.beforePhotoName ||
        submission.beforeFileName ||
        ""
    }

    if (type === "after") {
      photoName =
        submission.afterPhotoName ||
        submission.afterFileName ||
        ""
    }

    if (type === "action") {
      photoName =
        submission.actionPhotoName ||
        submission.actionFileName ||
        ""
    }

    if (!photoName) {
      return ""
    }

    const storagePath =
      `cleanupSubmissions/${userId}/${submissionId}/${type}-${photoName}`

    try {
      return await getDownloadURL(
        ref(storage, storagePath)
      )
    } catch (error) {
      console.error(
        `Failed to load ${type} image from Firebase Storage:`,
        error
      )

      return ""
    }
  }

  // =====================================================
  // LOAD ALL THREE IMAGES
  // =====================================================

  const loadSubmissionImages = async (
    submission
  ) => {
    setImagesLoading(true)

    setResolvedImages({
      before: "",
      after: "",
      action: "",
    })

    try {
      const [
        before,
        after,
        action,
      ] = await Promise.all([
        resolveStorageImage(
          submission,
          "before"
        ),
        resolveStorageImage(
          submission,
          "after"
        ),
        resolveStorageImage(
          submission,
          "action"
        ),
      ])

      setResolvedImages({
        before,
        after,
        action,
      })
    } catch (error) {
      console.error(
        "Failed to load cleanup proof images:",
        error
      )
    } finally {
      setImagesLoading(false)
    }
  }

  // =====================================================
  // VIEW SUBMISSION
  // =====================================================

  const handleViewSubmission = async (
    submission
  ) => {
    setSelectedSubmission(submission)

    await loadSubmissionImages(
      submission
    )
  }

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleCloseModal = () => {
    setSelectedSubmission(null)

    setResolvedImages({
      before: "",
      after: "",
      action: "",
    })

    setImagesLoading(false)
  }

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#176b45]">
            Management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#14231a]">
            Verifications
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review cleanup submissions and verify
            citizen waste activities.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSubmissions}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#176b45] hover:text-[#176b45] disabled:cursor-not-allowed disabled:opacity-60"
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
          ERROR
          ================================================= */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          STATS
          ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Submissions"
          value={totalCount}
          description="All cleanup submissions"
          icon={ShieldCheck}
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          description="Waiting for review"
          icon={Clock3}
        />

        <StatCard
          title="Approved"
          value={approvedCount}
          description="Verified cleanups"
          icon={CheckCircle2}
        />

        <StatCard
          title="Rejected"
          value={rejectedCount}
          description="Declined submissions"
          icon={XCircle}
        />

      </div>

      {/* =================================================
          SEARCH + FILTER
          ================================================= */}

      <div className="rounded-2xl border border-[#dce9e1] bg-white p-4 shadow-sm">

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
              placeholder="Search user, email, terrain, waste..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#176b45] focus:bg-white focus:ring-2 focus:ring-[#176b45]/10"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#176b45]"
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

      {/* =================================================
          SUBMISSIONS
          ================================================= */}

      <div className="overflow-hidden rounded-3xl border border-[#dce9e1] bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-5">

          <h2 className="text-lg font-black text-[#14231a]">
            Verification Queue
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredSubmissions.length} submission
            {filteredSubmissions.length !== 1
              ? "s"
              : ""}{" "}
            found
          </p>

        </div>

        {loading ? (

          <div className="flex min-h-[320px] items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#176b45] border-t-transparent" />

              <p className="text-sm font-medium text-slate-500">
                Loading verification queue...
              </p>

            </div>

          </div>

        ) : filteredSubmissions.length === 0 ? (

          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f4ec] text-[#176b45]">
              <ShieldCheck size={28} />
            </div>

            <h3 className="mt-4 text-lg font-black text-[#14231a]">
              No verification submissions
            </h3>

            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Cleanup submissions will appear here
              when citizens submit their cleanup
              proof.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cleanup
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Waste
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    AI Score
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Submitted
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredSubmissions.map(
                  (submission) => {

                    const statusStyles =
                      getStatusStyles(
                        submission.status
                      )

                    const StatusIcon =
                      statusStyles.icon

                    return (
                      <tr
                        key={
                          submission.id
                        }
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                      >

                        {/* USER */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-bold text-slate-800">
                              {submission.userName ||
                                submission.name ||
                                "Citizen"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {submission.userEmail ||
                                submission.email ||
                                "Email unavailable"}
                            </p>

                          </div>

                        </td>

                        {/* CLEANUP */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-semibold text-slate-700">
                            {submission.terrain ||
                              "Cleanup Mission"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {submission.mode ||
                              "SOLO"}
                          </p>

                        </td>

                        {/* WASTE */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-bold text-slate-700">
                            {submission.wasteKg ??
                              0}{" "}
                            kg
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {submission.bags ??
                              0}{" "}
                            bags
                          </p>

                        </td>

                        {/* AI SCORE */}

                        <td className="px-5 py-4">

                          {submission.verificationScore !=
                          null ? (

                            <span className="font-bold text-[#176b45]">
                              {
                                submission.verificationScore
                              }
                              %
                            </span>

                          ) : (

                            <span className="text-sm text-slate-400">
                              —
                            </span>

                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                              statusStyles.badge,
                            ].join(" ")}
                          >

                            <StatusIcon
                              size={13}
                            />

                            {
                              statusStyles.label
                            }

                          </span>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-500">
                            {formatDate(
                              submission.submittedAt ||
                                submission.createdAt
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              handleViewSubmission(
                                submission
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#176b45] hover:text-[#176b45]"
                          >
                            <Eye size={16} />

                            View
                          </button>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =================================================
          DETAILS MODAL
          ================================================= */}

      {selectedSubmission && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-100 p-6">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#176b45]">
                  Verification Details
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#14231a]">
                  Cleanup Submission
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedSubmission.userName ||
                    "Citizen"}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <XCircle size={20} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="space-y-6 p-6">

              {/* BASIC INFO */}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <InfoBox
                  label="User"
                  value={
                    selectedSubmission.userName ||
                    "Citizen"
                  }
                />

                <InfoBox
                  label="Mode"
                  value={
                    selectedSubmission.mode ||
                    "SOLO"
                  }
                />

                <InfoBox
                  label="Terrain"
                  value={
                    selectedSubmission.terrain ||
                    "Other"
                  }
                />

                <InfoBox
                  label="Waste"
                  value={`${selectedSubmission.wasteKg ?? 0} kg`}
                />

              </div>

              {/* DESCRIPTION */}

              {selectedSubmission.description && (

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {
                      selectedSubmission.description
                    }
                  </p>

                </div>

              )}

              {/* LOCATION */}

              <div className="rounded-2xl border border-[#dce9e1] bg-[#f8fbf9] p-5">

                <p className="text-xs font-bold uppercase tracking-wider text-[#176b45]">
                  Cleanup Location
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {selectedSubmission.location ||
                    selectedSubmission.address ||
                    "Location not available"}
                </p>

              </div>

              {/* PHOTOS */}

              <div>

                <div className="flex items-center gap-2">

                  <ImageIcon
                    size={18}
                    className="text-[#176b45]"
                  />

                  <h3 className="text-lg font-black text-[#14231a]">
                    Cleanup Proof
                  </h3>

                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">

                  {imagesLoading ? (

                    <>
                      <ImageLoading
                        title="Before"
                      />

                      <ImageLoading
                        title="After"
                      />

                      <ImageLoading
                        title="Action"
                      />
                    </>

                  ) : (

                    <>

                      <ProofImage
                        title="Before"
                        src={
                          resolvedImages.before
                        }
                      />

                      <ProofImage
                        title="After"
                        src={
                          resolvedImages.after
                        }
                      />

                      <ProofImage
                        title="Action"
                        src={
                          resolvedImages.action
                        }
                      />

                    </>

                  )}

                </div>

              </div>

              {/* AI RESULT */}

              <div className="rounded-2xl border border-[#dce9e1] bg-white p-5">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      AI Verification
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {selectedSubmission.aiResult ||
                        "AI verification result not available"}
                    </p>

                  </div>

                  {selectedSubmission.verificationScore !=
                    null && (

                    <div className="text-right">

                      <p className="text-3xl font-black text-[#176b45]">
                        {
                          selectedSubmission.verificationScore
                        }
                        %
                      </p>

                      <p className="text-xs text-slate-400">
                        Confidence
                      </p>

                    </div>

                  )}

                </div>

              </div>

              {/* CURRENT STATUS */}

              <div className="rounded-2xl bg-slate-50 p-5">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Status
                </p>

                <p className="mt-2 font-bold text-slate-700">
                  {
                    getStatusStyles(
                      selectedSubmission.status
                    ).label
                  }
                </p>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    updateVerificationStatus(
                      selectedSubmission.id,
                      "rejected"
                    )
                  }
                  disabled={
                    updatingId ===
                    selectedSubmission.id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <XCircle size={17} />

                  {updatingId ===
                  selectedSubmission.id
                    ? "Updating..."
                    : "Reject"}

                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateVerificationStatus(
                      selectedSubmission.id,
                      "approved"
                    )
                  }
                  disabled={
                    updatingId ===
                    selectedSubmission.id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#087f47] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <CheckCircle2 size={17} />

                  {updatingId ===
                  selectedSubmission.id
                    ? "Updating..."
                    : "Approve"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

// =======================================================
// STAT CARD
// =======================================================

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-3xl border border-[#dce9e1] bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-[#14231a]">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f4ec] text-[#176b45]">
          <Icon size={21} />
        </div>

      </div>

    </div>
  )
}

// =======================================================
// INFO BOX
// =======================================================

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-slate-700">
        {value}
      </p>

    </div>
  )
}

// =======================================================
// IMAGE LOADING
// =======================================================

function ImageLoading({
  title,
}) {
  return (
    <div>

      <p className="mb-2 text-sm font-bold text-slate-700">
        {title}
      </p>

      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">

        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#176b45] border-t-transparent" />

        <p className="mt-3 text-xs font-semibold text-slate-400">
          Loading photo...
        </p>

      </div>

    </div>
  )
}

// =======================================================
// PROOF IMAGE
// =======================================================

function ProofImage({
  title,
  src,
}) {
  const [imageError, setImageError] =
    useState(false)

  useEffect(() => {
    setImageError(false)
  }, [src])

  return (
    <div>

      <p className="mb-2 text-sm font-bold text-slate-700">
        {title}
      </p>

      {src && !imageError ? (

        <img
          src={src}
          alt={`${title} cleanup proof`}
          className="h-48 w-full rounded-2xl border border-slate-200 object-cover"
          onError={() => {
            setImageError(true)
          }}
        />

      ) : (

        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">

          <ImageIcon
            size={28}
            className="text-slate-300"
          />

          <p className="mt-2 text-xs font-semibold text-slate-400">
            {src
              ? "Unable to load photo"
              : "Photo not available"}
          </p>

        </div>

      )}

    </div>
  )
}

export default Verifications