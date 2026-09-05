import {
  Leaf,
  Menu,
  X,
  ArrowRight,
  UserRound,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

const PROFILE_KEY = "eco_clean_hub_profile"

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isHomePage = location.pathname === "/"

  const loadProfile = () => {
    if (!user) {
      setProfile(null)
      return
    }

    const saved = localStorage.getItem(
      `${PROFILE_KEY}_${user.uid}`
    )

    if (saved) {
      try {
        const data = JSON.parse(saved)

        setProfile({
          name:
            data.name ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "Eco Citizen",
          photo: data.photo || "",
        })

        return
      } catch {
        // Use Firebase user information below.
      }
    }

    setProfile({
      name:
        user.displayName ||
        user.email?.split("@")[0] ||
        "Eco Citizen",
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

    window.addEventListener(
      "storage",
      handleProfileUpdate
    )

    return () => {
      window.removeEventListener(
        "eco-clean-hub-profile-updated",
        handleProfileUpdate
      )

      window.removeEventListener(
        "storage",
        handleProfileUpdate
      )
    }
  }, [user])

  const closeMenu = () => {
    setMenuOpen(false)
  }

  // Home button: go to home page and scroll to top
  const handleHomeClick = (event) => {
    event.preventDefault()
    closeMenu()

    if (isHomePage) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } else {
      navigate("/")
    }
  }

  const displayName =
    profile?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Eco Citizen"

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("") || "EC"

  const isLoggedIn = !!user

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto max-w-7xl rounded-2xl border border-white/70 bg-white/80 px-5 py-3 shadow-lg shadow-green-950/5 backdrop-blur-xl">

        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={handleHomeClick}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b8f4d] text-white shadow-lg shadow-green-700/20">
              <Leaf
                size={21}
                strokeWidth={2.5}
              />
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                Eco
                <span className="text-[#0b8f4d]">
                  Clean
                </span>
              </div>

              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Hub
              </div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">

            {/* HOME */}
            <Link
              to="/"
              onClick={handleHomeClick}
              className="text-sm font-medium text-slate-700 transition hover:text-[#0b8f4d]"
            >
              Home
            </Link>

            <a
              href="/#how-it-works"
              className="text-sm font-medium text-slate-700 transition hover:text-[#0b8f4d]"
            >
              How It Works
            </a>

            <a
              href="/#features"
              className="text-sm font-medium text-slate-700 transition hover:text-[#0b8f4d]"
            >
              Features
            </a>

            <a
              href="/#impact"
              className="text-sm font-medium text-slate-700 transition hover:text-[#0b8f4d]"
            >
              Impact
            </a>

          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">

            {/* Home page should always show Login + Get Started */}
            {isHomePage || (!isLoggedIn && !loading) ? (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-green-50"
                >
                  Login
                </Link>

                {/* Get Started */}
                <Link
                  to="/register"
                  className="flex items-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-700/20 transition hover:-translate-y-0.5 hover:bg-[#087b42]"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <>
                {/* Profile icon */}
                <Link
                  to="/profile"
                  title="Profile"
                  aria-label="Open Profile"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-[#0b8f4d]"
                >
                  <UserRound size={19} />
                </Link>

                {/* Avatar */}
                <Link
                  to="/profile"
                  title="Profile"
                  aria-label="Open Profile"
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-green-100 bg-green-100 text-xs font-bold text-[#176b45] shadow-sm transition hover:border-green-300 hover:shadow-md"
                >
                  {profile?.photo ? (
                    <img
                      src={profile.photo}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </Link>
              </>
            )}

          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">

            {!isHomePage && isLoggedIn && !loading && (
              <Link
                to="/profile"
                title="Profile"
                aria-label="Open Profile"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-green-100 bg-green-100 text-xs font-bold text-[#176b45]"
              >
                {profile?.photo ? (
                  <img
                    src={profile.photo}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
              className="rounded-xl p-2 text-slate-700"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

          </div>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mt-4 border-t border-slate-100 pt-4 md:hidden">

            <div className="flex flex-col gap-2">

              {/* HOME */}
              <Link
                to="/"
                onClick={handleHomeClick}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-green-50"
              >
                Home
              </Link>

              <a
                href="/#how-it-works"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-green-50"
              >
                How It Works
              </a>

              <a
                href="/#features"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-green-50"
              >
                Features
              </a>

              <a
                href="/#impact"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-green-50"
              >
                Impact
              </a>

              {/* Home page: Login + Get Started */}
              {isHomePage || (!isLoggedIn && !loading) ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="mt-2 rounded-xl border border-green-200 px-4 py-3 text-center text-sm font-semibold text-[#0b8f4d]"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="rounded-xl bg-[#0b8f4d] px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="mt-2 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-[#0b8f4d]"
                >
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-green-100 text-xs font-bold">
                    {profile?.photo ? (
                      <img
                        src={profile.photo}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div>
                    <div>Profile</div>
                    <div className="text-xs font-normal text-slate-500">
                      {displayName}
                    </div>
                  </div>
                </Link>
              )}

            </div>

          </div>
        )}

      </nav>
    </header>
  )
}

export default Navbar