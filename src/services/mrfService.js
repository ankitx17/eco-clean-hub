/* =========================================================
   Eco Clean Hub
   Smart Waste Facility Service

   Data sources:
   1. Firestore Verified Facility Database - PRIMARY
   2. OpenStreetMap - SUPPLEMENTARY

   Facility types:
   - MRF / Material Recovery Facility
   - Dry Waste Collection Centre
   - Recycling Centre
   - E-Waste Recycler
   - Municipal Waste Facility
   - Collection Point
   ========================================================= */

import {
  collection,
  getDocs,
} from "firebase/firestore"

import { db } from "./firebase"


/* =========================================================
   CONFIGURATION
   ========================================================= */

const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
]

const SEARCH_RADIUS_METERS = 25000

const REQUEST_TIMEOUT = 8000

const CACHE_DURATION =
  10 * 60 * 1000

const memoryCache = new Map()


/* =========================================================
   CACHE KEY
   ========================================================= */

function createCacheKey(
  latitude,
  longitude
) {
  return `${latitude.toFixed(2)},${longitude.toFixed(2)}`
}


/* =========================================================
   DISTANCE CALCULATION
   ========================================================= */

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const earthRadius = 6371

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadius * c
}


/* =========================================================
   FORMAT DISTANCE
   ========================================================= */

export function formatDistance(
  distance
) {
  if (
    typeof distance !== "number" ||
    Number.isNaN(distance)
  ) {
    return "Distance unavailable"
  }

  if (distance < 1) {
    return `${Math.round(
      distance * 1000
    )} m`
  }

  return `${distance.toFixed(1)} km`
}


/* =========================================================
   MEMORY CACHE
   ========================================================= */

function getMemoryCache(
  cacheKey
) {
  const cached =
    memoryCache.get(cacheKey)

  if (!cached) {
    return null
  }

  const age =
    Date.now() -
    cached.timestamp

  if (
    age > CACHE_DURATION
  ) {
    memoryCache.delete(
      cacheKey
    )

    return null
  }

  return cached.data
}


function saveMemoryCache(
  cacheKey,
  data
) {
  memoryCache.set(
    cacheKey,
    {
      timestamp: Date.now(),
      data,
    }
  )
}


/* =========================================================
   LOCAL STORAGE CACHE
   ========================================================= */

function getPersistentCache(
  cacheKey
) {
  try {
    const key =
      `eco-clean-facilities-${cacheKey}`

    const saved =
      localStorage.getItem(key)

    if (!saved) {
      return null
    }

    const parsed =
      JSON.parse(saved)

    const age =
      Date.now() -
      parsed.timestamp

    if (
      age > CACHE_DURATION
    ) {
      localStorage.removeItem(
        key
      )

      return null
    }

    return parsed.data
  } catch (error) {
    console.warn(
      "Unable to read facility cache:",
      error
    )

    return null
  }
}


function savePersistentCache(
  cacheKey,
  data
) {
  try {
    const key =
      `eco-clean-facilities-${cacheKey}`

    localStorage.setItem(
      key,
      JSON.stringify({
        timestamp:
          Date.now(),
        data,
      })
    )
  } catch (error) {
    console.warn(
      "Unable to save facility cache:",
      error
    )
  }
}


/* =========================================================
   FIRESTORE VERIFIED FACILITIES
   =========================================================

   Firestore collection:

   facilities

   Every verified facility should contain:

   {
     name,
     type,
     address,
     city,
     state,
     acceptedWaste,
     status,
     source,
     verified,
     latitude,
     longitude
   }

   IMPORTANT:
   Facilities without verified coordinates are ignored
   for nearby-distance results.

   We never guess coordinates.
   ========================================================= */

async function getVerifiedFacilities(
  latitude,
  longitude
) {
  const snapshot =
    await getDocs(
      collection(
        db,
        "facilities"
      )
    )

  const facilities = []

  snapshot.forEach(
    (documentSnapshot) => {
      const data =
        documentSnapshot.data()

      const hasCoordinates =
        typeof data.latitude ===
          "number" &&
        typeof data.longitude ===
          "number" &&
        Number.isFinite(
          data.latitude
        ) &&
        Number.isFinite(
          data.longitude
        )

      if (
        data.verified !== true ||
        !hasCoordinates
      ) {
        return
      }

      const distance =
        calculateDistance(
          latitude,
          longitude,
          data.latitude,
          data.longitude
        )

      if (
        distance >
        SEARCH_RADIUS_METERS / 1000
      ) {
        return
      }

      facilities.push({
        id:
          documentSnapshot.id,

        name:
          data.name ||
          "Waste Recovery Facility",

        type:
          data.type ||
          "Waste Recovery Facility",

        address:
          data.address ||
          "Address not available",

        city:
          data.city ||
          "",

        state:
          data.state ||
          "",

        acceptedWaste:
          Array.isArray(
            data.acceptedWaste
          )
            ? data.acceptedWaste
            : [],

        status:
          data.status ||
          "Verified",

        source:
          data.source ||
          "Verified Facility Database",

        verified:
          true,

        latitude:
          data.latitude,

        longitude:
          data.longitude,

        distance,

        sourceType:
          "verified",

        locationAvailable:
          true,
      })
    }
  )

  return facilities
}


/* =========================================================
   OSM COORDINATES
   ========================================================= */

function getElementCoordinates(
  element
) {
  if (
    typeof element.lat ===
      "number" &&
    typeof element.lon ===
      "number"
  ) {
    return {
      latitude:
        element.lat,

      longitude:
        element.lon,
    }
  }

  if (
    element.center &&
    typeof element.center.lat ===
      "number" &&
    typeof element.center.lon ===
      "number"
  ) {
    return {
      latitude:
        element.center.lat,

      longitude:
        element.center.lon,
    }
  }

  return null
}


/* =========================================================
   OSM ADDRESS
   ========================================================= */

function getAddress(
  tags = {}
) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
  ].filter(Boolean)

  if (
    parts.length > 0
  ) {
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

function getFacilityType(
  tags = {}
) {
  if (
    tags.amenity ===
    "waste_transfer_station"
  ) {
    return "Municipal Waste Facility"
  }

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

  return "Waste Recovery Facility"
}


/* =========================================================
   OSM ACCEPTED WASTE
   ========================================================= */

function getAcceptedWaste(
  tags = {}
) {
  const wasteTypes = []

  const recyclingMap = {
    "recycling:plastic":
      "Plastic",

    "recycling:paper":
      "Paper",

    "recycling:glass":
      "Glass",

    "recycling:metal":
      "Metal",

    "recycling:cardboard":
      "Cardboard",

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
      const value =
        tags[tag]

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

function normalizeOSM(
  element
) {
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
  longitude
) {
  return `
    [out:json][timeout:8];

    (
      nwr[
        amenity=recycling
      ](
        around:${SEARCH_RADIUS_METERS},
        ${latitude},
        ${longitude}
      );

      nwr[
        amenity=waste_transfer_station
      ](
        around:${SEARCH_RADIUS_METERS},
        ${latitude},
        ${longitude}
      );

      nwr[
        recycling_type=centre
      ](
        around:${SEARCH_RADIUS_METERS},
        ${latitude},
        ${longitude}
      );
    );

    out center tags;
  `
}


/* =========================================================
   FETCH OVERPASS
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

async function getOSMFacilities(
  latitude,
  longitude
) {
  const query =
    createOverpassQuery(
      latitude,
      longitude
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

      return (
        data.elements || []
      )
        .map(
          normalizeOSM
        )
        .filter(Boolean)
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
            SEARCH_RADIUS_METERS /
              1000
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


/* =========================================================
   DUPLICATE DETECTION
   ========================================================= */

function isDuplicate(
  existing,
  candidate
) {
  const existingHasCoordinates =
    typeof existing.latitude ===
      "number" &&
    typeof existing.longitude ===
      "number"

  const candidateHasCoordinates =
    typeof candidate.latitude ===
      "number" &&
    typeof candidate.longitude ===
      "number"

  if (
    existingHasCoordinates &&
    candidateHasCoordinates
  ) {
    const distance =
      calculateDistance(
        existing.latitude,
        existing.longitude,
        candidate.latitude,
        candidate.longitude
      )

    if (
      distance < 0.15
    ) {
      return true
    }
  }

  const existingName =
    existing.name
      ?.toLowerCase()
      .trim()

  const candidateName =
    candidate.name
      ?.toLowerCase()
      .trim()

  if (
    existingName &&
    candidateName &&
    existingName ===
      candidateName
  ) {
    return true
  }

  return false
}


/* =========================================================
   COMBINE VERIFIED + OSM
   ========================================================= */

function combineFacilities(
  verified,
  osm
) {
  const combined = [
    ...verified,
    ...osm,
  ]

  const unique = []

  for (
    const facility of
    combined
  ) {
    const duplicate =
      unique.some(
        (existing) =>
          isDuplicate(
            existing,
            facility
          )
      )

    if (!duplicate) {
      unique.push(
        facility
      )
    }
  }

  return unique
}


/* =========================================================
   SORT FACILITIES
   ========================================================= */

function sortFacilities(
  facilities
) {
  return facilities.sort(
    (a, b) => {
      const aDistance =
        typeof a.distance ===
        "number"
          ? a.distance
          : Infinity

      const bDistance =
        typeof b.distance ===
        "number"
          ? b.distance
          : Infinity

      return (
        aDistance -
        bDistance
      )
    }
  )
}


/* =========================================================
   MAIN FACILITY SERVICE
   ========================================================= */

export async function getNearbyFacilities(
  userLatitude,
  userLongitude,
  limit = 25
) {
  if (
    typeof userLatitude !==
      "number" ||
    typeof userLongitude !==
      "number"
  ) {
    throw new Error(
      "Valid location coordinates are required."
    )
  }

  const cacheKey =
    createCacheKey(
      userLatitude,
      userLongitude
    )


  /* =======================================================
     MEMORY CACHE
     ======================================================= */

  const memoryCached =
    getMemoryCache(
      cacheKey
    )

  if (memoryCached) {
    console.info(
      "Facility data loaded from memory cache."
    )

    return memoryCached.slice(
      0,
      limit
    )
  }


  /* =======================================================
     BROWSER CACHE
     ======================================================= */

  const persistentCached =
    getPersistentCache(
      cacheKey
    )

  if (persistentCached) {
    console.info(
      "Facility data loaded from browser cache."
    )

    saveMemoryCache(
      cacheKey,
      persistentCached
    )

    return persistentCached.slice(
      0,
      limit
    )
  }


  /* =======================================================
     VERIFIED FIRESTORE DATA
     PRIMARY SOURCE
     ======================================================= */

  let verifiedFacilities = []

  try {
    verifiedFacilities =
      await getVerifiedFacilities(
        userLatitude,
        userLongitude
      )

    console.info(
      `Firestore verified facilities found: ${verifiedFacilities.length}`
    )
  } catch (error) {
    console.error(
      "Firestore facility error:",
      error
    )

    /*
      Firestore is the primary source.
      If Firestore fails, OSM can still be attempted
      as a supplementary source.
    */
  }


  /* =======================================================
     OPENSTREETMAP DATA
     SUPPLEMENTARY SOURCE
     ======================================================= */

  const osmFacilities =
    await getOSMFacilities(
      userLatitude,
      userLongitude
    )


  /* =======================================================
     COMBINE
     ======================================================= */

  const combined =
    combineFacilities(
      verifiedFacilities,
      osmFacilities
    )


  /* =======================================================
     SORT
     ======================================================= */

  const results =
    sortFacilities(
      combined
    ).slice(
      0,
      limit
    )


  /* =======================================================
     CACHE
     ======================================================= */

  if (
    results.length > 0
  ) {
    saveMemoryCache(
      cacheKey,
      results
    )

    savePersistentCache(
      cacheKey,
      results
    )
  }


  return results
}


/* =========================================================
   BACKWARD COMPATIBILITY
   ========================================================= */

export const getNearbyMRFs =
  getNearbyFacilities