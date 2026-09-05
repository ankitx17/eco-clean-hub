const LEADERBOARD_KEY =
  "eco_clean_hub_leaderboard"

const DEFAULT_CITIZENS = [
  {
    id: "demo-1",
    name: "Eco Warrior",
    credits: 980,
    verified: 28,
    wasteKg: 42.5,
    community: "Delhi",
  },
  {
    id: "demo-2",
    name: "Green Hero",
    credits: 850,
    verified: 24,
    wasteKg: 38.2,
    community: "Faridabad",
  },
  {
    id: "demo-3",
    name: "Clean Earth",
    credits: 720,
    verified: 21,
    wasteKg: 31.7,
    community: "Gurugram",
  },
]

export function getLeaderboardEntries() {
  try {
    const saved =
      localStorage.getItem(
        LEADERBOARD_KEY,
      )

    if (!saved) {
      return DEFAULT_CITIZENS
    }

    const parsed = JSON.parse(saved)

    return Array.isArray(parsed)
      ? parsed
      : DEFAULT_CITIZENS
  } catch {
    return DEFAULT_CITIZENS
  }
}

export function saveLeaderboardEntries(
  entries,
) {
  localStorage.setItem(
    LEADERBOARD_KEY,
    JSON.stringify(entries),
  )
}

export function updateLeaderboardUser({
  userId,
  name,
  credits,
  verified,
  wasteKg,
  community = "My Community",
}) {
  const entries =
    getLeaderboardEntries()

  const existingIndex =
    entries.findIndex(
      (entry) => entry.id === userId,
    )

  const updatedUser = {
    id: userId,
    name: name || "Citizen",
    credits: Number(credits) || 0,
    verified: Number(verified) || 0,
    wasteKg: Number(wasteKg) || 0,
    community,
  }

  if (existingIndex >= 0) {
    entries[existingIndex] =
      updatedUser
  } else {
    entries.push(updatedUser)
  }

  saveLeaderboardEntries(entries)

  return entries
}

export function buildLeaderboard({
  entries,
  period = "weekly",
}) {
  const now = Date.now()

  let filtered = [...entries]

  if (period === "weekly") {
    filtered = filtered.filter(
      (entry) => {
        if (!entry.updatedAt) {
          return true
        }

        const difference =
          now -
          new Date(
            entry.updatedAt,
          ).getTime()

        return (
          difference <=
          7 * 24 * 60 * 60 * 1000
        )
      },
    )
  }

  if (period === "monthly") {
    filtered = filtered.filter(
      (entry) => {
        if (!entry.updatedAt) {
          return true
        }

        const difference =
          now -
          new Date(
            entry.updatedAt,
          ).getTime()

        return (
          difference <=
          30 * 24 * 60 * 60 * 1000
        )
      },
    )
  }

  return filtered
    .sort(
      (a, b) =>
        Number(b.credits || 0) -
        Number(a.credits || 0),
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))
}

export { LEADERBOARD_KEY }