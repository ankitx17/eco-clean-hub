import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"

import { db } from "./firebase"

const VENDOR_APPLICATIONS_COLLECTION =
  "vendorApplications"

export async function submitVendorApplication(form) {
  if (!form) {
    throw new Error("Vendor registration data is required.")
  }

  const ownerName = String(
    form.ownerName || ""
  ).trim()

  const businessName = String(
    form.businessName || ""
  ).trim()

  const email = String(
    form.email || ""
  ).trim()

  const phone = String(
    form.phone || ""
  ).trim()

  const facilityType = String(
    form.facilityType || ""
  ).trim()

  const address = String(
    form.address || ""
  ).trim()

  const city = String(
    form.city || ""
  ).trim()

  const state = String(
    form.state || ""
  ).trim()

  const pincode = String(
    form.pincode || ""
  ).trim()

  const acceptedWaste = Array.isArray(
    form.acceptedWaste
  )
    ? form.acceptedWaste
    : []

  if (
    !ownerName ||
    !businessName ||
    !email ||
    !phone ||
    !facilityType ||
    !address ||
    !city ||
    !state ||
    !pincode
  ) {
    throw new Error(
      "Please complete all required vendor details."
    )
  }

  if (acceptedWaste.length === 0) {
    throw new Error(
      "Please select at least one accepted waste type."
    )
  }

  let latitude = null
  let longitude = null

  if (
    form.latitude !== "" &&
    form.latitude !== null &&
    form.latitude !== undefined
  ) {
    latitude = Number(form.latitude)

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      throw new Error("Invalid latitude.")
    }
  }

  if (
    form.longitude !== "" &&
    form.longitude !== null &&
    form.longitude !== undefined
  ) {
    longitude = Number(form.longitude)

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error("Invalid longitude.")
    }
  }

  const application = {
    ownerName,
    businessName,
    email,
    phone,

    facilityType,

    address,
    city,
    state,
    pincode,

    latitude,
    longitude,

    acceptedWaste,

    description: String(
      form.description || ""
    ).trim(),

    registrationNumber: String(
      form.registrationNumber || ""
    ).trim(),

    /*
     * Vendor applications are never immediately
     * treated as approved facilities.
     */
    status: "pending",

    verified: false,

    source: "Vendor Registration",

    submittedAt: serverTimestamp(),
  }

  try {
    const documentReference = await addDoc(
      collection(
        db,
        VENDOR_APPLICATIONS_COLLECTION
      ),
      application
    )

    return {
      applicationId: documentReference.id,
      status: "pending",
    }
  } catch (error) {
    console.error(
      "Failed to submit vendor application:",
      error
    )

    throw new Error(
      "Unable to submit your vendor application. Please check your connection and try again."
    )
  }
}

export {
  VENDOR_APPLICATIONS_COLLECTION,
}