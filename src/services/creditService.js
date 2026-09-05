const CREDIT_KEY = (userId) =>
  `eco_clean_hub_credits_${userId}`

const TRANSACTION_KEY = (userId) =>
  `eco_clean_hub_credit_transactions_${userId}`

const REDEMPTION_KEY = (userId) =>
  `eco_clean_hub_redemptions_${userId}`

const ACTIVITY_KEY = (userId) =>
  `eco_clean_hub_activity_${userId}`


export const CREDIT_RULES = {
  Plastic: 25,
  Paper: 20,
  Glass: 25,
  Metal: 30,
  Organic: 20,
  "E-Waste": 40,
  Textile: 30,
  Hazardous: 50,
  Other: 10,
  "Non-Waste": 0,
}


export const CLEANUP_REWARD = 10


export const REWARD_CATALOG = [
  {
    id: "plant-kit",
    title: "Eco Plant Kit",
    description:
      "Plant a small tree or grow your own eco-friendly plant.",
    cost: 300,
    icon: "🌱",
  },

  {
    id: "reusable-bottle",
    title: "Reusable Bottle",
    description:
      "Reusable bottle for your everyday hydration.",
    cost: 500,
    icon: "💧",
  },

  {
    id: "eco-bag",
    title: "Eco-Friendly Bag",
    description:
      "Reusable shopping bag to reduce plastic waste.",
    cost: 400,
    icon: "🛍️",
  },

  {
    id: "tree-donation",
    title: "Tree Plantation",
    description:
      "Support one tree plantation through your Eco impact.",
    cost: 750,
    icon: "🌳",
  },

  {
    id: "eco-badge",
    title: "Green Champion Badge",
    description:
      "Unlock a special Eco Clean Hub achievement badge.",
    cost: 1000,
    icon: "🏆",
  },
]


const readJSON = (
  key,
  fallback,
) => {
  try {
    const value =
      localStorage.getItem(key)

    if (!value) {
      return fallback
    }

    const parsed =
      JSON.parse(value)

    return parsed ?? fallback
  } catch (error) {
    console.error(
      "Failed to read localStorage:",
      error,
    )

    return fallback
  }
}


const writeJSON = (
  key,
  value,
) => {
  localStorage.setItem(
    key,
    JSON.stringify(value),
  )
}


export function getCreditBalance(
  userId,
) {
  if (!userId) {
    return 0
  }

  return Number(
    localStorage.getItem(
      CREDIT_KEY(userId),
    ) || 0,
  )
}


export function getCreditTransactions(
  userId,
) {
  if (!userId) {
    return []
  }

  return readJSON(
    TRANSACTION_KEY(userId),
    [],
  )
}


export function getRedemptions(
  userId,
) {
  if (!userId) {
    return []
  }

  return readJSON(
    REDEMPTION_KEY(userId),
    [],
  )
}


export function getCreditsForCategory(
  category,
) {
  if (!category) {
    return 0
  }

  return (
    CREDIT_RULES[category] ??
    CREDIT_RULES.Other
  )
}


const saveBalance = (
  userId,
  balance,
) => {
  localStorage.setItem(
    CREDIT_KEY(userId),
    String(
      Math.max(
        0,
        Math.round(balance),
      ),
    ),
  )
}


const addTransaction = (
  userId,
  transaction,
) => {
  const transactions =
    getCreditTransactions(
      userId,
    )

  const updated = [
    transaction,
    ...transactions,
  ]

  writeJSON(
    TRANSACTION_KEY(userId),
    updated,
  )
}


/*
 * Add credits to user's wallet.
 *
 * IMPORTANT:
 * This function returns:
 *
 * {
 *   awarded: true,
 *   credits: number,
 *   balance: number,
 *   transaction: object
 * }
 *
 * SubmitCleanup.jsx uses `credits`
 * from this return value.
 */
export function addCredits({
  userId,
  amount,
  title,
  type = "earning",
  referenceId = null,
  metadata = {},
}) {
  if (!userId) {
    throw new Error(
      "User is required.",
    )
  }

  const credits =
    Number(amount)

  if (
    !Number.isFinite(
      credits,
    ) ||
    credits <= 0
  ) {
    throw new Error(
      "Credit amount must be greater than zero.",
    )
  }

  const currentBalance =
    getCreditBalance(
      userId,
    )

  const newBalance =
    currentBalance +
    credits

  saveBalance(
    userId,
    newBalance,
  )

  const transaction = {
    id:
      `credit_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    userId,

    amount: credits,

    title,

    type,

    referenceId,

    metadata,

    createdAt:
      new Date().toISOString(),
  }

  addTransaction(
    userId,
    transaction,
  )

  window.dispatchEvent(
    new Event(
      "eco-clean-hub-credits-updated",
    ),
  )

  return {
    awarded: true,

    credits,

    balance:
      newBalance,

    transaction,
  }
}


export function calculateScanCredits(
  category,
) {
  return getCreditsForCategory(
    category,
  )
}


/*
 * Award credits for an AI waste scan.
 *
 * Each activityId can receive
 * scan credits only once.
 */
export function awardScanCredits({
  userId,
  activityId,
  category,
  title,
}) {
  if (
    !userId ||
    !activityId
  ) {
    return {
      awarded: false,
      credits: 0,
      balance:
        getCreditBalance(
          userId,
        ),
    }
  }

  const transactions =
    getCreditTransactions(
      userId,
    )

  const alreadyAwarded =
    transactions.some(
      (transaction) =>
        transaction.type ===
          "scan" &&
        transaction.referenceId ===
          activityId,
    )

  if (alreadyAwarded) {
    return {
      awarded: false,
      credits: 0,
      balance:
        getCreditBalance(
          userId,
        ),
    }
  }

  const credits =
    calculateScanCredits(
      category,
    )

  if (credits <= 0) {
    return {
      awarded: false,
      credits: 0,
      balance:
        getCreditBalance(
          userId,
        ),
    }
  }

  return addCredits({
    userId,

    amount: credits,

    title:
      title ||
      `${category} waste classified`,

    type: "scan",

    referenceId:
      activityId,

    metadata: {
      category,
    },
  })
}


/*
 * Award cleanup reward.
 *
 * IMPORTANT:
 * Cleanup reward is awarded only once
 * for a particular submissionId.
 */
export function awardCleanupCredits({
  userId,
  submissionId,
  verificationScore,
}) {
  if (
    !userId ||
    !submissionId
  ) {
    return {
      awarded: false,
      credits: 0,
      balance:
        getCreditBalance(
          userId,
        ),
    }
  }

  const transactions =
    getCreditTransactions(
      userId,
    )

  const alreadyAwarded =
    transactions.some(
      (transaction) =>
        transaction.type ===
          "cleanup" &&
        transaction.referenceId ===
          submissionId,
    )

  if (alreadyAwarded) {
    return {
      awarded: false,
      credits: 0,
      balance:
        getCreditBalance(
          userId,
        ),
    }
  }

  return addCredits({
    userId,

    amount:
      CLEANUP_REWARD,

    title:
      "Cleanup mission verified",

    type:
      "cleanup",

    referenceId:
      submissionId,

    metadata: {
      verificationScore,
    },
  })
}


/*
 * Redeem a reward.
 */
export function redeemReward({
  userId,
  rewardId,
}) {
  if (!userId) {
    throw new Error(
      "User is required.",
    )
  }

  const reward =
    REWARD_CATALOG.find(
      (item) =>
        item.id ===
        rewardId,
    )

  if (!reward) {
    throw new Error(
      "Reward not found.",
    )
  }

  const currentBalance =
    getCreditBalance(
      userId,
    )

  if (
    currentBalance <
    reward.cost
  ) {
    throw new Error(
      `You need ${
        reward.cost -
        currentBalance
      } more credits.`,
    )
  }

  const redemptions =
    getRedemptions(
      userId,
    )

  const redemption = {
    id:
      `redemption_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    userId,

    rewardId:
      reward.id,

    rewardTitle:
      reward.title,

    cost:
      reward.cost,

    status:
      "Redeemed",

    createdAt:
      new Date().toISOString(),
  }

  const newBalance =
    currentBalance -
    reward.cost

  saveBalance(
    userId,
    newBalance,
  )

  writeJSON(
    REDEMPTION_KEY(userId),
    [
      redemption,
      ...redemptions,
    ],
  )

  addTransaction(
    userId,
    {
      id:
        `debit_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      userId,

      amount:
        -reward.cost,

      title:
        `Redeemed ${reward.title}`,

      type:
        "redemption",

      referenceId:
        redemption.id,

      metadata: {
        rewardId:
          reward.id,
      },

      createdAt:
        redemption.createdAt,
    },
  )

  window.dispatchEvent(
    new Event(
      "eco-clean-hub-credits-updated",
    ),
  )

  return {
    redemption,

    balance:
      newBalance,
  }
}


/*
 * User statistics.
 */
export function getUserStats(
  userId,
) {
  if (!userId) {
    return {
      credits: 0,
      scans: 0,
      verified: 0,
      wasteKg: 0,
      earnedCredits: 0,
    }
  }

  const activities =
    readJSON(
      ACTIVITY_KEY(userId),
      [],
    )

  const transactions =
    getCreditTransactions(
      userId,
    )

  const scans =
    activities.length

  const verified =
    activities.filter(
      (activity) =>
        activity.status ===
          "verified" ||
        activity.status ===
          "Verified" ||
        activity.verified ===
          true,
    ).length

  const wasteKg =
    activities.reduce(
      (total, activity) =>
        total +
        (Number(
          activity.weightKg,
        ) || 0),
      0,
    )

  const earnedCredits =
    transactions
      .filter(
        (transaction) =>
          Number(
            transaction.amount,
          ) > 0,
      )
      .reduce(
        (
          total,
          transaction,
        ) =>
          total +
          Number(
            transaction.amount,
          ),
        0,
      )

  return {
    credits:
      getCreditBalance(
        userId,
      ),

    scans,

    verified,

    wasteKg:
      Number(
        wasteKg.toFixed(2),
      ),

    earnedCredits,
  }
}


export {
  CREDIT_KEY,
  TRANSACTION_KEY,
  REDEMPTION_KEY,
}