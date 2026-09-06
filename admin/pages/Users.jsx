import { useEffect, useMemo, useState } from "react"
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore"
import {
  Search,
  Users as UsersIcon,
  Mail,
  CalendarDays,
  ShieldCheck,
  RefreshCw,
} from "lucide-react"

import { db } from "../../src/services/firebase"

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError("")

      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
      )

      const snapshot = await getDocs(usersQuery)

      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setUsers(userList)
    } catch (err) {
      console.error("Failed to load users:", err)
      setError(
        "Users load nahi ho paaye. Firestore rules ya users collection check karo."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase()

    if (!value) {
      return users
    }

    return users.filter((user) => {
      const name = String(user.name || "").toLowerCase()
      const email = String(user.email || "").toLowerCase()
      const role = String(user.role || "").toLowerCase()

      return (
        name.includes(value) ||
        email.includes(value) ||
        role.includes(value)
      )
    })
  }, [users, search])

  const formatDate = (value) => {
    if (!value) {
      return "—"
    }

    try {
      const date =
        typeof value?.toDate === "function"
          ? value.toDate()
          : new Date(value)

      if (Number.isNaN(date.getTime())) {
        return "—"
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return "—"
    }
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#087f47]">
            Management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#12251c]">
            Users
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and manage registered Eco Clean Hub users.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#0b8f4d] hover:text-[#087f47] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-black text-[#12251c]">
                {users.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f5ec] text-[#087f47]">
              <UsersIcon size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Citizens
              </p>

              <p className="mt-2 text-3xl font-black text-[#12251c]">
                {
                  users.filter(
                    (user) =>
                      user.role === "citizen" ||
                      !user.role
                  ).length
                }
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <UsersIcon size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce9e1] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Admins
              </p>

              <p className="mt-2 text-3xl font-black text-[#12251c]">
                {
                  users.filter(
                    (user) => user.role === "admin"
                  ).length
                }
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="rounded-2xl border border-[#dce9e1] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, email or role..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0b8f4d] focus:bg-white focus:ring-2 focus:ring-[#0b8f4d]/10"
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* USERS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#dce9e1] bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-[#12251c]">
            Registered Users
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredUsers.length} user
            {filteredUsers.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0b8f4d] border-t-transparent" />

              <p className="text-sm font-medium text-slate-500">
                Loading users...
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f5ec] text-[#087f47]">
              <UsersIcon size={24} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#12251c]">
              No users found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Registered users will appear here once they are
              saved in the Firestore users collection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e5f5ec] font-bold text-[#087f47]">
                          {String(
                            user.name ||
                              user.email ||
                              "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {user.name || "Unnamed User"}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail size={13} />

                            <span className="truncate">
                              {user.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                        {user.role || "citizen"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Active
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={15} />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Users