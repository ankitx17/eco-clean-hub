import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"

import { db, auth } from "./firebase"

const FUNDING_REQUESTS_COLLECTION = "fundingRequests"

export async function createFundingRequest(request) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("You must be logged in to submit a funding request.")
  }

  const docRef = await addDoc(
    collection(db, FUNDING_REQUESTS_COLLECTION),
    {
      ...request,
      userId: user.uid,
      applicantEmail: user.email || request?.applicant?.email || "",
      status: "Pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  )

  return docRef.id
}
