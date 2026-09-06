import {
  Activity,
  Building2,
  CheckCircle2,
  Coins,
  Gift,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Users,
  HandCoins,
  PlayCircle,
} from "lucide-react"

import {
  NavLink,
  useNavigate,
} from "react-router-dom"

import {
  signOut,
} from "firebase/auth"

import { auth } from "../../src/services/firebase"


function AdminSidebar() {
  const navigate = useNavigate()

  const navigation = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },

    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },

    {
      label: "Vendors",
      path: "/admin/vendors",
      icon: Building2,
    },

    {
      label: "Facilities",
      path: "/admin/facilities",
      icon: ListChecks,
    },

    {
      label: "Verifications",
      path: "/admin/verifications",
      icon: CheckCircle2,
    },

    {
      label: "Green Fund Requests",
      path: "/admin/fund-requests",
      icon: HandCoins,
    },

    {
      label: "Eco Video Review",
      path: "/admin/video-review",
      icon: PlayCircle,
    },

    {
      label: "Activities",
      path: "/admin/activities",
      icon: Activity,
    },

    {
      label: "Eco-Credits",
      path: "/admin/credits",
      icon: Coins,
    },

    {
      label: "Rewards",
      path: "/admin/rewards",
      icon: Gift,
    },
  ]


  const handleLogout = async () => {
    try {
      await signOut(auth)

      navigate("/admin", {
        replace: true,
      })
    } catch (error) {
      console.error(
        "Admin logout failed:",
        error
      )
    }
  }


  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[#dce9e1] bg-[#10251a] text-white">

      {/* Logo */}

      <div className="border-b border-white/10 px-6 py-6">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b8f4d] text-xl shadow-lg shadow-green-950/30">
            🌿
          </div>

          <div>

            <p className="text-lg font-black tracking-tight">
              EcoClean
            </p>

            <p className="text-xs font-medium tracking-[0.2em] text-green-300">
              ADMIN PANEL
            </p>

          </div>

        </div>

      </div>


      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-4 py-5">

        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
          Management
        </p>

        <div className="space-y-1.5">

          {navigation.map(
            ({
              label,
              path,
              icon: Icon,
            }) => (

              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition",

                    isActive
                      ? "bg-[#0b8f4d] text-white shadow-lg shadow-green-950/20"
                      : "text-white/65 hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >

                <Icon size={18} />

                {label}

              </NavLink>

            )
          )}

        </div>

      </nav>


      {/* Logout */}

      <div className="border-t border-white/10 p-4">

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/65 transition hover:bg-red-500/10 hover:text-red-300"
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  )
}


export default AdminSidebar