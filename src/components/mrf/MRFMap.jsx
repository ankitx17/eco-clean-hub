import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet"

import { useEffect } from "react"
import L from "leaflet"

import "leaflet/dist/leaflet.css"


const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: #176b45;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})


const mrfIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 3px solid #176b45;
      border-radius: 50%;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      font-size: 17px;
    ">♻️</div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})


function MapController({ center }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return

    map.setView(center, 13, {
      animate: true,
    })
  }, [center, map])

  return null
}


function MRFMap({
  location,
  selectedMRF,
}) {
  if (!location) {
    return null
  }

  const userPosition = [
    location.latitude,
    location.longitude,
  ]

  const selectedPosition = selectedMRF
    ? [
        selectedMRF.latitude,
        selectedMRF.longitude,
      ]
    : null

  const mapCenter = selectedPosition || userPosition

  const routeLine = selectedPosition
    ? [userPosition, selectedPosition]
    : []

  const handleNavigate = () => {
    if (!selectedMRF) return

    const destination = `${selectedMRF.latitude},${selectedMRF.longitude}`

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#dce9e1] bg-white shadow-sm">

      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-[420px] w-full sm:h-[500px]"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} />


        {/* User Location */}
        <Marker
          position={userPosition}
          icon={userIcon}
        >
          <Popup>
            <strong>Your Location</strong>
            <br />
            Current position
          </Popup>
        </Marker>


        {/* Selected MRF */}
        {selectedMRF && (
          <Marker
            position={selectedPosition}
            icon={mrfIcon}
          >
            <Popup>

              <div className="min-w-[180px]">

                <strong>
                  {selectedMRF.name}
                </strong>

                <p style={{ margin: "5px 0" }}>
                  {selectedMRF.address}
                </p>

                <p style={{ margin: "5px 0" }}>
                  Distance:{" "}
                  <strong>
                    {selectedMRF.distance < 1
                      ? `${Math.round(
                          selectedMRF.distance * 1000
                        )} m`
                      : `${selectedMRF.distance.toFixed(1)} km`}
                  </strong>
                </p>

                <button
                  type="button"
                  onClick={handleNavigate}
                  style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#176b45",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Start Navigation
                </button>

              </div>

            </Popup>
          </Marker>
        )}


        {/* Route Preview */}
        {routeLine.length > 0 && (
          <Polyline
            positions={routeLine}
            pathOptions={{
              color: "#176b45",
              weight: 5,
              opacity: 0.75,
              dashArray: "10 8",
            }}
          />
        )}

      </MapContainer>


      {/* Map Overlay */}
      {selectedMRF && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">

          <div className="rounded-2xl border border-white/60 bg-white/95 p-4 shadow-lg backdrop-blur">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <p className="text-xs font-bold uppercase tracking-wider text-[#176b45]">
                  Selected destination
                </p>

                <h3 className="mt-1 truncate font-bold text-slate-800">
                  {selectedMRF.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedMRF.distance < 1
                    ? `${Math.round(
                        selectedMRF.distance * 1000
                      )} m`
                    : `${selectedMRF.distance.toFixed(1)} km`}{" "}
                  away
                </p>

              </div>


              <button
                type="button"
                onClick={handleNavigate}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#176b45] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#125637]"
              >
                🧭 Start Navigation
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default MRFMap