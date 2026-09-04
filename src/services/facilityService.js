/* =========================================================
   Eco Clean Hub
   Verified Facility Service

   Data source:
   - Firestore
   - Every facility is a separate document
   ========================================================= */

import {
  collection,
  getDocs,
} from "firebase/firestore"

import { db } from "./firebase"

/* =========================================================
   ALLOWED FACILITY TYPES
   ========================================================= */

const FACILITY_TYPES = [
  "MRF",
  "Dry Waste Collection Centre",
  "Recycling Centre",
  "E-Waste Recycler",
  "Municipal Waste Facility",
  "Collection Point",
]

/* =========================================================
   NORMALIZE FACILITY TYPE
   ========================================================= */

function normalizeFacilityType(type) {
  if (!type) {
    return "Recycling Centre"
  }

  const value = String(type)
    .trim()
    .toLowerCase()

  if (value === "mrf") {
    return "MRF"
  }

  if (
    value ===
      "dry waste collection centre" ||
    value ===
      "dry waste collection center"
  ) {
    return "Dry Waste Collection Centre"
  }

  if (
    value === "recycling centre" ||
    value === "recycling center"
  ) {
    return "Recycling Centre"
  }

  if (
    value === "e-waste recycler" ||
    value === "e-waste facility" ||
    value === "e-waste"
  ) {
    return "E-Waste Recycler"
  }

  if (
    value ===
      "municipal waste facility" ||
    value ===
      "municipal facility"
  ) {
    return "Municipal Waste Facility"
  }

  if (
    value === "collection point"
  ) {
    return "Collection Point"
  }

  return "Recycling Centre"
}

/* =========================================================
   GET VERIFIED FACILITIES
   ========================================================= */

export async function getVerifiedFacilities(
  latitude,
  longitude,
  searchRadiusKm,
  calculateDistance
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

      /*
       * Only verified facilities
       */

      if (
        data.verified !== true
      ) {
        return
      }

      /*
       * Every facility must have
       * its own valid coordinates.
       */

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

      if (!hasCoordinates) {
        return
      }

      /*
       * Ignore invalid 0,0 coordinates.
       */

      if (
        data.latitude === 0 &&
        data.longitude === 0
      ) {
        return
      }

      /*
       * Calculate distance from
       * user's current location.
       */

      const distance =
        calculateDistance(
          latitude,
          longitude,
          data.latitude,
          data.longitude
        )

      /*
       * Only facilities within
       * the configured radius.
       */

      if (
        distance >
        searchRadiusKm
      ) {
        return
      }

      /*
       * Every Firestore document
       * becomes one facility.
       */

      facilities.push({
        id: documentSnapshot.id,

        name:
          data.name ||
          "Waste Recovery Facility",

        type:
          normalizeFacilityType(
            data.type
          ),

        address:
          data.address ||
          "Address not available",

        city:
          data.city || "",

        state:
          data.state || "",

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

        verified: true,

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

export {
  FACILITY_TYPES,
}