import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Crown,
  RefreshCw,
  Search,
} from "lucide-react"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore"

import { db } from "../../src/services/firebase"


function Credits() {
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  // =====================================================
  // GET TRANSACTION DATE
  // =====================================================

  const getTransactionDate = (transaction) => {
    const value =
      transaction.createdAt ||
      transaction.timestamp

    if (!value) {
      return null
    }

    try {
      if (
        value &&
        typeof value.toDate === "function"
      ) {
        return value.toDate()
      }

      const date = new Date(value)

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return null
      }

      return date
    } catch {
      return null
    }
  }


  // =====================================================
  // SYNC USERS → LEADERBOARD
  // =====================================================

  const syncLeaderboard = async (
    userData,
    transactionData
  ) => {
    if (!userData.length) {
      return
    }

    const now = new Date()

    // Start of current week
    const startOfWeek = new Date(now)
    const day = startOfWeek.getDay()

    startOfWeek.setDate(
      startOfWeek.getDate() -
        (day === 0 ? 6 : day - 1)
    )

    startOfWeek.setHours(
      0,
      0,
      0,
      0
    )

    // Start of current month
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    )


    // -----------------------------------------------------
    // Calculate credits for each user
    // -----------------------------------------------------

    const leaderboardUsers =
      userData.map((user) => {
        const userId =
          user.uid || user.id

        const totalCredits =
          Number(
            user.totalCredits || 0
          )


        let weeklyCredits = 0
        let monthlyCredits = 0
        let verified = 0


        transactionData.forEach(
          (transaction) => {
            if (
              transaction.userId !==
              userId
            ) {
              return
            }


            const amount =
              Number(
                transaction.amount ??
                  transaction.creditsEarned ??
                  0
              )


            // Only earned credits
            // count for weekly/monthly
            // leaderboard.
            if (amount <= 0) {
              return
            }


            const transactionDate =
              getTransactionDate(
                transaction
              )


            if (!transactionDate) {
              return
            }


            if (
              transactionDate >=
              startOfWeek
            ) {
              weeklyCredits += amount
            }


            if (
              transactionDate >=
              startOfMonth
            ) {
              monthlyCredits += amount
            }


            verified += 1
          }
        )


        return {
          uid: userId,

          name:
            user.name ||
            user.displayName ||
            user.userName ||
            user.email ||
            "Eco User",

          credits:
            totalCredits,

          weeklyCredits,

          monthlyCredits,

          // Keep these fields because
          // Leaderboard.jsx displays them.
          verified,

          wasteKg:
            Number(
              user.wasteKg || 0
            ),
        }
      })


    // -----------------------------------------------------
    // Write leaderboard documents
    // -----------------------------------------------------

    // Firestore batch limit is 500 writes.
    // Use chunks so this also works with
    // a larger number of users.

    for (
      let i = 0;
      i < leaderboardUsers.length;
      i += 450
    ) {
      const batch = writeBatch(db)

      const chunk =
        leaderboardUsers.slice(
          i,
          i + 450
        )


      chunk.forEach(
        (leaderboardUser) => {
          const leaderboardRef =
            doc(
              db,
              "leaderboard",
              leaderboardUser.uid
            )


          batch.set(
            leaderboardRef,
            leaderboardUser,
            {
              merge: true,
            }
          )
        }
      )


      await batch.commit()
    }
  }


  // =====================================================
  // LOAD CREDIT DATA
  // =====================================================

  const loadCreditData = async () => {
    try {
      setLoading(true)
      setError("")


      // -------------------------------------------------
      // USERS
      // -------------------------------------------------

      const usersSnapshot =
        await getDocs(
          collection(
            db,
            "users"
          )
        )


      const userData =
        usersSnapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        )


      // -------------------------------------------------
      // CREDIT TRANSACTIONS
      // -------------------------------------------------

      const transactionsSnapshot =
        await getDocs(
          collection(
            db,
            "creditTransactions"
          )
        )


      const transactionData =
        transactionsSnapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        )


      // -------------------------------------------------
      // SYNC LEADERBOARD
      // -------------------------------------------------

      await syncLeaderboard(
        userData,
        transactionData
      )


      // -------------------------------------------------
      // SET ADMIN DATA
      // -------------------------------------------------

      setUsers(userData)
      setTransactions(
        transactionData
      )

    } catch (error) {
      console.error(
        "Failed to load credit data:",
        error
      )

      setError(
        "Unable to load Eco-Credits data."
      )
    } finally {
      setLoading(false)
    }
  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadCreditData()
  }, [])


  // =====================================================
  // TOTAL USER BALANCE
  // =====================================================

  const totalUserCredits =
    useMemo(() => {
      return users.reduce(
        (total, user) =>
          total +
          Number(
            user.totalCredits || 0
          ),
        0
      )
    }, [users])


  // =====================================================
  // TOTAL EARNED
  // =====================================================

  const totalIssuedCredits =
    useMemo(() => {
      return transactions
        .filter(
          (transaction) =>
            Number(
              transaction.amount ??
                transaction.creditsEarned ??
                0
            ) > 0
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(
              transaction.amount ??
                transaction.creditsEarned ??
                0
            ),
          0
        )
    }, [transactions])


  // =====================================================
  // TOTAL SPENT
  // =====================================================

  const totalSpentCredits =
    useMemo(() => {
      return Math.abs(
        transactions
          .filter(
            (transaction) =>
              Number(
                transaction.amount ??
                  transaction.creditsEarned ??
                  0
              ) < 0
          )
          .reduce(
            (total, transaction) =>
              total +
              Number(
                transaction.amount ??
                  transaction.creditsEarned ??
                  0
              ),
            0
          )
      )
    }, [transactions])


  // =====================================================
  // TOP USER
  // =====================================================

  const topUser =
    useMemo(() => {
      if (!users.length) {
        return null
      }

      return [...users].sort(
        (a, b) =>
          Number(
            b.totalCredits || 0
          ) -
          Number(
            a.totalCredits || 0
          )
      )[0]
    }, [users])


  const topUserCredits =
    Number(
      topUser?.totalCredits || 0
    )


  const topUserName =
    topUser?.name ||
    topUser?.displayName ||
    topUser?.email ||
    "No user"


  // =====================================================
  // FILTER + SORT USERS
  // =====================================================

  const filteredUsers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()


      const sortedUsers =
        [...users].sort(
          (a, b) =>
            Number(
              b.totalCredits || 0
            ) -
            Number(
              a.totalCredits || 0
            )
        )


      if (!query) {
        return sortedUsers
      }


      return sortedUsers.filter(
        (user) => {
          const name =
            String(
              user.name ||
                user.displayName ||
                ""
            ).toLowerCase()


          const email =
            String(
              user.email || ""
            ).toLowerCase()


          return (
            name.includes(query) ||
            email.includes(query)
          )
        }
      )
    }, [users, search])


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "—"
    }

    try {
      if (
        value &&
        typeof value.toDate ===
          "function"
      ) {
        return value
          .toDate()
          .toLocaleString()
      }


      const date =
        new Date(value)


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "—"
      }


      return date.toLocaleString()

    } catch {
      return "—"
    }
  }


  // =====================================================
  // GET USER NAME FOR TRANSACTION
  // =====================================================

  const getTransactionUserName =
    (transaction) => {

      if (
        transaction.userName ||
        transaction.email
      ) {
        return (
          transaction.userName ||
          transaction.email
        )
      }


      const matchingUser =
        users.find(
          (user) =>
            user.id ===
              transaction.userId ||
            user.uid ===
              transaction.userId
        )


      return (
        matchingUser?.name ||
        matchingUser?.displayName ||
        matchingUser?.email ||
        transaction.userId ||
        "Unknown"
      )
    }


  return (
    <div className="space-y-6">

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#176b45]">
            Management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#14231a]">
            Eco-Credits
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Monitor citizen Eco-Credit balances,
            earnings and spending.
          </p>

        </div>


        <button
          type="button"
          onClick={loadCreditData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#176b45] hover:text-[#176b45] disabled:cursor-not-allowed disabled:opacity-60"
        >

          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}


      {/* =================================================
          STAT CARDS
          ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Balance */}

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total User Balance
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {loading
                  ? "..."
                  : totalUserCredits.toLocaleString()}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Credits currently held
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
              <Coins size={22} />
            </div>

          </div>

        </div>


        {/* Issued */}

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Credits Issued
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {loading
                  ? "..."
                  : totalIssuedCredits.toLocaleString()}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Total positive transactions
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">

              <ArrowUpRight
                size={22}
              />

            </div>

          </div>

        </div>


        {/* Spent */}

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Credits Redeemed
              </p>

              <p className="mt-2 text-3xl font-black text-[#14231a]">
                {loading
                  ? "..."
                  : totalSpentCredits.toLocaleString()}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Total spent credits
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

              <ArrowDownLeft
                size={22}
              />

            </div>

          </div>

        </div>


        {/* Top User */}

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="min-w-0">

              <p className="text-sm font-medium text-slate-500">
                Top Eco-Citizen
              </p>

              <p className="mt-2 truncate text-xl font-black text-[#14231a]">
                {loading
                  ? "..."
                  : topUserName}
              </p>

              <p className="mt-2 text-xs font-semibold text-[#176b45]">
                {loading
                  ? "..."
                  : `${topUserCredits.toLocaleString()} Eco-Credits`}
              </p>

            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Crown size={22} />
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          USER CREDIT BALANCES
          ================================================= */}

      <section className="rounded-3xl border border-[#dce9e1] bg-white shadow-sm">

        <div className="border-b border-[#edf2ee] p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-lg font-black text-[#14231a]">
                User Credit Balances
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current Eco-Credit balance of each citizen.
              </p>

            </div>

            <div className="relative w-full lg:w-80">

              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search user or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#176b45] focus:bg-white"
              />

            </div>

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead>

              <tr className="border-b border-[#edf2ee] bg-[#f8fbf9] text-left">

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rank
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  User
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Eco-Credits
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center"
                  >

                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">

                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />

                      Loading credit data...

                    </div>

                  </td>

                </tr>

              ) : filteredUsers.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center"
                  >

                    <Coins
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-600">
                      No users found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      No matching citizen account was found.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredUsers.map(
                  (user, index) => {

                    const balance =
                      Number(
                        user.totalCredits ||
                        0
                      )


                    return (
                      <tr
                        key={user.id}
                        className="border-b border-[#edf2ee] last:border-b-0"
                      >

                        {/* Rank */}

                        <td className="px-6 py-4">

                          <span
                            className={[
                              "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-black",
                              index === 0
                                ? "bg-amber-50 text-amber-600"
                                : index === 1
                                  ? "bg-slate-100 text-slate-600"
                                  : index === 2
                                    ? "bg-orange-50 text-orange-600"
                                    : "bg-[#f1f6f3] text-[#176b45]",
                            ].join(" ")}
                          >
                            {index + 1}
                          </span>

                        </td>


                        {/* User */}

                        <td className="px-6 py-4">

                          <p className="text-sm font-bold text-slate-700">
                            {user.name ||
                              user.displayName ||
                              "Unknown User"}
                          </p>

                        </td>


                        {/* Email */}

                        <td className="px-6 py-4">

                          <p className="text-sm text-slate-500">
                            {user.email ||
                              "—"}
                          </p>

                        </td>


                        {/* Role */}

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                            {user.role ||
                              user.userType ||
                              "citizen"}
                          </span>

                        </td>


                        {/* Credits */}

                        <td className="px-6 py-4">

                          <div className="inline-flex items-center gap-2">

                            <Coins
                              size={16}
                              className="text-[#176b45]"
                            />

                            <span className="text-sm font-black text-[#176b45]">
                              {balance.toLocaleString()}
                            </span>

                          </div>

                        </td>


                        {/* Status */}

                        <td className="px-6 py-4">

                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-bold",
                              user.status ===
                                "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-500",
                            ].join(" ")}
                          >
                            {user.status ||
                              "active"}
                          </span>

                        </td>

                      </tr>
                    )
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =================================================
          TRANSACTION HISTORY
          ================================================= */}

      <section className="rounded-3xl border border-[#dce9e1] bg-white shadow-sm">

        <div className="border-b border-[#edf2ee] p-6">

          <h2 className="text-lg font-black text-[#14231a]">
            Credit Transaction History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recent Eco-Credit earning and spending activity.
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead>

              <tr className="border-b border-[#edf2ee] bg-[#f8fbf9] text-left">

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  User
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reason
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Activity
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Date
                </th>

              </tr>

            </thead>


            <tbody>

              {transactions.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center"
                  >

                    <Coins
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-600">
                      No credit transactions yet
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Credit earning and spending history will appear here.
                    </p>

                  </td>

                </tr>

              ) : (

                transactions.map(
                  (transaction) => {

                    const amount =
                      Number(
                        transaction.amount ??
                          transaction.creditsEarned ??
                          0
                      )


                    const isPositive =
                      amount > 0


                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-[#edf2ee] last:border-b-0"
                      >

                        <td className="px-6 py-4">

                          <p className="text-sm font-bold text-slate-700">
                            {getTransactionUserName(
                              transaction
                            )}
                          </p>

                        </td>


                        <td className="px-6 py-4">

                          <span
                            className={[
                              "inline-flex items-center gap-1 text-sm font-black",
                              isPositive
                                ? "text-green-600"
                                : "text-red-600",
                            ].join(" ")}
                          >

                            {isPositive ? (
                              <ArrowUpRight
                                size={16}
                              />
                            ) : (
                              <ArrowDownLeft
                                size={16}
                              />
                            )}

                            {isPositive
                              ? "+"
                              : ""}

                            {amount.toLocaleString()}

                          </span>

                        </td>


                        <td className="px-6 py-4">

                          <p className="max-w-xs text-sm text-slate-600">
                            {transaction.reason ||
                              transaction.description ||
                              "Eco-Credit transaction"}
                          </p>

                        </td>


                        <td className="px-6 py-4">

                          <p className="text-xs font-semibold text-slate-500">
                            {transaction.activityId ||
                              transaction.submissionId ||
                              "—"}
                          </p>

                        </td>


                        <td className="px-6 py-4">

                          <p className="text-xs text-slate-500">
                            {formatDate(
                              transaction.createdAt ||
                                transaction.timestamp
                            )}
                          </p>

                        </td>

                      </tr>
                    )
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  )
}


export default Credits