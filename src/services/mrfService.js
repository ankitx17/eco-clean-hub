/* =========================================================
   Eco Clean Hub
   Smart Waste Facility Service

   Sources:
   1. Firestore verified facilities
   2. Firestore approved vendor facilities
   3. Locally registered vendors
   4. OpenStreetMap dynamic facilities

   Flow:
   User GPS
      ↓
   Collect all facility sources
      ↓
   Remove duplicates
      ↓
   Calculate distance
      ↓
   25 km filter
      ↓
   Nearest first
      ↓
   Return facilities
   ========================================================= */

import {
  getVerifiedFacilities,
} from "./facilityService"

import {
  getOSMFacilities,
} from "./osmFacilityService"

import {
  collection,
  getDocs,
} from "firebase/firestore"

import { db } from "./firebase"

/* =========================================================
   SEARCH SETTINGS
   ========================================================= */

const SEARCH_RADIUS_METERS = 25000
const SEARCH_RADIUS_KM = 25
const CACHE_DURATION = 10 * 60 * 1000

const memoryCache = new Map()

/* =========================================================
   CACHE KEY
   ========================================================= */

function createCacheKey(latitude, longitude) {
  return `${latitude.toFixed(2)},${longitude.toFixed(2)}`
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
    ((lat2 - lat1) * Math.PI) / 180

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
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
   DISTANCE FORMAT
   ========================================================= */

export function formatDistance(distance) {
  if (
    typeof distance !== "number" ||
    !Number.isFinite(distance)
  ) {
    return "Distance unavailable"
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }

  return `${distance.toFixed(1)} km`
}

/* =========================================================
   MEMORY CACHE
   ========================================================= */

function getMemoryCache(cacheKey) {
  const cached = memoryCache.get(cacheKey)

  if (!cached) {
    return null
  }

  const age =
    Date.now() - cached.timestamp

  if (age > CACHE_DURATION) {
    memoryCache.delete(cacheKey)
    return null
  }

  return cached.data
}

function saveMemoryCache(cacheKey, data) {
  memoryCache.set(cacheKey, {
    timestamp: Date.now(),
    data,
  })
}

/* =========================================================
   LOCAL STORAGE CACHE
   ========================================================= */

function getPersistentCache(cacheKey) {
  try {
    const key =
      `eco-clean-facilities-${cacheKey}`

    const saved =
      localStorage.getItem(key)

    if (!saved) {
      return null
    }

    const parsed = JSON.parse(saved)

    const age =
      Date.now() - parsed.timestamp

    if (age > CACHE_DURATION) {
      localStorage.removeItem(key)
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
        timestamp: Date.now(),
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
   LOCAL REGISTERED VENDORS
   ========================================================= */

function getLocalRegisteredVendors(
  userLatitude,
  userLongitude,
  searchRadiusKm
) {
  try {
    const saved =
      localStorage.getItem(
        "eco_clean_hub_registered_vendors"
      )

    if (!saved) {
      return []
    }

    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return []
    }

    const facilities = []

    parsed.forEach((vendor) => {
      const latitude = Number(
        vendor.latitude
      )

      const longitude = Number(
        vendor.longitude
      )

      /* Invalid coordinates */
      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return
      }

      /* Ignore 0,0 */
      if (
        latitude === 0 &&
        longitude === 0
      ) {
        return
      }

      const distance =
        calculateDistance(
          userLatitude,
          userLongitude,
          latitude,
          longitude
        )

      /* 25 km filter */
      if (distance > searchRadiusKm) {
        return
      }

      facilities.push({
        id:
          vendor.id ||
          `local-vendor-${Date.now()}`,

        name:
          vendor.businessName ||
          vendor.name ||
          "Registered Waste Facility",

        type:
          vendor.facilityType ||
          vendor.type ||
          "Recycling Centre",

        address:
          vendor.address ||
          "Address not available",

        city:
          vendor.city ||
          "",

        state:
          vendor.state ||
          "",

        pincode:
          vendor.pincode ||
          "",

        acceptedWaste:
          Array.isArray(
            vendor.acceptedWaste
          )
            ? vendor.acceptedWaste
            : [],

        status:
          "Registered Vendor",

        source:
          "Eco Clean Hub Vendor Registration",

        verified:
          vendor.verified === true,

        latitude,
        longitude,

        distance,

        sourceType:
          "registered-vendor",

        locationAvailable: true,

        contactPerson:
          vendor.contactPerson ||
          "",

        phone:
          vendor.phone ||
          "",

        email:
          vendor.email ||
          "",

        description:
          vendor.description ||
          "",
      })
    })

    return facilities
  } catch (error) {
    console.error(
      "Local vendor facility error:",
      error
    )

    return []
  }
}

/* =========================================================
   APPROVED FIRESTORE VENDORS
   ========================================================= */

async function getApprovedVendorFacilities(
  userLatitude,
  userLongitude,
  searchRadiusKm
) {
  const snapshot =
    await getDocs(
      collection(
        db,
        "vendorApplications"
      )
    )

  const facilities = []

  snapshot.forEach(
    (documentSnapshot) => {
      const data =
        documentSnapshot.data()

      /* Only approved vendors */
      if (
        data.status !== "approved"
      ) {
        return
      }

      const latitude =
        Number(data.latitude)

      const longitude =
        Number(data.longitude)

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return
      }

      if (
        latitude === 0 &&
        longitude === 0
      ) {
        return
      }

      const distance =
        calculateDistance(
          userLatitude,
          userLongitude,
          latitude,
          longitude
        )

      if (
        distance > searchRadiusKm
      ) {
        return
      }

      facilities.push({
        id:
          `vendor-${documentSnapshot.id}`,

        name:
          data.businessName ||
          data.name ||
          "Approved Waste Recovery Facility",

        type:
          data.facilityType ||
          data.type ||
          "Recycling Centre",

        address:
          data.address ||
          "Address not available",

        city:
          data.city ||
          "",

        state:
          data.state ||
          "",

        pincode:
          data.pincode ||
          "",

        acceptedWaste:
          Array.isArray(
            data.acceptedWaste
          )
            ? data.acceptedWaste
            : [],

        status:
          "Approved Vendor",

        source:
          "Eco Clean Hub Vendor Registration",

        verified: true,

        latitude,
        longitude,

        distance,

        sourceType:
          "approved-vendor",

        locationAvailable: true,

        contactPerson:
          data.contactPerson ||
          "",

        phone:
          data.phone ||
          "",

        email:
          data.email ||
          "",

        description:
          data.description ||
          "",

        vendorApplicationId:
          documentSnapshot.id,
      })
    }
  )

  return facilities
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

  /* Same physical location */
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

    /*
     * 150 metres
     */
    if (distance < 0.15) {
      return true
    }
  }

  /* Same facility name */
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
    existingName === candidateName
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
  approvedVendorFacilities,
  localVendorFacilities,
  osmFacilities
) {
  const combined = [
    ...verifiedFacilities,
    ...approvedVendorFacilities,
    ...localVendorFacilities,
    ...osmFacilities,
  ]

  const unique = []

  for (const facility of combined) {
    const duplicate =
      unique.some(
        (existing) =>
          isDuplicate(
            existing,
            facility
          )
      )

    if (!duplicate) {
      unique.push(facility)
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
   PROCESS RESULTS
   ========================================================= */

function processFacilities(
  facilities,
  limit
) {
  const nearbyFacilities =
    facilities.filter(
      (facility) =>
        typeof facility.distance ===
          "number" &&
        Number.isFinite(
          facility.distance
        ) &&
        facility.distance <=
          SEARCH_RADIUS_KM
    )

  return sortFacilities(
    nearbyFacilities
  ).slice(0, limit)
}

/* =========================================================
   MAIN SEARCH
   ========================================================= */

export async function getNearbyFacilities(
  userLatitude,
  userLongitude,
  limit = 25
) {
  /* =======================================================
     VALIDATE GPS
     ======================================================= */

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
     CACHE KEY
     ======================================================= */

  const cacheKey =
    createCacheKey(
      userLatitude,
      userLongitude
    )

  /* =======================================================
     LOCAL VENDORS FIRST
     
     IMPORTANT:
     We read local vendors BEFORE cache.
     
     This means newly registered vendors
     appear immediately even if an old
     facility result is cached.
     ======================================================= */

  const localVendorFacilities =
    getLocalRegisteredVendors(
      userLatitude,
      userLongitude,
      SEARCH_RADIUS_KM
    )

  console.info(
    `Local registered vendors found: ${localVendorFacilities.length}`
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

    const mergedCachedResults =
      combineFacilities(
        memoryCached,
        [],
        localVendorFacilities,
        []
      )

    return processFacilities(
      mergedCachedResults,
      limit
    )
  }

  /* =======================================================
     PERSISTENT CACHE
     ======================================================= */

  const persistentCached =
    getPersistentCache(
      cacheKey
    )

  if (persistentCached) {
    console.info(
      "Facility data loaded from browser cache."
    )

    const mergedCachedResults =
      combineFacilities(
        persistentCached,
        [],
        localVendorFacilities,
        []
      )

    const results =
      processFacilities(
        mergedCachedResults,
        limit
      )

    saveMemoryCache(
      cacheKey,
      results
    )

    return results
  }

  /* =======================================================
     FIRESTORE VERIFIED FACILITIES
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
     FIRESTORE APPROVED VENDORS
     ======================================================= */

  let approvedVendorFacilities = []

  try {
    approvedVendorFacilities =
      await getApprovedVendorFacilities(
        userLatitude,
        userLongitude,
        SEARCH_RADIUS_KM
      )

    console.info(
      `Approved vendor facilities found: ${approvedVendorFacilities.length}`
    )
  } catch (error) {
    console.error(
      "Approved vendor facility error:",
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
     COMBINE EVERYTHING
     ======================================================= */

  const combined =
    combineFacilities(
      verifiedFacilities,
      approvedVendorFacilities,
      localVendorFacilities,
      osmFacilities
    )

  /* =======================================================
     FINAL RESULTS
     ======================================================= */

  const results =
    processFacilities(
      combined,
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
        `${index + 1}. ${facility.name} | ${facility.type} | ${formatDistance(facility.distance)} | ${facility.sourceType}`
      )
    }
  )

  /* =======================================================
     CACHE
     ======================================================= */

  if (results.length > 0) {
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