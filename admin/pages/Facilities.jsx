import { useEffect, useMemo, useState } from "react"

import {
  Building2,
  CheckCircle2,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore"

import { db } from "../../src/services/firebase"


function Facilities() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFacility, setSelectedFacility] =
    useState(null)


  /* =====================================================
     LOAD FACILITIES FROM FIRESTORE
     ===================================================== */

  const loadFacilities = async () => {
    try {
      setLoading(true)
      setError("")

      const facilitiesQuery = query(
        collection(db, "facilities"),
        orderBy("createdAt", "desc")
      )

      const snapshot =
        await getDocs(facilitiesQuery)

      const facilityList =
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))

      setFacilities(facilityList)
    } catch (err) {
      console.error(
        "Failed to load facilities:",
        err
      )

      setError(
        "Facilities load nahi ho paayi. Firestore rules ya facilities collection check karo."
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadFacilities()
  }, [])


  /* =====================================================
     FILTER FACILITIES
     ===================================================== */

  const filteredFacilities = useMemo(() => {
    const value =
      search.trim().toLowerCase()

    return facilities.filter(
      (facility) => {
        const name =
          String(
            facility.name ||
              facility.businessName ||
              ""
          ).toLowerCase()

        const type =
          String(
            facility.facilityType ||
              facility.type ||
              ""
          ).toLowerCase()

        const city =
          String(
            facility.city || ""
          ).toLowerCase()

        const state =
          String(
            facility.state || ""
          ).toLowerCase()

        const email =
          String(
            facility.email || ""
          ).toLowerCase()

        const status =
          String(
            facility.status || ""
          ).toLowerCase()

        const matchesSearch =
          !value ||
          name.includes(value) ||
          type.includes(value) ||
          city.includes(value) ||
          state.includes(value) ||
          email.includes(value)

        const matchesStatus =
          statusFilter === "all" ||
          status === statusFilter

        return (
          matchesSearch &&
          matchesStatus
        )
      }
    )
  }, [
    facilities,
    search,
    statusFilter,
  ])


  /* =====================================================
     COUNTS
     ===================================================== */

  const totalFacilities =
    facilities.length

  const activeFacilities =
    facilities.filter(
      (facility) =>
        facility.status ===
          "active" ||
        facility.status ===
          "approved" ||
        facility.status ===
          undefined
    ).length

  const inactiveFacilities =
    facilities.filter(
      (facility) =>
        facility.status ===
        "inactive"
    ).length


  /* =====================================================
     DATE FORMAT
     ===================================================== */

  const formatDate = (value) => {
    if (!value) {
      return "—"
    }

    try {
      const date =
        typeof value?.toDate ===
        "function"
          ? value.toDate()
          : new Date(value)

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
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

  const getStatusStyle = (
    status
  ) => {
    if (
      status === "inactive"
    ) {
      return "bg-red-50 text-red-700"
    }

    if (
      status === "approved"
    ) {
      return "bg-emerald-50 text-emerald-700"
    }

    return "bg-green-50 text-green-700"
  }


  const getStatusLabel = (
    status
  ) => {
    if (
      status === "inactive"
    ) {
      return "Inactive"
    }

    if (
      status === "approved"
    ) {
      return "Approved"
    }

    return "Active"
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
            Facilities
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage approved waste recovery facilities
            available across Eco Clean Hub.
          </p>

        </div>


        <button
          type="button"
          onClick={loadFacilities}
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {/* Total */}

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Facilities
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {totalFacilities}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Facilities in Firestore
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#087f47]">
              <Building2 size={22} />
            </div>

          </div>

        </div>


        {/* Active */}

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Active Facilities
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {activeFacilities}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Currently available
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>

          </div>

        </div>


        {/* Inactive */}

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Inactive Facilities
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {inactiveFacilities}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Currently unavailable
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

          {/* Search */}

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
              placeholder="Search facility, type, city, email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0b8f4d] focus:bg-white focus:ring-2 focus:ring-[#0b8f4d]/10"
            />

          </div>


          {/* Status */}

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

            <option value="active">
              Active
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="inactive">
              Inactive
            </option>

          </select>

        </div>

      </div>


      {/* =====================================================
          FACILITIES TABLE
          ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#dce9e1] bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <h2 className="text-lg font-black text-[#14231a]">
            Registered Facilities
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredFacilities.length} facilit
            {filteredFacilities.length !== 1
              ? "ies"
              : "y"}{" "}
            found
          </p>

        </div>


        {/* =====================================================
            LOADING
            ===================================================== */}

        {loading ? (

          <div className="flex min-h-[320px] items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0b8f4d] border-t-transparent" />

              <p className="text-sm font-medium text-slate-500">
                Loading facilities...
              </p>

            </div>

          </div>

        ) : filteredFacilities.length === 0 ? (

          /* ===================================================
             EMPTY
             =================================================== */

          <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f4ec] text-[#087f47]">
              <Building2 size={25} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#14231a]">
              No facilities found
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              Approved vendor facilities will appear
              here once they are added to the Firestore
              facilities collection.
            </p>

          </div>

        ) : (

          /* ===================================================
             TABLE
             =================================================== */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Facility
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Type
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

                {filteredFacilities.map(
                  (facility) => {

                    const name =
                      facility.name ||
                      facility.businessName ||
                      "Unnamed Facility"

                    const type =
                      facility.facilityType ||
                      facility.type ||
                      "Waste Facility"

                    const status =
                      facility.status ||
                      "active"

                    return (

                      <tr
                        key={facility.id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                      >

                        {/* Facility */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
                              <Building2 size={19} />
                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-bold text-slate-800">
                                {name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID: {facility.id}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Contact */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-semibold text-slate-700">
                            {facility.ownerName ||
                              facility.contactPerson ||
                              "—"}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">

                            <Mail size={13} />

                            <span>
                              {facility.email ||
                                "No email"}
                            </span>

                          </div>

                        </td>


                        {/* Location */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <MapPin
                              size={15}
                              className="shrink-0 text-[#176b45]"
                            />

                            <span>

                              {facility.city ||
                                "—"}

                              {facility.state
                                ? `, ${facility.state}`
                                : ""}

                            </span>

                          </div>

                        </td>


                        {/* Type */}

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">

                            {type}

                          </span>

                        </td>


                        {/* Status */}

                        <td className="px-5 py-4">

                          <span
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                              getStatusStyle(
                                status
                              ),
                            ].join(" ")}
                          >

                            <CheckCircle2
                              size={13}
                            />

                            {getStatusLabel(
                              status
                            )}

                          </span>

                        </td>


                        {/* Action */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedFacility(
                                  facility
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#0b8f4d] hover:text-[#087f47]"
                            >

                              <Eye size={14} />

                              View

                            </button>

                          </div>

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


      {/* =====================================================
          FACILITY DETAILS MODAL
          ===================================================== */}

      {selectedFacility && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-100 p-6">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#176b45]">
                  Facility Details
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#14231a]">

                  {selectedFacility.name ||
                    selectedFacility.businessName ||
                    "Facility"}

                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedFacility(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >

                <XCircle size={18} />

              </button>

            </div>


            {/* Details */}

            <div className="grid gap-4 p-6 sm:grid-cols-2">

              <Detail
                label="Facility Name"
                value={
                  selectedFacility.name ||
                  selectedFacility.businessName
                }
              />

              <Detail
                label="Facility Type"
                value={
                  selectedFacility.facilityType ||
                  selectedFacility.type
                }
              />

              <Detail
                label="Contact Person"
                value={
                  selectedFacility.ownerName ||
                  selectedFacility.contactPerson
                }
              />

              <Detail
                label="Email"
                value={
                  selectedFacility.email
                }
              />

              <Detail
                label="Phone"
                value={
                  selectedFacility.phone
                }
              />

              <Detail
                label="City"
                value={
                  selectedFacility.city
                }
              />

              <Detail
                label="State"
                value={
                  selectedFacility.state
                }
              />

              <Detail
                label="PIN Code"
                value={
                  selectedFacility.pincode
                }
              />

              <div className="sm:col-span-2">

                <Detail
                  label="Address"
                  value={
                    selectedFacility.address
                  }
                />

              </div>


              {/* Coordinates */}

              <Detail
                label="Latitude"
                value={
                  selectedFacility.latitude
                }
              />

              <Detail
                label="Longitude"
                value={
                  selectedFacility.longitude
                }
              />


              {/* Accepted Waste */}

              <div className="sm:col-span-2">

                <p className="text-xs font-semibold text-slate-400">
                  Accepted Waste
                </p>

                <div className="mt-2 flex flex-wrap gap-2">

                  {Array.isArray(
                    selectedFacility.acceptedWaste
                  ) &&
                  selectedFacility
                    .acceptedWaste
                    .length > 0 ? (

                    selectedFacility.acceptedWaste.map(
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


              {/* Description */}

              <div className="sm:col-span-2">

                <Detail
                  label="Description"
                  value={
                    selectedFacility.description ||
                    "No description provided."
                  }
                />

              </div>


              {/* Status */}

              <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4">

                <p className="text-xs font-semibold text-slate-400">
                  Status
                </p>

                <span
                  className={[
                    "mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                    getStatusStyle(
                      selectedFacility.status ||
                        "active"
                    ),
                  ].join(" ")}
                >

                  {getStatusLabel(
                    selectedFacility.status ||
                      "active"
                  )}

                </span>

              </div>


              {/* Created */}

              <Detail
                label="Created"
                value={formatDate(
                  selectedFacility.createdAt
                )}
              />

            </div>


            {/* Footer */}

            <div className="flex justify-end border-t border-slate-100 p-6">

              <button
                type="button"
                onClick={() =>
                  setSelectedFacility(
                    null
                  )
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


export default Facilities