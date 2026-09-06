import { useEffect, useMemo, useState } from "react"

import {
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore"

import { db } from "../../src/services/firebase"

function Vendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  /* =====================================================
     LOAD VENDORS FROM FIRESTORE
     ===================================================== */

  const loadVendors = async () => {
    try {
      setLoading(true)
      setError("")

      const vendorsQuery = query(
        collection(db, "vendorApplications"),
        orderBy("submittedAt", "desc")
      )

      const snapshot = await getDocs(vendorsQuery)

      const vendorList = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }))

      setVendors(vendorList)
    } catch (err) {
      console.error(
        "Failed to load vendor applications:",
        err
      )

      setError(
        "Vendor applications load nahi ho paaye. Firestore rules ya collection check karo."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVendors()
  }, [])

  /* =====================================================
     FILTER
     ===================================================== */

  const filteredVendors = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return vendors.filter((vendor) => {
      const businessName = String(
        vendor.businessName || ""
      ).toLowerCase()

      const ownerName = String(
        vendor.ownerName ||
          vendor.contactPerson ||
          ""
      ).toLowerCase()

      const email = String(
        vendor.email || ""
      ).toLowerCase()

      const city = String(
        vendor.city || ""
      ).toLowerCase()

      const facilityType = String(
        vendor.facilityType || ""
      ).toLowerCase()

      const matchesSearch =
        !searchValue ||
        businessName.includes(searchValue) ||
        ownerName.includes(searchValue) ||
        email.includes(searchValue) ||
        city.includes(searchValue) ||
        facilityType.includes(searchValue)

      const matchesStatus =
        statusFilter === "all" ||
        vendor.status === statusFilter

      return (
        matchesSearch &&
        matchesStatus
      )
    })
  }, [
    vendors,
    search,
    statusFilter,
  ])

  /* =====================================================
     COUNTS
     ===================================================== */

  const totalVendors = vendors.length

  const pendingVendors = vendors.filter(
    (vendor) =>
      vendor.status === "pending"
  ).length

  const approvedVendors = vendors.filter(
    (vendor) =>
      vendor.status === "approved"
  ).length

  const rejectedVendors = vendors.filter(
    (vendor) =>
      vendor.status === "rejected"
  ).length

  /* =====================================================
     UPDATE VENDOR STATUS
     
     APPROVE:
     vendorApplications → approved
     facilities → create/update active facility

     REJECT:
     vendorApplications → rejected
     ===================================================== */

  const updateVendorStatus = async (
    vendorId,
    status
  ) => {
    try {
      setUpdatingId(vendorId)
      setError("")

      const vendor = vendors.find(
        (item) => item.id === vendorId
      )

      if (!vendor) {
        throw new Error(
          "Vendor application not found."
        )
      }

      /* =================================================
         REJECT VENDOR
         ================================================= */

      if (status === "rejected") {
        await updateDoc(
          doc(
            db,
            "vendorApplications",
            vendorId
          ),
          {
            status: "rejected",
            verified: false,
            reviewedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        )
      }

      /* =================================================
         APPROVE VENDOR

         One batch:
         1. Application becomes approved
         2. Facility becomes active

         Facility document ID = vendor application ID.
         This prevents duplicate facilities.
         ================================================= */

      if (status === "approved") {
        const batch = writeBatch(db)

        const applicationRef = doc(
          db,
          "vendorApplications",
          vendorId
        )

        const facilityRef = doc(
          db,
          "facilities",
          vendorId
        )

        /* ---------------------------------------------
           Update vendor application
           --------------------------------------------- */

        batch.update(applicationRef, {
          status: "approved",
          verified: true,
          reviewedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        /* ---------------------------------------------
           Create / update facility
           --------------------------------------------- */

        batch.set(
          facilityRef,
          {
            applicationId: vendorId,

            businessName:
              vendor.businessName || "",

            ownerName:
              vendor.ownerName || "",

            email:
              vendor.email || "",

            phone:
              vendor.phone || "",

            facilityType:
              vendor.facilityType || "",

            address:
              vendor.address || "",

            city:
              vendor.city || "",

            state:
              vendor.state || "",

            pincode:
              vendor.pincode || "",

            latitude:
              vendor.latitude ?? null,

            longitude:
              vendor.longitude ?? null,

            acceptedWaste:
              Array.isArray(
                vendor.acceptedWaste
              )
                ? vendor.acceptedWaste
                : [],

            description:
              vendor.description || "",

            registrationNumber:
              vendor.registrationNumber || "",

            /* Facility is now available */
            status: "active",

            /* Helpful for MRF / maps */
            verified: true,

            source:
              "Approved Vendor",

            createdAt:
              vendor.createdAt ||
              vendor.submittedAt ||
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        )

        await batch.commit()
      }

      /* =================================================
         UPDATE LOCAL UI
         ================================================= */

      setVendors((currentVendors) =>
        currentVendors.map((vendorItem) =>
          vendorItem.id === vendorId
            ? {
                ...vendorItem,
                status,
                verified:
                  status === "approved",
                reviewedAt:
                  new Date(),
              }
            : vendorItem
        )
      )

      setSelectedVendor(null)
    } catch (err) {
      console.error(
        "Failed to update vendor status:",
        err
      )

      setError(
        err?.message ||
          "Vendor status update nahi ho paaya. Please try again."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  /* =====================================================
     DATE FORMAT
     ===================================================== */

  const formatDate = (value) => {
    if (!value) {
      return "—"
    }

    try {
      const date =
        typeof value?.toDate === "function"
          ? value.toDate()
          : new Date(value)

      if (Number.isNaN(date.getTime())) {
        return "—"
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    } catch {
      return "—"
    }
  }

  /* =====================================================
     STATUS STYLE
     ===================================================== */

  const getStatusStyle = (status) => {
    if (status === "approved") {
      return "bg-emerald-50 text-emerald-700"
    }

    if (status === "pending") {
      return "bg-amber-50 text-amber-700"
    }

    return "bg-red-50 text-red-700"
  }

  const getStatusLabel = (status) => {
    if (status === "approved") {
      return "Approved"
    }

    if (status === "pending") {
      return "Pending"
    }

    if (status === "rejected") {
      return "Rejected"
    }

    return "Unknown"
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#176b45]">
            Management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#14231a]">
            Vendors
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review and manage vendor applications.
          </p>
        </div>

        <button
          type="button"
          onClick={loadVendors}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#0b8f4d] hover:text-[#087f47] disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          STATS
          ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Applications
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {totalVendors}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                All vendor applications
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
              <Building2 size={22} />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {pendingVendors}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Waiting for review
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={22} />
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Approved
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {approvedVendors}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Active vendors
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Rejected
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {rejectedVendors}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Declined applications
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <XCircle size={22} />
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================
          SEARCH + FILTER
          ===================================================== */}

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
              placeholder="Search vendor, owner, email, city..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0b8f4d] focus:bg-white focus:ring-2 focus:ring-[#0b8f4d]/10"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b8f4d] focus:bg-white"
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

      {/* =====================================================
          TABLE
          ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#dce9e1] bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <h2 className="text-lg font-black text-[#14231a]">
            Vendor Applications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredVendors.length} application
            {filteredVendors.length !== 1
              ? "s"
              : ""}{" "}
            found
          </p>

        </div>

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0b8f4d] border-t-transparent" />

              <p className="text-sm font-medium text-slate-500">
                Loading vendor applications...
              </p>

            </div>

          </div>

        ) : filteredVendors.length === 0 ? (

          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f4ec] text-[#087f47]">
              <Building2 size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#14231a]">
              No vendor applications found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              New vendor applications will appear here
              after registration.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Vendor
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Facility
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredVendors.map(
                  (vendor) => (

                    <tr
                      key={vendor.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                    >

                      {/* Vendor */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
                            <Building2 size={19} />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-bold text-slate-800">
                              {vendor.businessName ||
                                "Unnamed Facility"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              ID: {vendor.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Contact */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-slate-700">
                          {vendor.ownerName ||
                            "—"}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">

                          <Mail size={13} />

                          <span>
                            {vendor.email ||
                              "No email"}
                          </span>

                        </div>

                      </td>

                      {/* Location */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <MapPin
                            size={15}
                            className="text-[#176b45]"
                          />

                          <span>
                            {vendor.city ||
                              "—"}

                            {vendor.state
                              ? `, ${vendor.state}`
                              : ""}
                          </span>

                        </div>

                      </td>

                      {/* Facility */}

                      <td className="px-5 py-4">

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {vendor.facilityType ||
                            "—"}
                        </span>

                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">

                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                            getStatusStyle(
                              vendor.status
                            ),
                          ].join(" ")}
                        >

                          {vendor.status ===
                            "approved" && (
                            <CheckCircle2
                              size={13}
                            />
                          )}

                          {vendor.status ===
                            "pending" && (
                            <Clock3
                              size={13}
                            />
                          )}

                          {vendor.status ===
                            "rejected" && (
                            <XCircle
                              size={13}
                            />
                          )}

                          {getStatusLabel(
                            vendor.status
                          )}

                        </span>

                      </td>

                      {/* Action */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedVendor(
                                vendor
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#0b8f4d] hover:text-[#087f47]"
                          >
                            <Eye size={14} />
                            View
                          </button>

                          {vendor.status ===
                            "pending" && (
                            <>
                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  vendor.id
                                }
                                onClick={() =>
                                  updateVendorStatus(
                                    vendor.id,
                                    "approved"
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b8f4d] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#087f47] disabled:opacity-50"
                              >
                                <CheckCircle2
                                  size={14}
                                />

                                Approve
                              </button>

                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  vendor.id
                                }
                                onClick={() =>
                                  updateVendorStatus(
                                    vendor.id,
                                    "rejected"
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                <XCircle
                                  size={14}
                                />

                                Reject
                              </button>
                            </>
                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          DETAILS MODAL
          ===================================================== */}

      {selectedVendor && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-100 p-6">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#176b45]">
                  Vendor Application
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#14231a]">
                  {selectedVendor.businessName ||
                    "Vendor Details"}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedVendor(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <XCircle size={18} />
              </button>

            </div>

            {/* Details */}

            <div className="grid gap-4 p-6 sm:grid-cols-2">

              <Detail
                label="Contact Person"
                value={
                  selectedVendor.ownerName
                }
              />

              <Detail
                label="Email"
                value={
                  selectedVendor.email
                }
              />

              <Detail
                label="Phone"
                value={
                  selectedVendor.phone
                }
              />

              <Detail
                label="Facility Type"
                value={
                  selectedVendor.facilityType
                }
              />

              <Detail
                label="City"
                value={
                  selectedVendor.city
                }
              />

              <Detail
                label="State"
                value={
                  selectedVendor.state
                }
              />

              <Detail
                label="PIN Code"
                value={
                  selectedVendor.pincode
                }
              />

              <Detail
                label="Submitted"
                value={formatDate(
                  selectedVendor.submittedAt
                )}
              />

              <div className="sm:col-span-2">

                <Detail
                  label="Address"
                  value={
                    selectedVendor.address
                  }
                />

              </div>

              <div className="sm:col-span-2">

                <p className="text-xs font-semibold text-slate-400">
                  Accepted Waste
                </p>

                <div className="mt-2 flex flex-wrap gap-2">

                  {Array.isArray(
                    selectedVendor.acceptedWaste
                  ) &&
                  selectedVendor
                    .acceptedWaste
                    .length > 0 ? (

                    selectedVendor.acceptedWaste.map(
                      (waste) => (

                        <span
                          key={waste}
                          className="rounded-full bg-[#e6f4ec] px-3 py-1 text-xs font-bold text-[#087f47]"
                        >
                          {waste}
                        </span>

                      )
                    )

                  ) : (

                    <span className="text-sm text-slate-500">
                      No waste types listed
                    </span>

                  )}

                </div>

              </div>

              <div className="sm:col-span-2">

                <Detail
                  label="Description"
                  value={
                    selectedVendor.description ||
                    "No description provided."
                  }
                />

              </div>

              <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4">

                <p className="text-xs font-semibold text-slate-400">
                  Application Status
                </p>

                <span
                  className={[
                    "mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                    getStatusStyle(
                      selectedVendor.status
                    ),
                  ].join(" ")}
                >
                  {getStatusLabel(
                    selectedVendor.status
                  )}
                </span>

              </div>

            </div>

            {/* Footer */}

            <div className="flex flex-col gap-2 border-t border-slate-100 p-6 sm:flex-row sm:justify-end">

              {selectedVendor.status ===
                "pending" && (
                <>

                  <button
                    type="button"
                    disabled={
                      updatingId ===
                      selectedVendor.id
                    }
                    onClick={() =>
                      updateVendorStatus(
                        selectedVendor.id,
                        "rejected"
                      )
                    }
                    className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject Vendor
                  </button>

                  <button
                    type="button"
                    disabled={
                      updatingId ===
                      selectedVendor.id
                    }
                    onClick={() =>
                      updateVendorStatus(
                        selectedVendor.id,
                        "approved"
                      )
                    }
                    className="rounded-xl bg-[#0b8f4d] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#087f47] disabled:opacity-50"
                  >
                    Approve Vendor
                  </button>

                </>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedVendor(null)
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

/* =====================================================
   DETAIL COMPONENT
   ===================================================== */

function Detail({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-[#f8fbf9] p-4">

      <p className="text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value || "—"}
      </p>

    </div>
  )
}

export default Vendors