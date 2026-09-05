import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"

import { auth, db } from "./firebase"

const FUNDING_REQUESTS_COLLECTION = "fundingRequests"

export async function getFundingRequests() {
  const user = auth.currentUser

  if (!user) {
    throw new Error("You must be logged in.")
  }

  const requestsQuery = query(
    collection(db, FUNDING_REQUESTS_COLLECTION),
    orderBy("createdAt", "desc")
  )

  const snapshot = await getDocs(requestsQuery)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))
}

export async function updateFundingRequestStatus(
  requestId,
  status,
  adminRemark = "",
  approvedAmount = null
) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("You must be logged in.")
  }

  if (!requestId) {
    throw new Error("Funding request ID is required.")
  }

  const allowedStatuses = [
    "Pending",
    "Under Review",
    "Approved",
    "Rejected",
    "More Information",
  ]

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid funding request status.")
  }

  const updateData = {
    status,
    adminRemark: adminRemark.trim(),
    updatedAt: serverTimestamp(),
    reviewedBy: user.uid,
    reviewedAt: serverTimestamp(),
  }

  if (
    approvedAmount !== null &&
    approvedAmount !== "" &&
    !Number.isNaN(Number(approvedAmount))
  ) {
    updateData.approvedAmount = Number(approvedAmount)
  }

  await updateDoc(
    doc(db, FUNDING_REQUESTS_COLLECTION, requestId),
    updateData
  )

  return true
}
