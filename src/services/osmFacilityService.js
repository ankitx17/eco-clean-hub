/* =========================================================
   Eco Clean Hub
   OpenStreetMap Facility Service

   Data source:
   - OpenStreetMap via Overpass API
   ========================================================= */

const OVERPASS_ENDPOINTS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
]

const REQUEST_TIMEOUT = 30000

/* =========================================================
   OSM COORDINATES
   ========================================================= */

function getElementCoordinates(element) {
  if (
    typeof element.lat === "number" &&
    typeof element.lon === "number"
  ) {
    return {
      latitude: element.lat,
      longitude: element.lon,
    }
  }

  if (
    element.center &&
    typeof element.center.lat === "number" &&
    typeof element.center.lon === "number"
  ) {
    return {
      latitude: element.center.lat,
      longitude: element.center.lon,
    }
  }

  return null
}

/* =========================================================
   OSM ADDRESS
   ========================================================= */

function getAddress(tags = {}) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
  ].filter(Boolean)

  if (parts.length > 0) {
    return parts.join(", ")
  }

  return (
    tags["addr:full"] ||
    tags["addr:district"] ||
    "Address not available"
  )
}

/* =========================================================
   OSM FACILITY TYPE
   ========================================================= */

function getFacilityType(tags = {}) {
  /*
   * Municipal Waste Facility
   */

  if (
    tags.amenity ===
    "waste_transfer_station"
  ) {
    return "Municipal Waste Facility"
  }

  if (
    tags.amenity ===
    "waste_disposal"
  ) {
    return "Municipal Waste Facility"
  }

  /*
   * Recycling Centre
   */

  if (
    tags.recycling_type ===
    "centre"
  ) {
    return "Recycling Centre"
  }

  if (
    tags.amenity ===
    "recycling"
  ) {
    return "Recycling Centre"
  }

  /*
   * Collection Point
   */

  if (
    tags.shop ===
    "scrap_yard"
  ) {
    return "Collection Point"
  }

  /*
   * Default category
   */

  return "Recycling Centre"
}

/* =========================================================
   OSM ACCEPTED WASTE
   ========================================================= */

function getAcceptedWaste(tags = {}) {
  const wasteTypes = []

  const recyclingMap = {
    "recycling:plastic": "Plastic",
    "recycling:paper": "Paper",
    "recycling:glass": "Glass",
    "recycling:metal": "Metal",
    "recycling:cardboard": "Cardboard",
    "recycling:electrical_items":
      "Electronics",
    "recycling:batteries":
      "Batteries",
    "recycling:clothes":
      "Clothes",
    "recycling:green_waste":
      "Green Waste",
    "recycling:e_waste":
      "E-Waste",
  }

  Object.entries(
    recyclingMap
  ).forEach(
    ([tag, label]) => {
      const value = tags[tag]

      if (
        value === "yes" ||
        value === "designated"
      ) {
        if (
          !wasteTypes.includes(
            label
          )
        ) {
          wasteTypes.push(
            label
          )
        }
      }
    }
  )

  if (
    wasteTypes.length > 0
  ) {
    return wasteTypes
  }

  return [
    "Recyclable Waste",
  ]
}

/* =========================================================
   NORMALIZE OSM FACILITY
   ========================================================= */

function normalizeOSM(element) {
  const tags =
    element.tags || {}

  const coordinates =
    getElementCoordinates(
      element
    )

  if (!coordinates) {
    return null
  }

  return {
    id:
      `osm-${element.type}-${element.id}`,

    osmId:
      element.id,

    osmType:
      element.type,

    name:
      tags.name ||
      tags["name:en"] ||
      tags.operator ||
      "Recycling Centre",

    type:
      getFacilityType(
        tags
      ),

    address:
      getAddress(tags),

    latitude:
      coordinates.latitude,

    longitude:
      coordinates.longitude,

    acceptedWaste:
      getAcceptedWaste(
        tags
      ),

    status:
      tags.operational_status ===
      "closed"
        ? "Closed"
        : tags.opening_hours
          ? "Hours available"
          : "Open / status unavailable",

    openingHours:
      tags.opening_hours ||
      null,

    phone:
      tags.phone ||
      tags["contact:phone"] ||
      null,

    website:
      tags.website ||
      tags["contact:website"] ||
      null,

    operator:
      tags.operator ||
      null,

    source:
      "OpenStreetMap",

    sourceType:
      "osm",

    verified:
      false,

    locationAvailable:
      true,
  }
}

/* =========================================================
   OVERPASS QUERY
   ========================================================= */

function createOverpassQuery(
  latitude,
  longitude,
  searchRadiusMeters
) {
  return `
    [out:json][timeout:25];

    (
      nwr[
        amenity=recycling
      ](
        around:${searchRadiusMeters},
        ${latitude},
        ${longitude}
      );

      nwr[
        amenity=waste_transfer_station
      ](
        around:${searchRadiusMeters},
        ${latitude},
        ${longitude}
      );

      nwr[
        recycling_type=centre
      ](
        around:${searchRadiusMeters},
        ${latitude},
        ${longitude}
      );

      nwr[
        shop=scrap_yard
      ](
        around:${searchRadiusMeters},
        ${latitude},
        ${longitude}
      );

      nwr[
        amenity=waste_disposal
      ](
        around:${searchRadiusMeters},
        ${latitude},
        ${longitude}
      );

      nwr[
        landuse=landfill
      ](
        around:${searchRadiusMeters},
        ${latitude},
        ${longitude}
      );
    );

    out center tags;
  `
}

/* =========================================================
   FETCH FROM OVERPASS
   ========================================================= */

async function fetchFromOverpass(
  endpoint,
  query
) {
  const controller =
    new AbortController()

  const timeoutId =
    setTimeout(
      () =>
        controller.abort(),
      REQUEST_TIMEOUT
    )

  try {
    const response =
      await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",

            Accept:
              "application/json",
          },

          body:
            "data=" +
            encodeURIComponent(
              query
            ),

          signal:
            controller.signal,
        }
      )

    if (!response.ok) {
      throw new Error(
        `OpenStreetMap service error (${response.status}).`
      )
    }

    return await response.json()
  } catch (error) {
    if (
      error.name ===
      "AbortError"
    ) {
      throw new Error(
        "OpenStreetMap request timed out."
      )
    }

    throw error
  } finally {
    clearTimeout(
      timeoutId
    )
  }
}

/* =========================================================
   OSM FACILITY SEARCH
   ========================================================= */

export async function getOSMFacilities(
  latitude,
  longitude,
  searchRadiusMeters,
  searchRadiusKm,
  calculateDistance
) {
  const query =
    createOverpassQuery(
      latitude,
      longitude,
      searchRadiusMeters
    )

  for (
    const endpoint of
      OVERPASS_ENDPOINTS
  ) {
    try {
      console.info(
        `Searching OpenStreetMap facilities using ${endpoint}`
      )

      const data =
        await fetchFromOverpass(
          endpoint,
          query
        )

      const facilities =
        (data.elements || [])
          .map(
            normalizeOSM
          )
          .filter(
            Boolean
          )
          .map(
            (facility) => ({
              ...facility,

              distance:
                calculateDistance(
                  latitude,
                  longitude,
                  facility.latitude,
                  facility.longitude
                ),
            })
          )
          .filter(
            (facility) =>
              facility.distance <=
              searchRadiusKm
          )

      /*
       * If this server returned facilities,
       * use them.
       */

      if (
        facilities.length > 0
      ) {
        return facilities
      }

      /*
       * Empty response:
       * try the next Overpass server.
       */

      console.warn(
        `No facilities found using ${endpoint}. Trying next Overpass server...`
      )
    } catch (error) {
      console.warn(
        `Overpass endpoint failed: ${endpoint}`,
        error
      )
    }
  }

  return []
}