import {
  Leaf,
  WalletCards,
  ScanLine,
  MapPin,
  ClipboardCheck,
  Menu,
  X,
  Gift,
} from "lucide-react"

import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

import useAuth from "../../hooks/useAuth"

const PROFILE_KEY = "eco_clean_hub_profile"

function DashboardHeader() {
  const { user, role } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  const loadProfile = () => {
    if (!user) {
      setProfile(null)
      return
    }

    const saved = localStorage.getItem(`${PROFILE_KEY}_${user.uid}`)

    if (saved) {
      try {
        const data = JSON.parse(saved)

        setProfile({
          name:
            data.name ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "User",
          photo: data.photo || "",
        })

        return
      } catch {
        // Fall back to Firebase user information.
      }
    }

    setProfile({
      name:
        user.displayName ||
        user.email?.split("@")[0] ||
        "User",
      photo: user.photoURL || "",
    })
  }

  useEffect(() => {
    loadProfile()
  }, [user])

  useEffect(() => {
    const handleProfileUpdate = () => {
      loadProfile()
    }

    window.addEventListener(
      "eco-clean-hub-profile-updated",
      handleProfileUpdate
    )

    window.addEventListener("storage", handleProfileUpdate)

    return () => {
      window.removeEventListener(
        "eco-clean-hub-profile-updated",
        handleProfileUpdate
      )

      window.removeEventListener("storage", handleProfileUpdate)
    }
  }, [user])

  const userName =
    profile?.name ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "User"

  const userInitials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U"

  const citizenLinks = [
    {
      label: "Scanner",
      path: "/scanner",
      icon: ScanLine,
    },
    {
      label: "MRF",
      path: "/mrf",
      icon: MapPin,
    },
    {
      label: "Verification",
      path: "/verification",
      icon: ClipboardCheck,
    },
    {
      label: "Rewards",
      path: "/rewards",
      icon: WalletCards,
    },
    {
      label: "Donation",
      path: "/donation",
      icon: Gift,
    },
  ]

  const roleLinks = {
    citizen: citizenLinks,
  }

  const navigationLinks = roleLinks[role] || citizenLinks

  return (
    <header className="sticky top-0 z-40 border-b border-[#e3ece6] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-5 lg:px-8">

        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#176b45] text-white">
            <Leaf size={21} strokeWidth={2.5} />
          </div>

          <div>
            <div className="text-lg font-bold tracking-tight">
              Eco<span className="text-[#176b45]">Clean</span>
            </div>

            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Hub
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 lg:flex">
          {navigationLinks.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-green-50 hover:text-[#176b45]"
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          {/* Profile Avatar */}
          <Link
            to="/profile"
            title={`Profile - ${userName}`}
            aria-label="Open Profile"
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-green-100 bg-[#dcefe4] text-sm font-bold text-[#176b45] shadow-sm transition hover:border-green-300 hover:shadow-md"
          >
            {profile?.photo ? (
              <img
                src={profile.photo}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              userInitials
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce9e1] text-slate-700 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-[#e3ece6] bg-white px-4 py-4 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">

            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-[#176b45]"
            >
              Dashboard
            </Link>

            {navigationLinks.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-[#176b45]"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}

            <Link
              to="/activity"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-[#176b45]"
            >
              Activity
            </Link>

            <Link
              to="/leaderboard"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-[#176b45]"
            >
              Leaderboard
            </Link>

            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-[#176b45]"
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-green-100 text-xs font-bold text-[#176b45]">
                {profile?.photo ? (
                  <img
                    src={profile.photo}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>

              <div>
                <div>Profile</div>
                <div className="text-xs font-normal text-slate-500">
                  {userName}
                </div>
              </div>
            </Link>

          </nav>
        </div>
      )}
    </header>
  )
}

export default DashboardHeader