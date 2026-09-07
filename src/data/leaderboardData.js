import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore"

import { db } from "../services/firebase"

/* =====================================================
   LEADERBOARD DATA
   ===================================================== */

/*
  Public leaderboard collection:

  leaderboard/{userId}

  Expected fields:

  {
    uid,
    name,
    credits,
    weeklyCredits,
    monthlyCredits,
    wasteKg,
    verified
  }

  IMPORTANT:
  User-facing leaderboard ab users collection ya
  creditTransactions collection ko directly read nahi karega.

  Isse Firestore permission problem nahi hogi.
*/


/* =====================================================
   NORMALIZE LEADERBOARD USER
   ===================================================== */

function normalizeLeaderboardUser(
  documentSnapshot
) {
  const data =
    documentSnapshot.data() || {}

  const credits =
    Number(data.credits ?? 0)

  const weeklyCredits =
    Number(data.weeklyCredits ?? 0)

  const monthlyCredits =
    Number(data.monthlyCredits ?? 0)

  const wasteKg =
    Number(data.wasteKg ?? 0)

  return {
    uid:
      data.uid ||
      documentSnapshot.id,

    name:
      data.name ||
      data.displayName ||
      data.userName ||
      "Eco User",

    email:
      data.email ||
      "",

    credits:
      Number.isFinite(credits)
        ? credits
        : 0,

    weeklyCredits:
      Number.isFinite(weeklyCredits)
        ? weeklyCredits
        : 0,

    monthlyCredits:
      Number.isFinite(monthlyCredits)
        ? monthlyCredits
        : 0,

    wasteKg:
      Number.isFinite(wasteKg)
        ? wasteKg
        : 0,

    verified:
      data.verified === true,
  }
}


/* =====================================================
   GET LEADERBOARD ENTRIES
   ===================================================== */

export async function getLeaderboardEntries(
  period = "community"
) {
  try {
    const leaderboardRef =
      collection(
        db,
        "leaderboard"
      )

    /*
      orderBy is intentionally NOT used here.

      Reason:
      Existing leaderboard documents may not all have
      the same fields. We fetch the public documents and
      sort them locally.
    */

    const snapshot =
      await getDocs(
        query(
          leaderboardRef
        )
      )

    const users = []

    snapshot.forEach(
      (documentSnapshot) => {
        users.push(
          normalizeLeaderboardUser(
            documentSnapshot
          )
        )
      }
    )

    /*
      Select the correct credit field
      according to the selected tab.
    */

    const entries =
      users.map(
        (user) => {

          let credits = 0

          if (
            period === "weekly"
          ) {
            credits =
              user.weeklyCredits
          } else if (
            period === "monthly"
          ) {
            credits =
              user.monthlyCredits
          } else {
            credits =
              user.credits
          }

          return {
            ...user,
            credits,
          }
        }
      )

    return entries

  } catch (error) {

    console.error(
      "Unable to load leaderboard data:",
      error
    )

    throw error
  }
}


/* =====================================================
   BUILD LEADERBOARD
   ===================================================== */

export function buildLeaderboard({
  entries = [],
} = {}) {

  /*
    Make a new array so original Firebase data
    is not mutated.
  */

  const sortedEntries =
    [...entries].sort(
      (a, b) => {

        const aCredits =
          Number(a.credits ?? 0)

        const bCredits =
          Number(b.credits ?? 0)

        return (
          bCredits -
          aCredits
        )
      }
    )

  /*
    Assign ranking.
  */

  return sortedEntries.map(
    (entry, index) => ({
      ...entry,

      rank:
        index + 1,
    })
  )
}


/* =====================================================
   FIND USER RANK
   ===================================================== */

export function getUserLeaderboardEntry(
  entries = [],
  userId
) {
  if (!userId) {
    return null
  }

  return (
    entries.find(
      (entry) =>
        entry.uid === userId
    ) || null
  )
}


/* =====================================================
   BACKWARD COMPATIBILITY
   ===================================================== */

/*
  These exports are kept so existing files that may
  still import them do not break.

  Actual leaderboard updates will be handled from the
  Admin Eco-Credits flow.
*/

export async function saveLeaderboardEntries() {
  return true
}


export async function updateLeaderboardUser() {
  return true
}