import { useEffect, useState } from "react"
import {
  Activity,
  Building2,
  CheckCircle2,
  Coins,
  Users,
} from "lucide-react"

import {
  collection,
  getDocs,
} from "firebase/firestore"

import useAdminAuth from "../hooks/useAdminAuth"
import { db } from "../../src/services/firebase"

function Dashboard() {
  const { user } = useAdminAuth()

  const [totalUsers, setTotalUsers] = useState(0)
  const [totalVendors, setTotalVendors] = useState(0)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoadingStats(true)

        /* ================================
           TOTAL USERS
           ================================ */

        const usersSnapshot = await getDocs(
          collection(db, "users")
        )

        setTotalUsers(usersSnapshot.size)


        /* ================================
           TOTAL VENDORS / FACILITIES
           ================================

           Approved vendors become facilities.
           Therefore dashboard vendor count
           comes from the facilities collection.
        */

        const facilitiesSnapshot = await getDocs(
          collection(db, "facilities")
        )

        setTotalVendors(facilitiesSnapshot.size)

      } catch (error) {
        console.error(
          "Failed to load dashboard stats:",
          error
        )
      } finally {
        setLoadingStats(false)
      }
    }

    loadDashboardStats()
  }, [])

  const stats = [
    {
      title: "Total Users",
      value: loadingStats ? "..." : totalUsers,
      icon: Users,
      description: "Registered citizens",
    },
    {
      title: "Total Vendors",
      value: loadingStats ? "..." : totalVendors,
      icon: Building2,
      description: "Approved facilities",
    },
    {
      title: "Eco-Credits",
      value: "0",
      icon: Coins,
      description: "Credits issued",
    },
    {
      title: "Verified Actions",
      value: "0",
      icon: CheckCircle2,
      description: "Verified waste actions",
    },
  ]

  return (
    <div>
      {/* Page Header */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#176b45]">
            Overview
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#14231a]">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Monitor Eco Clean Hub from one central control
            panel.
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce9e1] bg-white px-4 py-3">
          <p className="text-xs text-slate-400">
            Signed in as
          </p>

          <p className="mt-1 text-sm font-bold text-slate-700">
            {user?.email || "Admin"}
          </p>
        </div>
      </div>


      {/* Stats */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(
          ({
            title,
            value,
            icon: Icon,
            description,
          }) => (
            <div
              key={title}
              className="rounded-3xl border border-[#dce9e1] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {title}
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#14231a]">
                    {value}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {description}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f4ec] text-[#176b45]">
                  <Icon size={21} />
                </div>
              </div>
            </div>
          )
        )}
      </div>


      {/* Main Content */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

        {/* Recent Activity */}

        <section className="rounded-3xl border border-[#dce9e1] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#14231a]">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest activity across the platform.
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
              <Activity size={19} />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-[#dce9e1] bg-[#f8fbf9] p-8 text-center">
            <Activity
              size={28}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-600">
              No recent activity yet
            </p>

            <p className="mt-1 text-sm text-slate-400">
              User and waste activity will appear here once
              connected to Firestore.
            </p>
          </div>
        </section>


        {/* Pending Actions */}

        <section className="rounded-3xl border border-[#dce9e1] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#14231a]">
            Pending Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Items that may require admin attention.
          </p>

          <div className="mt-6 space-y-3">

            <div className="flex items-center justify-between rounded-2xl bg-[#f8fbf9] p-4">
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Vendor Applications
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Waiting for review
                </p>
              </div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                0
              </span>
            </div>


            <div className="flex items-center justify-between rounded-2xl bg-[#f8fbf9] p-4">
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Verifications
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Need review
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                0
              </span>
            </div>


            <div className="flex items-center justify-between rounded-2xl bg-[#f8fbf9] p-4">
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Reward Redemptions
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Waiting for processing
                </p>
              </div>

              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                0
              </span>
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}

export default Dashboard