import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
  Recycle,
  Route,
} from "lucide-react"

import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

import useGeolocation from "../hooks/useGeolocation"

import {
  getNearbyMRFs,
  formatDistance,
} from "../services/mrfService"

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet"

import L from "leaflet"

import "leaflet/dist/leaflet.css"


/* =========================
   Custom Map Icons
========================= */

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 22px;
      height: 22px;
      background: #176b45;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 3px 12px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})


const facilityIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #176b45;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
      font-size: 20px;
    ">
      ♻️
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
})


/* =========================
   Map Controller
========================= */

function MapController({
  userPosition,
  destinationPosition,
}) {
  const map = useMap()

  useEffect(() => {
    if (
      !userPosition ||
      !destinationPosition
    ) {
      return
    }

    const bounds = L.latLngBounds([
      userPosition,
      destinationPosition,
    ])

    map.fitBounds(bounds, {
      padding: [70, 70],
      maxZoom: 14,
      animate: true,
    })
  }, [
    map,
    userPosition,
    destinationPosition,
  ])

  return null
}


/* =========================
   Route Page
========================= */

function MRFRoute() {
  const { mrfId } = useParams()

  const {
    location,
    loading: locationLoading,
    error: locationError,
    getLocation,
    hasLocation,
  } = useGeolocation()

  const [selectedMRF, setSelectedMRF] =
    useState(null)

  const [facilityLoading, setFacilityLoading] =
    useState(true)


  /* =========================
     Load Selected Facility
  ========================= */

  useEffect(() => {
    const savedMRF =
      sessionStorage.getItem(
        "selectedMRF"
      )

    if (savedMRF) {
      try {
        const parsedMRF =
          JSON.parse(savedMRF)

        if (
          parsedMRF &&
          String(parsedMRF.id) ===
            String(mrfId)
        ) {
          setSelectedMRF(parsedMRF)
          setFacilityLoading(false)
          return
        }
      } catch (error) {
        console.error(
          "Unable to load selected facility:",
          error
        )
      }
    }

    setFacilityLoading(false)
  }, [mrfId])


  /* =========================
     Get User Location
  ========================= */

  useEffect(() => {
    getLocation()
  }, [getLocation])


  /* =========================
     Fallback Facility Lookup
  ========================= */

  useEffect(() => {
    if (
      !location ||
      selectedMRF
    ) {
      return
    }

    let cancelled = false

    const findFacility = async () => {
      try {
        const results =
          await getNearbyMRFs(
            location.latitude,
            location.longitude,
            20
          )

        const matchingFacility =
          results.find(
            (facility) =>
              String(facility.id) ===
              String(mrfId)
          )

        if (
          matchingFacility &&
          !cancelled
        ) {
          setSelectedMRF(
            matchingFacility
          )

          sessionStorage.setItem(
            "selectedMRF",
            JSON.stringify(
              matchingFacility
            )
          )
        }
      } catch (error) {
        console.error(
          "Unable to find selected facility:",
          error
        )
      } finally {
        if (!cancelled) {
          setFacilityLoading(false)
        }
      }
    }

    findFacility()

    return () => {
      cancelled = true
    }
  }, [
    location,
    selectedMRF,
    mrfId,
  ])


  /* =========================
     Coordinates
  ========================= */

  const hasFacilityCoordinates =
    selectedMRF &&
    typeof selectedMRF.latitude ===
      "number" &&
    typeof selectedMRF.longitude ===
      "number"


  const userPosition = useMemo(() => {
    if (!location) {
      return null
    }

    return [
      location.latitude,
      location.longitude,
    ]
  }, [location])


  const destinationPosition =
    useMemo(() => {
      if (
        !hasFacilityCoordinates
      ) {
        return null
      }

      return [
        selectedMRF.latitude,
        selectedMRF.longitude,
      ]
    }, [
      selectedMRF,
      hasFacilityCoordinates,
    ])


  const routeLine =
    userPosition &&
    destinationPosition
      ? [
          userPosition,
          destinationPosition,
        ]
      : []


  /* =========================
     Google Maps Navigation
  ========================= */

  const handleStartNavigation = () => {
    if (!selectedMRF) {
      return
    }

    let destination = ""

    if (
      hasFacilityCoordinates
    ) {
      destination =
        `${selectedMRF.latitude},${selectedMRF.longitude}`
    } else {
      destination =
        selectedMRF.address ||
        selectedMRF.name
    }

    const googleMapsUrl =
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        destination
      )}`

    window.open(
      googleMapsUrl,
      "_blank",
      "noopener,noreferrer"
    )
  }


  /* =========================
     Loading
  ========================= */

  if (
    locationLoading ||
    facilityLoading ||
    !selectedMRF
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf7]">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#176b45] text-white shadow-lg">
            <Navigation
              size={25}
              className="animate-pulse"
            />
          </div>

          <p className="mt-5 text-lg font-bold text-slate-800">
            Preparing your route...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Loading destination and map
          </p>
        </div>
      </div>
    )
  }


  /* =========================
     Location Error
  ========================= */

  if (
    locationError ||
    !hasLocation
  ) {
    return (
      <div className="min-h-screen bg-[#f6faf7]">
        <header className="border-b border-[#e3ece6] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
            <Link
              to="/mrf"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#176b45]"
            >
              <ArrowLeft size={17} />
              Back to Facilities
            </Link>
          </div>
        </header>

        <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-5">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <MapPin size={25} />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-800">
              Location required
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              We need your current location
              to show the route to this
              facility.
            </p>

            <button
              type="button"
              onClick={getLocation}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#176b45] px-5 py-3 text-sm font-bold text-white"
            >
              <Navigation size={17} />
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }


  /* =========================
     Main UI
  ========================= */

  return (
    <div className="min-h-screen bg-[#f6faf7]">

      {/* Header */}
      <header className="sticky top-0 z-[2000] border-b border-[#dce9e1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            to="/mrf"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#176b45] transition hover:text-[#125637]"
          >
            <ArrowLeft size={18} />
            Back to Facilities
          </Link>

          <div className="hidden items-center gap-2 text-sm font-bold text-slate-600 sm:flex">
            <Route
              size={17}
              className="text-[#176b45]"
            />
            Route Navigation
          </div>
        </div>
      </header>


      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-8 lg:px-8">

        {/* Destination Header */}
        <section className="mb-6">
          <div className="flex flex-wrap items-center gap-2">

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f4ec] px-3 py-1.5 text-xs font-bold text-[#176b45]">
              <CheckCircle2 size={14} />
              Destination Selected
            </span>

            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-[#dce9e1]">
              {selectedMRF.type ||
                "Waste Facility"}
            </span>

          </div>


          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#14231a] sm:text-4xl">
            {selectedMRF.name}
          </h1>


          <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
            <MapPin
              size={18}
              className="mt-0.5 shrink-0 text-[#176b45]"
            />

            <span>
              {selectedMRF.address ||
                "Address unavailable"}
            </span>
          </div>
        </section>


        {/* =========================
           MAP AVAILABLE
        ========================= */}

        {hasFacilityCoordinates ? (
          <section className="overflow-hidden rounded-[28px] border border-[#dce9e1] bg-white shadow-lg">

            {/* Map Header */}
            <div className="flex flex-col gap-3 border-b border-[#e7eee9] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
                  <Navigation size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Route Preview
                  </p>

                  <p className="text-xs text-slate-500">
                    Your location → selected facility
                  </p>
                </div>
              </div>


              <div className="flex items-center gap-2 text-sm font-bold text-[#176b45]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#176b45]" />
                Live location
              </div>

            </div>


            {/* Map */}
            <div className="relative h-[480px] w-full sm:h-[580px] lg:h-[650px]">

              <MapContainer
                center={userPosition}
                zoom={13}
                scrollWheelZoom={true}
                zoomControl={true}
                className="h-full w-full"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController
                  userPosition={
                    userPosition
                  }
                  destinationPosition={
                    destinationPosition
                  }
                />


                {/* User Marker */}
                <Marker
                  position={userPosition}
                  icon={userIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>
                        Your Location
                      </strong>

                      <br />

                      Current position
                    </div>
                  </Popup>
                </Marker>


                {/* Facility Marker */}
                <Marker
                  position={
                    destinationPosition
                  }
                  icon={facilityIcon}
                >
                  <Popup>
                    <div className="min-w-[190px]">

                      <p className="font-bold text-slate-800">
                        {selectedMRF.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedMRF.address}
                      </p>

                      <p className="mt-2 text-sm font-bold text-[#176b45]">
                        {formatDistance(
                          selectedMRF.distance
                        )}
                      </p>

                    </div>
                  </Popup>
                </Marker>


                {/* Route Line */}
                {routeLine.length > 0 && (
                  <Polyline
                    positions={
                      routeLine
                    }
                    pathOptions={{
                      color: "#176b45",
                      weight: 6,
                      opacity: 0.8,
                      dashArray:
                        "12 10",
                    }}
                  />
                )}

              </MapContainer>


              {/* Map Legend */}
              <div className="absolute left-4 top-4 z-[1000]">
                <div className="rounded-2xl border border-white/70 bg-white/95 p-3 shadow-lg backdrop-blur">

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="h-3 w-3 rounded-full bg-[#176b45]" />
                    Your Location
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-base">
                      ♻️
                    </span>
                    Facility Destination
                  </div>

                </div>
              </div>


              {/* Floating Destination Card */}
              <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                <div className="rounded-3xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur sm:p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
                        <Recycle size={19} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-bold uppercase tracking-wider text-[#176b45]">
                          Selected destination
                        </p>

                        <h2 className="truncate text-base font-black text-slate-800 sm:text-lg">
                          {selectedMRF.name}
                        </h2>

                      </div>

                    </div>


                    <button
                      type="button"
                      onClick={
                        handleStartNavigation
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#176b45] px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#125637] hover:shadow-lg"
                    >
                      <Navigation size={18} />
                      Start Navigation
                      <ExternalLink size={15} />
                    </button>

                  </div>

                </div>
              </div>

            </div>
          </section>
        ) : (

          /* =========================
             COORDINATES UNAVAILABLE
          ========================= */

          <section className="rounded-[28px] border border-[#dce9e1] bg-white p-6 shadow-lg sm:p-8">

            <div className="mx-auto max-w-2xl text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f4ec] text-[#176b45]">
                <MapPin size={28} />
              </div>


              <h2 className="mt-5 text-2xl font-black text-slate-800">
                Destination location available
              </h2>


              <p className="mt-3 text-sm leading-7 text-slate-500">
                This verified facility has been
                added from an authorized facility
                source, but exact map coordinates
                are not currently available in our
                verified database.
              </p>


              <div className="mt-6 rounded-2xl border border-[#e3ece6] bg-[#f8fbf9] p-4 text-left">

                <div className="flex items-start gap-3">

                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-[#176b45]"
                  />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Destination
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {selectedMRF.name}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {selectedMRF.address ||
                        "Address unavailable"}
                    </p>
                  </div>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  handleStartNavigation
                }
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#176b45] px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#125637] hover:shadow-lg"
              >
                <Navigation size={18} />
                Navigate with Google Maps
                <ExternalLink size={15} />
              </button>

            </div>

          </section>
        )}


        {/* Route Information */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          {/* Distance */}
          <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
                <Navigation size={19} />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Distance
                </p>

                <p className="mt-1 text-lg font-black text-slate-800">
                  {formatDistance(
                    selectedMRF.distance
                  )}
                </p>

              </div>

            </div>

          </div>


          {/* Destination */}
          <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
                <MapPin size={19} />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Facility Type
                </p>

                <p className="mt-1 text-lg font-black text-slate-800">
                  {selectedMRF.type ||
                    "Waste Facility"}
                </p>

              </div>

            </div>

          </div>


          {/* Status */}
          <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
                <Clock3 size={19} />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Facility Status
                </p>

                <p className="mt-1 text-lg font-black text-green-700">
                  {selectedMRF.status ||
                    "Verified"}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* Accepted Waste */}
        <section className="mt-6 rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
              <Recycle size={19} />
            </div>

            <div>

              <h2 className="font-black text-slate-800">
                Accepted Waste
              </h2>

              <p className="text-sm text-slate-500">
                Waste types accepted by this facility.
              </p>

            </div>

          </div>


          <div className="mt-4 flex flex-wrap gap-2">

            {(
              selectedMRF.acceptedWaste ||
              []
            ).map(
              (waste) => (
                <span
                  key={waste}
                  className="rounded-full border border-[#cfe1d6] bg-[#f7faf8] px-4 py-2 text-sm font-bold text-slate-600"
                >
                  ♻️ {waste}
                </span>
              )
            )}

          </div>
        </section>

      </main>

    </div>
  )
}

export default MRFRoute