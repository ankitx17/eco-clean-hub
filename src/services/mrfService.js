/* =========================================================
   Eco Clean Hub
   Smart Waste Facility Service

   Flow:
   User GPS
      ↓
   Firestore verified facilities
      +
   OpenStreetMap dynamic facilities
      ↓
   Remove duplicates
      ↓
   Calculate distance
      ↓
   25 km filter
      ↓
   Nearest first
   ========================================================= */

import {
  getVerifiedFacilities,
} from "./facilityService"

import {
  getOSMFacilities,
} from "./osmFacilityService"

/* =========================================================
   SEARCH SETTINGS
   ========================================================= */

const SEARCH_RADIUS_METERS =
  25000

const SEARCH_RADIUS_KM = 25

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
  return `${latitude.toFixed(
    2
  )},${longitude.toFixed(2)}`
}

/* =========================================================
   DISTANCE
   ========================================================= */

export function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const earthRadius = 6371

  const dLat =
    ((lat2 - lat1) *
      Math.PI) /
    180

  const dLon =
    ((lon2 - lon1) *
      Math.PI) /
    180

  const a =
    Math.sin(dLat / 2) **
      2 +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) **
        2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadius * c
}

/* =========================================================
   DISTANCE FORMAT
   ========================================================= */

export function formatDistance(
  distance
) {
  if (
    typeof distance !==
      "number" ||
    !Number.isFinite(
      distance
    )
  ) {
    return "Distance unavailable"
  }

  if (distance < 1) {
    return `${Math.round(
      distance * 1000
    )} m`
  }

  return `${distance.toFixed(
    1
  )} km`
}

/* =========================================================
   MEMORY CACHE
   ========================================================= */

function getMemoryCache(
  cacheKey
) {
  const cached =
    memoryCache.get(
      cacheKey
    )

  if (!cached) {
    return null
  }

  const age =
    Date.now() -
    cached.timestamp

  if (
    age >
    CACHE_DURATION
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
      timestamp:
        Date.now(),

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
      localStorage.getItem(
        key
      )

    if (!saved) {
      return null
    }

    const parsed =
      JSON.parse(saved)

    const age =
      Date.now() -
      parsed.timestamp

    if (
      age >
      CACHE_DURATION
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

  /*
   * Same physical location
   */

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

  /*
   * Same facility name
   */

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
   COMBINE SOURCES
   ========================================================= */

function combineFacilities(
  verifiedFacilities,
  osmFacilities
) {
  const combined = [
    ...verifiedFacilities,
    ...osmFacilities,
  ]

  const unique = []

  for (
    const facility of combined
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
   SORT
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
   MAIN SEARCH
   ========================================================= */

export async function getNearbyFacilities(
  userLatitude,
  userLongitude,
  limit = 25
) {
  /*
   * Validate GPS
   */

  if (
    typeof userLatitude !==
      "number" ||
    typeof userLongitude !==
      "number" ||
    !Number.isFinite(
      userLatitude
    ) ||
    !Number.isFinite(
      userLongitude
    )
  ) {
    throw new Error(
      "Valid location coordinates are required."
    )
  }

  /* =======================================================
     CACHE
     ======================================================= */

  const cacheKey =
    createCacheKey(
      userLatitude,
      userLongitude
    )

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
     FIRESTORE
     ======================================================= */

  let verifiedFacilities = []

  try {
    verifiedFacilities =
      await getVerifiedFacilities(
        userLatitude,
        userLongitude,
        SEARCH_RADIUS_KM,
        calculateDistance
      )

    console.info(
      `Firestore verified facilities found: ${verifiedFacilities.length}`
    )
  } catch (error) {
    console.error(
      "Firestore facility error:",
      error
    )
  }

  /* =======================================================
     OPENSTREETMAP
     ======================================================= */

  let osmFacilities = []

  try {
    osmFacilities =
      await getOSMFacilities(
        userLatitude,
        userLongitude,
        SEARCH_RADIUS_METERS,
        SEARCH_RADIUS_KM,
        calculateDistance
      )

    console.info(
      `OpenStreetMap facilities found: ${osmFacilities.length}`
    )
  } catch (error) {
    console.error(
      "OpenStreetMap facility error:",
      error
    )
  }

  /* =======================================================
     COMBINE
     ======================================================= */

  const combined =
    combineFacilities(
      verifiedFacilities,
      osmFacilities
    )

  /* =======================================================
     25 KM FILTER
     ======================================================= */

  const nearbyFacilities =
    combined.filter(
      (facility) =>
        typeof facility.distance ===
          "number" &&
        Number.isFinite(
          facility.distance
        ) &&
        facility.distance <=
          SEARCH_RADIUS_KM
    )

  /* =======================================================
     SORT NEAREST FIRST
     ======================================================= */

  const results =
    sortFacilities(
      nearbyFacilities
    ).slice(
      0,
      limit
    )

  /* =======================================================
     LOG
     ======================================================= */

  console.info(
    `Final nearby facilities: ${results.length}`
  )

  results.forEach(
    (facility, index) => {
      console.info(
        `${index + 1}. ${facility.name} | ${facility.type} | ${formatDistance(facility.distance)}`
      )
    }
  )

  /* =======================================================
     CACHE RESULTS
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