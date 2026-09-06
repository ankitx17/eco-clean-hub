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
   10 KM filter
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

/*
 * IMPORTANT:
 * User requirement is ONLY facilities within 10 KM.
 *
 * GPS is still used internally.
 * We are NOT removing latitude/longitude from the
 * facility data because route/navigation needs them.
 */

const SEARCH_RADIUS_METERS = 10000
const SEARCH_RADIUS_KM = 10

const CACHE_DURATION =
  10 * 60 * 1000

/*
 * Cache version changed so old 25 KM results
 * are not reused.
 */
const CACHE_VERSION = "v4"

const memoryCache = new Map()

/* =========================================================
   CACHE KEY
   ========================================================= */

function createCacheKey(
  latitude,
  longitude
) {
  return `${CACHE_VERSION}-${latitude.toFixed(
    3
  )},${longitude.toFixed(3)}`
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
   DISTANCE FORMAT
   ========================================================= */

export function formatDistance(
  distance
) {
  if (
    typeof distance !== "number" ||
    !Number.isFinite(distance)
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
    memoryCache.get(cacheKey)

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
   VALID COORDINATES
   ========================================================= */

function hasValidCoordinates(
  latitude,
  longitude
) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(
      latitude === 0 &&
      longitude === 0
    )
  )
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

    const parsed =
      JSON.parse(saved)

    if (
      !Array.isArray(parsed)
    ) {
      return []
    }

    const facilities = []

    parsed.forEach(
      (vendor) => {
        /*
         * Vendor coordinates are still required
         * internally for distance calculation
         * and route navigation.
         */

        const latitude =
          Number(
            vendor.latitude
          )

        const longitude =
          Number(
            vendor.longitude
          )

        /* Invalid coordinates */
        if (
          !Number.isFinite(
            latitude
          ) ||
          !Number.isFinite(
            longitude
          )
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

        /*
         * Calculate distance from user's
         * current GPS location.
         */
        const distance =
          calculateDistance(
            userLatitude,
            userLongitude,
            latitude,
            longitude
          )

        /*
         * ONLY vendors within 10 KM.
         */
        if (
          distance >
          searchRadiusKm
        ) {
          return
        }

        facilities.push({
          id:
            vendor.id ||
            `local-vendor-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,

          name:
            vendor.businessName ||
            vendor.name ||
            "Registered Waste Facility",

          businessName:
            vendor.businessName ||
            vendor.name ||
            "",

          type:
            vendor.facilityType ||
            vendor.type ||
            "Recycling Centre",

          facilityType:
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

          /*
           * KEEP COORDINATES.
           *
           * MRFRoute / navigation needs these.
           */
          latitude,
          longitude,

          distance,

          sourceType:
            "registered-vendor",

          locationAvailable:
            true,

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

          createdAt:
            vendor.createdAt ||
            null,
        })
      }
    )

    console.info(
      `Local registered vendors found: ${facilities.length}`
    )

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

      /*
       * Only approved vendors
       * from Firestore.
       */
      if (
        data.status !==
        "approved"
      ) {
        return
      }

      const latitude =
        Number(
          data.latitude
        )

      const longitude =
        Number(
          data.longitude
        )

      /*
       * Coordinates are mandatory
       * for nearby search.
       */
      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        )
      ) {
        return
      }

      /*
       * Ignore invalid 0,0 location.
       */
      if (
        latitude === 0 &&
        longitude === 0
      ) {
        return
      }

      /*
       * Calculate distance from
       * user's GPS location.
       */
      const distance =
        calculateDistance(
          userLatitude,
          userLongitude,
          latitude,
          longitude
        )

      /*
       * ONLY vendors within 10 KM.
       */
      if (
        distance >
        searchRadiusKm
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

        businessName:
          data.businessName ||
          data.name ||
          "",

        type:
          data.facilityType ||
          data.type ||
          "Recycling Centre",

        facilityType:
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

        /*
         * KEEP COORDINATES.
         */
        latitude,
        longitude,

        distance,

        sourceType:
          "approved-vendor",

        locationAvailable:
          true,

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
  /*
   * Same exact ID.
   */
  if (
    existing.id &&
    candidate.id &&
    existing.id ===
      candidate.id
  ) {
    return true
  }

  /*
   * Same facility name.
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

  /*
   * Same physical location.
   *
   * Keep vendor and verified facilities
   * separate if they have different names.
   */
  const existingHasCoordinates =
    hasValidCoordinates(
      existing.latitude,
      existing.longitude
    )

  const candidateHasCoordinates =
    hasValidCoordinates(
      candidate.latitude,
      candidate.longitude
    )

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
     * 150 metres.
     */
    if (
      distance < 0.15
    ) {
      return true
    }
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
   PROCESS RESULTS
   ========================================================= */

function processFacilities(
  facilities,
  limit
) {
  /*
   * Final safety filter.
   *
   * Even if any source accidentally returns
   * something outside the radius, it will NOT
   * reach the MRF page.
   */
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
  ).slice(
    0,
    limit
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
     We check local vendors BEFORE cache.

     So if user registers a vendor,
     it can appear immediately without waiting
     for the 10-minute facility cache.
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

    /*
     * Merge cached MRF/OSM/Firestore data
     * with current local vendors.
     */
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

    /*
     * Merge current local vendors
     * with cached facilities.
     */
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
     FINAL 10 KM FILTER
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
    `Final nearby facilities within 10 KM: ${results.length}`
  )

  results.forEach(
    (facility, index) => {
      console.info(
        `${index + 1}. ${facility.name} | ${facility.type} | ${formatDistance(
          facility.distance
        )} | ${facility.sourceType}`
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