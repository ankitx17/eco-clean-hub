import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Recycle,
  ShieldCheck,
} from "lucide-react"

import {
  useEffect,
  useState,
} from "react"

import {
  Link,
  useNavigate,
} from "react-router-dom"

import useGeolocation from "../hooks/useGeolocation"

import {
  getNearbyFacilities,
  formatDistance,
} from "../services/mrfService"

/* =========================================================
   FACILITY TYPE LABEL
   ========================================================= */

function getFacilityTypeLabel(
  type
) {
  if (!type) {
    return "Waste Facility"
  }

  const normalized =
    type.toLowerCase()

  if (
    normalized.includes(
      "e-waste"
    ) ||
    normalized.includes(
      "e waste"
    )
  ) {
    return "E-Waste Facility"
  }

  if (
    normalized.includes(
      "dry waste"
    )
  ) {
    return "Dry Waste Centre"
  }

  if (
    normalized.includes(
      "recycling"
    )
  ) {
    return "Recycling Centre"
  }

  if (
    normalized.includes(
      "municipal"
    )
  ) {
    return "Municipal Facility"
  }

  if (
    normalized.includes(
      "collection"
    )
  ) {
    return "Collection Point"
  }

  if (
    normalized.includes(
      "mrf"
    ) ||
    normalized.includes(
      "material recovery"
    )
  ) {
    return "MRF"
  }

  return type
}

/* =========================================================
   FACILITY TYPE BADGE
   ========================================================= */

function getFacilityTypeBadgeClass(
  type
) {
  const label =
    getFacilityTypeLabel(
      type
    )

  if (
    label ===
    "E-Waste Facility"
  ) {
    return "bg-purple-50 text-purple-700 border-purple-100"
  }

  if (
    label ===
    "Recycling Centre"
  ) {
    return "bg-blue-50 text-blue-700 border-blue-100"
  }

  if (
    label ===
    "Dry Waste Centre"
  ) {
    return "bg-amber-50 text-amber-700 border-amber-100"
  }

  if (
    label ===
    "Municipal Facility"
  ) {
    return "bg-slate-100 text-slate-700 border-slate-200"
  }

  if (
    label ===
    "Collection Point"
  ) {
    return "bg-cyan-50 text-cyan-700 border-cyan-100"
  }

  return "bg-green-50 text-green-700 border-green-100"
}

/* =========================================================
   MRF PAGE
   ========================================================= */

function MRF() {
  const navigate =
    useNavigate()

  const {
    location,
    loading:
      locationLoading,
    error:
      locationError,
    getLocation,
    hasLocation,
  } = useGeolocation()

  const [
    nearbyFacilities,
    setNearbyFacilities,
  ] = useState([])

  const [
    facilityLoading,
    setFacilityLoading,
  ] = useState(false)

  const [
    facilityError,
    setFacilityError,
  ] = useState("")

  /* =======================================================
     GET USER LOCATION
     ======================================================= */

  useEffect(() => {
    getLocation()
  }, [getLocation])

  /* =======================================================
     LOAD NEARBY FACILITIES
     ======================================================= */

  useEffect(() => {
    if (!location) {
      setNearbyFacilities([])
      return
    }

    let cancelled = false

    const loadNearbyFacilities =
      async () => {
        setFacilityLoading(true)
        setFacilityError("")

        try {
          const results =
            await getNearbyFacilities(
              location.latitude,
              location.longitude,
              25
            )

          if (!cancelled) {
            setNearbyFacilities(
              results
            )
          }
        } catch (error) {
          console.error(
            "Facility Data Error:",
            error
          )

          if (!cancelled) {
            setFacilityError(
              error.message ||
                "Unable to load nearby waste recovery facilities."
            )

            setNearbyFacilities([])
          }
        } finally {
          if (!cancelled) {
            setFacilityLoading(
              false
            )
          }
        }
      }

    loadNearbyFacilities()

    return () => {
      cancelled = true
    }
  }, [location])

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh =
    async () => {
      setFacilityError("")
      setFacilityLoading(true)

      try {
        await getLocation()
      } finally {
        /*
         * The location effect controls
         * the final facility loading state.
         */
      }
    }

  /* =======================================================
     VIEW ROUTE
     ======================================================= */

  const handleViewRoute =
    (facility) => {
      sessionStorage.setItem(
        "selectedMRF",
        JSON.stringify(
          facility
        )
      )

      navigate(
        `/mrf/route/${facility.id}`
      )
    }

  return (
    <div className="min-h-screen bg-[#f6faf7]">
      {/* ===================================================
          HEADER
         =================================================== */}

      <header className="border-b border-[#e3ece6] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#176b45] transition hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <MapPin
              size={17}
              className="text-[#176b45]"
            />

            Waste Facility Locator
          </div>
        </div>
      </header>

      {/* ===================================================
          MAIN
         =================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        {/* =================================================
            HEADING
           ================================================= */}

        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#cfe1d6] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#176b45]">
            <Recycle size={14} />
            Smart Waste Navigation
          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#14231a] sm:text-4xl">
            Nearby Waste Recovery Facilities
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Find nearby MRFs, recycling centres, e-waste
            facilities, collection points and other waste
            recovery facilities using your current location.
          </p>
        </div>

        {/* =================================================
            LOCATION STATUS
           ================================================= */}

        <section className="mt-8 rounded-3xl border border-[#dce9e1] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
                {locationLoading ? (
                  <LoaderCircle
                    size={21}
                    className="animate-spin"
                  />
                ) : hasLocation ? (
                  <CheckCircle2
                    size={21}
                  />
                ) : (
                  <MapPin size={21} />
                )}
              </div>

              <div>
                <p className="font-bold text-slate-800">
                  {locationLoading
                    ? "Detecting your location..."
                    : hasLocation
                      ? "Using your current location"
                      : "Location unavailable"}
                </p>

                <p className="text-sm text-slate-500">
                  {locationLoading
                    ? "Please wait while we find your position."
                    : hasLocation
                      ? "Searching verified, approved vendor and mapped waste recovery facilities nearby."
                      : "Allow location access to find nearby facilities."}
                </p>
              </div>
            </div>

            {hasLocation &&
              !locationLoading && (
                <button
                  type="button"
                  onClick={
                    handleRefresh
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfe1d6] bg-white px-4 py-2.5 text-sm font-bold text-[#176b45] transition hover:bg-green-50"
                >
                  <RefreshCw
                    size={16}
                  />
                  Refresh Location
                </button>
              )}
          </div>

          {/* =================================================
              LOCATION ERROR
             ================================================= */}

          {!locationLoading &&
            locationError && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="font-semibold text-red-800">
                    Unable to access your
                    location
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {locationError}
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    className="mt-3 text-sm font-bold text-red-700 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

          {/* =================================================
              COORDINATES
             ================================================= */}

          {hasLocation &&
            !locationLoading && (
              <div className="mt-4 rounded-2xl border border-[#e5eee8] bg-[#f8fbf9] p-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                  <span>
                    Latitude:{" "}
                    <strong className="text-slate-700">
                      {location.latitude.toFixed(
                        6
                      )}
                    </strong>
                  </span>

                  <span>
                    Longitude:{" "}
                    <strong className="text-slate-700">
                      {location.longitude.toFixed(
                        6
                      )}
                    </strong>
                  </span>

                  {location.accuracy && (
                    <span>
                      Accuracy:{" "}
                      <strong className="text-slate-700">
                        ±
                        {Math.round(
                          location.accuracy
                        )}
                        m
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            )}
        </section>

        {/* =================================================
            FACILITY CONTENT
           ================================================= */}

        {hasLocation &&
          !locationLoading &&
          !locationError && (
            <section className="mt-10">
              {/* =================================================
                  SECTION HEADER
                 ================================================= */}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#176b45]">
                    Waste Recovery Network
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-[#14231a]">
                    Facilities near you
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Choose the facility that accepts the type
                    of waste you want to dispose of responsibly.
                  </p>
                </div>

                {!facilityLoading &&
                  !facilityError && (
                    <p className="text-sm text-slate-500">
                      Showing{" "}
                      <strong className="text-slate-700">
                        {
                          nearbyFacilities.length
                        }
                      </strong>{" "}
                      facilities
                    </p>
                  )}
              </div>

              {/* =================================================
                  FACILITY TYPES
                 ================================================= */}

              {!facilityLoading &&
                !facilityError &&
                nearbyFacilities.length >
                  0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {[
                      "MRF",
                      "Recycling Centre",
                      "E-Waste Facility",
                      "Dry Waste Centre",
                      "Municipal Facility",
                      "Collection Point",
                    ].map(
                      (type) => (
                        <span
                          key={type}
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getFacilityTypeBadgeClass(type)}`}
                        >
                          {type}
                        </span>
                      )
                    )}
                  </div>
                )}

              {/* =================================================
                  LOADING
                 ================================================= */}

              {facilityLoading && (
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-3xl border border-[#dce9e1] bg-white p-6"
                      >
                        <div className="h-6 w-2/3 rounded-lg bg-slate-100" />

                        <div className="mt-3 h-7 w-32 rounded-full bg-slate-100" />

                        <div className="mt-4 h-4 w-full rounded-lg bg-slate-100" />

                        <div className="mt-2 h-4 w-4/5 rounded-lg bg-slate-100" />

                        <div className="mt-6 flex gap-2">
                          <div className="h-7 w-20 rounded-full bg-slate-100" />
                          <div className="h-7 w-24 rounded-full bg-slate-100" />
                          <div className="h-7 w-20 rounded-full bg-slate-100" />
                        </div>

                        <div className="mt-8 h-10 rounded-xl bg-slate-100" />
                      </div>
                    )
                  )}
                </div>
              )}

              {/* =================================================
                  API ERROR
                 ================================================= */}

              {!facilityLoading &&
                facilityError && (
                  <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={21}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div>
                        <h3 className="font-bold text-amber-900">
                          Unable to load nearby
                          facilities
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-amber-800">
                          {facilityError}
                        </p>

                        <button
                          type="button"
                          onClick={
                            handleRefresh
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#176b45] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#125637]"
                        >
                          <RefreshCw
                            size={16}
                          />
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* =================================================
                  FACILITY CARDS
                 ================================================= */}

              {!facilityLoading &&
                !facilityError &&
                nearbyFacilities.length >
                  0 && (
                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    {nearbyFacilities.map(
                      (
                        facility,
                        index
                      ) => {
                        const typeLabel =
                          getFacilityTypeLabel(
                            facility.type
                          )

                        const badgeClass =
                          getFacilityTypeBadgeClass(
                            facility.type
                          )

                        const isApprovedVendor =
                          facility.sourceType ===
                          "approved-vendor"

                        return (
                          <article
                            key={
                              facility.id
                            }
                            className="rounded-3xl border border-[#dce9e1] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
                          >
                            {/* =================================================
                                CARD TOP
                               ================================================= */}

                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f4ec] text-[#176b45]">
                                  <Recycle
                                    size={23}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-bold text-slate-800">
                                      {
                                        facility.name
                                      }
                                    </h3>

                                    {index ===
                                      0 && (
                                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">
                                        Nearest
                                      </span>
                                    )}
                                  </div>

                                  {/* =================================================
                                      FACILITY TYPE
                                     ================================================= */}

                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span
                                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${badgeClass}`}
                                    >
                                      {
                                        typeLabel
                                      }
                                    </span>

                                    {facility.verified && (
                                      <span className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                                        <ShieldCheck
                                          size={
                                            12
                                          }
                                        />
                                        Verified
                                      </span>
                                    )}

                                    {isApprovedVendor && (
                                      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                                        <Building2Icon />
                                        Approved Vendor
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* =================================================
                                  DISTANCE
                                 ================================================= */}

                              <div className="shrink-0 rounded-xl bg-[#eaf5ef] px-3 py-2 text-right">
                                <p className="text-xs font-semibold text-slate-500">
                                  Distance
                                </p>

                                <p className="text-sm font-black text-[#176b45]">
                                  {formatDistance(
                                    facility.distance
                                  )}
                                </p>
                              </div>
                            </div>

             {/* Address + Vendor Phone */}
{/* Address + Phone */}
<div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-[#f8fbf9] p-3.5">
  {/* Address */}
  <div className="flex min-w-0 items-center gap-2">
    <MapPin
      size={16}
      className="shrink-0 text-[#176b45]"
    />

    <p className="truncate text-sm leading-6 text-slate-600">
      {facility.address ||
        "Address information unavailable"}
    </p>
  </div>

  {/* Phone */}
  {facility.phone && (
    <a
      href={`tel:${facility.phone}`}
      className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#176b45] transition hover:underline"
    >
      <Phone size={16} />
      <span>{facility.phone}</span>
    </a>
  )}
</div>
                            {/* =================================================
                                DIVIDER
                               ================================================= */}

                            <div className="my-5 border-t border-[#edf2ee]" />

                            {/* =================================================
                                ACCEPTED WASTE
                               ================================================= */}

                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Accepted waste
                              </p>

                              {facility
                                .acceptedWaste
                                ?.length >
                              0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {facility.acceptedWaste.map(
                                    (
                                      waste
                                    ) => (
                                      <span
                                        key={
                                          waste
                                        }
                                        className="rounded-full border border-[#dce9e1] bg-[#f7faf8] px-3 py-1.5 text-xs font-semibold text-slate-600"
                                      >
                                        ♻️{" "}
                                        {
                                          waste
                                        }
                                      </span>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p className="mt-3 text-sm text-slate-500">
                                  Waste acceptance
                                  information
                                  unavailable.
                                </p>
                              )}
                            </div>

                            {/* =================================================
                                OPENING HOURS
                               ================================================= */}

                            {facility.openingHours && (
                              <p className="mt-4 text-xs font-medium text-slate-500">
                                Hours:{" "}
                                {
                                  facility.openingHours
                                }
                              </p>
                            )}

                            {/* =================================================
                                SOURCE
                               ================================================= */}

                            {facility.source && (
                              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                <ShieldCheck
                                  size={14}
                                  className="text-[#176b45]"
                                />

                                <span>
                                  Source:{" "}
                                  <strong className="text-slate-600">
                                    {
                                      facility.source
                                    }
                                  </strong>
                                </span>
                              </div>
                            )}

                            {/* =================================================
                                BOTTOM
                               ================================================= */}

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500" />

                                <span className="text-sm font-semibold text-green-700">
                                  {facility.status ||
                                    "Facility available"}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewRoute(
                                    facility
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176b45] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#125637] hover:shadow-md"
                              >
                                <Navigation
                                  size={16}
                                />
                                View Route
                              </button>
                            </div>
                          </article>
                        )
                      }
                    )}
                  </div>
                )}

              {/* =================================================
                  NO RESULTS
                 ================================================= */}

              {!facilityLoading &&
                !facilityError &&
                nearbyFacilities.length ===
                  0 && (
                  <div className="mt-6 rounded-3xl border border-dashed border-[#cfe1d6] bg-white p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f4ec] text-[#176b45]">
                      <Recycle
                        size={25}
                      />
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-800">
                      No waste recovery
                      facilities found
                      nearby
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      We could not find any
                      verified, approved vendor
                      or mapped waste recovery
                      facilities within the current
                      search area.
                    </p>

                    <button
                      type="button"
                      onClick={
                        handleRefresh
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#176b45] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#125637]"
                    >
                      <RefreshCw
                        size={16}
                      />
                      Search Again
                    </button>
                  </div>
                )}
            </section>
          )}
      </main>
    </div>
  )
}

/* =========================================================
   SMALL ICON FOR APPROVED VENDOR BADGE
   ========================================================= */

function Building2Icon() {
  return (
    <span
      aria-hidden="true"
      className="text-[10px]"
    >
      🏢
    </span>
  )
}

export default MRF