import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  getFundingRequests,
  updateFundingRequestStatus,
} from "../services/fundingAdminService"

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
  "More Information",
]

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  "More Information": "bg-purple-50 text-purple-700 border-purple-200",
}

function getDateValue(value) {
  if (!value) return null

  if (typeof value?.toDate === "function") {
    return value.toDate()
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value) {
  const date = getDateValue(value)

  if (!date) return "—"

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatAmount(value) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) return "₹0"

  return `₹${amount.toLocaleString("en-IN")}`
}

function getApplicantName(request) {
  return (
    request?.applicant?.fullName ||
    request?.fullName ||
    "Unnamed applicant"
  )
}

function getApplicantType(request) {
  return (
    request?.applicant?.applicantType ||
    request?.applicantType ||
    "Applicant"
  )
}

function getProjectTitle(request) {
  return (
    request?.project?.projectTitle ||
    request?.projectTitle ||
    "Untitled project"
  )
}

function getRequestedAmount(request) {
  return (
    request?.project?.amountRequested ??
    request?.amountRequested ??
    0
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
        STATUS_STYLES[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status || "Pending"}
    </span>
  )
}

function AdminFundingRequests() {
  const navigate = useNavigate()

  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [remark, setRemark] = useState("")
  const [approvedAmount, setApprovedAmount] = useState("")

  const loadRequests = async () => {
    setLoading(true)
    setError("")

    try {
      const data = await getFundingRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch (loadError) {
      console.error(
        "Failed to load funding requests:",
        loadError
      )

      setError(
        loadError?.message ||
          "Unable to load funding requests."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    const queryText = search.trim().toLowerCase()

    return requests.filter((request) => {
      const status = request?.status || "Pending"

      if (
        statusFilter !== "All" &&
        status !== statusFilter
      ) {
        return false
      }

      if (!queryText) return true

      const searchableText = [
        getApplicantName(request),
        getApplicantType(request),
        getProjectTitle(request),
        request?.applicant?.email,
        request?.applicant?.mobile,
        request?.project?.projectType,
        request?.project?.exactLocation,
        request?.id,
        request?.requestId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchableText.includes(queryText)
    })
  }, [requests, statusFilter, search])

  const counts = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(
        (item) => item.status === "Pending"
      ).length,
      review: requests.filter(
        (item) => item.status === "Under Review"
      ).length,
      approved: requests.filter(
        (item) => item.status === "Approved"
      ).length,
      rejected: requests.filter(
        (item) => item.status === "Rejected"
      ).length,
    }
  }, [requests])

  const openRequest = (request) => {
    setSelectedRequest(request)
    setRemark(request?.adminRemark || "")
    setApprovedAmount(
      request?.approvedAmount != null
        ? String(request.approvedAmount)
        : ""
    )
    setError("")
  }

  const closeRequest = () => {
    if (updating) return

    setSelectedRequest(null)
    setRemark("")
    setApprovedAmount("")
  }

  const changeStatus = async (status) => {
    if (!selectedRequest?.id || updating) return

    if (
      status === "Approved" &&
      (!approvedAmount ||
        Number(approvedAmount) <= 0)
    ) {
      setError(
        "Enter a valid approved amount before approving."
      )
      return
    }

    setUpdating(true)
    setError("")

    try {
      await updateFundingRequestStatus(
        selectedRequest.id,
        status,
        remark,
        status === "Approved"
          ? approvedAmount
          : null
      )

      const updatedRequest = {
        ...selectedRequest,
        status,
        adminRemark: remark.trim(),
        ...(status === "Approved"
          ? {
              approvedAmount:
                Number(approvedAmount),
            }
          : {}),
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === selectedRequest.id
            ? updatedRequest
            : request
        )
      )

      setSelectedRequest(updatedRequest)
    } catch (updateError) {
      console.error(
        "Failed to update funding request:",
        updateError
      )

      setError(
        updateError?.message ||
          "Unable to update funding request."
      )
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6faf7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-3 text-sm font-semibold text-[#334b62] transition hover:text-[#0b8f4d]"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0b8f4d]">
              <ShieldCheck size={15} />
              Admin Panel
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#14231a] sm:text-4xl">
              Green Fund Requests
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Review applicants, verify project information,
              approve funding and record admin decisions.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Total", counts.total, FileText],
            ["Pending", counts.pending, Clock3],
            ["Under Review", counts.review, Search],
            ["Approved", counts.approved, CheckCircle2],
            ["Rejected", counts.rejected, XCircle],
          ].map(([label, value, Icon]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d]">
                <Icon size={19} />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
              </p>

              <p className="mt-1 text-2xl font-black text-slate-800">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search applicant, project, email, mobile..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#0b8f4d] focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b8f4d]"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "All"
                  ? "All statuses"
                  : status}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                <Loader2
                  size={20}
                  className="animate-spin text-[#0b8f4d]"
                />
                Loading funding requests...
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText size={25} />
              </div>

              <h2 className="text-lg font-bold text-slate-800">
                No funding requests found
              </h2>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Try another search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      Applicant
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      Project
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      Requested
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      Submitted
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-5">
                        <p className="font-bold text-slate-800">
                          {getApplicantName(request)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {getApplicantType(request)}
                        </p>
                      </td>

                      <td className="max-w-[300px] px-5 py-5">
                        <p className="truncate font-semibold text-slate-700">
                          {getProjectTitle(request)}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {request?.project?.projectType ||
                            "Environmental project"}
                        </p>
                      </td>

                      <td className="px-5 py-5 font-bold text-slate-800">
                        {formatAmount(
                          getRequestedAmount(request)
                        )}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-500">
                        {formatDate(request.createdAt)}
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge
                          status={
                            request.status || "Pending"
                          }
                        />
                      </td>

                      <td className="px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openRequest(request)
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0b8f4d] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#087b42]"
                        >
                          <Eye size={16} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0b8f4d]">
                  Funding Request
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-800">
                  {getApplicantName(selectedRequest)}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeRequest}
                disabled={updating}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-145px)] overflow-y-auto p-5 sm:p-7">
              <div className="grid gap-5 lg:grid-cols-2">

                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 font-black text-slate-800">
                    Applicant
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Info
                      label="Full name"
                      value={getApplicantName(selectedRequest)}
                    />

                    <Info
                      label="Applicant type"
                      value={getApplicantType(selectedRequest)}
                    />

                    <Info
                      label="Email"
                      value={
                        selectedRequest?.applicant?.email ||
                        "—"
                      }
                    />

                    <Info
                      label="Mobile"
                      value={
                        selectedRequest?.applicant?.mobile ||
                        "—"
                      }
                    />

                    <Info
                      label="City / State"
                      value={[
                        selectedRequest?.applicant?.city,
                        selectedRequest?.applicant?.state,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    />

                    <Info
                      label="Organization"
                      value={
                        selectedRequest?.applicant
                          ?.organizationName || "—"
                      }
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 font-black text-slate-800">
                    Project
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Info
                      label="Project title"
                      value={getProjectTitle(selectedRequest)}
                    />

                    <Info
                      label="Project type"
                      value={
                        selectedRequest?.project
                          ?.projectType || "—"
                      }
                    />

                    <Info
                      label="Requested amount"
                      value={formatAmount(
                        getRequestedAmount(
                          selectedRequest
                        )
                      )}
                    />

                    <Info
                      label="Approved amount"
                      value={
                        selectedRequest?.approvedAmount != null
                          ? formatAmount(
                              selectedRequest.approvedAmount
                            )
                          : "Not approved"
                      }
                    />

                    <Info
                      label="Start date"
                      value={
                        selectedRequest?.project
                          ?.startDate || "—"
                      }
                    />

                    <Info
                      label="Completion date"
                      value={
                        selectedRequest?.project
                          ?.completionDate || "—"
                      }
                    />

                    <div className="sm:col-span-2">
                      <Info
                        label="Exact location"
                        value={
                          selectedRequest?.project
                            ?.exactLocation || "—"
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 font-black text-slate-800">
                    Reason & Fund Usage
                  </h3>

                  <div className="space-y-4">
                    <Info
                      label="Detailed reason"
                      value={
                        selectedRequest?.project
                          ?.detailedReason || "—"
                      }
                    />

                    <Info
                      label="How funds will be used"
                      value={
                        selectedRequest?.project
                          ?.fundUsage || "—"
                      }
                    />

                    <Info
                      label="Expected beneficiaries"
                      value={
                        selectedRequest?.project
                          ?.expectedBeneficiaries || "—"
                      }
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 font-black text-slate-800">
                    Previous Work
                  </h3>

                  <div className="space-y-4">
                    <Info
                      label="Previous work"
                      value={
                        selectedRequest?.previousWork
                          ?.details || "—"
                      }
                    />

                    <Info
                      label="Previous funding received"
                      value={
                        selectedRequest?.previousWork
                          ?.fundingReceived || "—"
                      }
                    />

                    <Info
                      label="Previous results"
                      value={
                        selectedRequest?.previousWork
                          ?.results || "—"
                      }
                    />

                    <Info
                      label="Social / project links"
                      value={
                        selectedRequest?.previousWork
                          ?.socialLinks || "—"
                      }
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 font-black text-slate-800">
                    Verification Documents
                  </h3>

                  <div className="space-y-2">
                    {Object.entries(
                      selectedRequest?.verification
                        ?.files || {}
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm font-semibold capitalize text-slate-600">
                          {key.replace(
                            /([A-Z])/g,
                            " $1"
                          )}
                        </span>

                        <span className="max-w-[55%] truncate text-xs font-medium text-slate-400">
                          {value || "Not provided"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    Identity documents, ID numbers, signatures
                    and thumb impressions must remain restricted
                    to authorized reviewers.
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 font-black text-slate-800">
                    Video & Budget
                  </h3>

                  <Info
                    label="Google Drive video"
                    value={
                      selectedRequest?.video
                        ?.driveLink || "Not provided"
                    }
                  />

                  <div className="mt-4">
                    <Info
                      label="Uploaded video"
                      value={
                        selectedRequest?.video
                          ?.uploadedFile || "Not provided"
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <Info
                      label="Budget items"
                      value={
                        Array.isArray(
                          selectedRequest?.budget
                        ) &&
                        selectedRequest.budget.length > 0
                          ? selectedRequest.budget
                              .map((item) => {
                                if (
                                  typeof item ===
                                  "string"
                                ) {
                                  return item
                                }

                                return `${item?.name || "Item"} — ${formatAmount(item?.amount || 0)}`
                              })
                              .join("\n")
                          : "No budget breakup provided"
                      }
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5 lg:col-span-2">
                  <h3 className="mb-4 font-black text-slate-800">
                    Admin Decision
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Approved amount
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={approvedAmount}
                        onChange={(event) =>
                          setApprovedAmount(
                            event.target.value
                          )
                        }
                        placeholder="Enter approved amount"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0b8f4d]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Admin remark
                      </label>

                      <textarea
                        value={remark}
                        onChange={(event) =>
                          setRemark(event.target.value)
                        }
                        rows={3}
                        placeholder="Add review notes or reason..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b8f4d]"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <ActionButton
                      label="Under Review"
                      onClick={() =>
                        changeStatus(
                          "Under Review"
                        )
                      }
                      disabled={updating}
                    />

                    <ActionButton
                      label="More Information"
                      onClick={() =>
                        changeStatus(
                          "More Information"
                        )
                      }
                      disabled={updating}
                    />

                    <ActionButton
                      label="Approve"
                      onClick={() =>
                        changeStatus("Approved")
                      }
                      disabled={updating}
                      success
                    />

                    <ActionButton
                      label="Reject"
                      onClick={() =>
                        changeStatus("Rejected")
                      }
                      disabled={updating}
                      danger
                    />

                    {updating && (
                      <span className="inline-flex items-center gap-2 px-2 text-sm font-semibold text-slate-500">
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Updating...
                      </span>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p className="whitespace-pre-line break-words text-sm leading-6 text-slate-700">
        {value || "—"}
      </p>
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  disabled,
  success = false,
  danger = false,
}) {
  const className = success
    ? "bg-[#0b8f4d] text-white hover:bg-[#087b42]"
    : danger
      ? "bg-red-600 text-white hover:bg-red-700"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {label}
    </button>
  )
}

export default AdminFundingRequests
