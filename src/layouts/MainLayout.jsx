import { NavLink, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  ScanLine,
  MapPin,
  ShieldCheck,
  Gift,
  Trophy,
  Activity,
  UserRound,
  Leaf,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Scan Waste",
    path: "/scanner",
    icon: ScanLine,
  },
  {
    name: "Find MRF",
    path: "/mrf",
    icon: MapPin,
  },
  {
    name: "Verification",
    path: "/verification",
    icon: ShieldCheck,
  },
  {
    name: "Rewards",
    path: "/rewards",
    icon: Gift,
  },
  {
    name: "Leaderboard",
    path: "/leaderboard",
    icon: Trophy,
  },
  {
    name: "Activity",
    path: "/activity",
    icon: Activity,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: UserRound,
  },
]

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#14231a]">

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-[#dce9df] bg-white lg:flex lg:flex-col">

        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-[#e7efe9] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#176b45] text-white">
            <Leaf size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Eco Clean Hub
            </h1>
            <p className="text-xs text-gray-500">
              Smart Waste Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#e7f5ec] text-[#176b45]"
                      : "text-gray-600 hover:bg-[#f3f7f4] hover:text-[#176b45]"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#e7efe9] p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600">
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#dce9df] bg-white/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#176b45] text-white">
            <Leaf size={19} />
          </div>

          <span className="font-bold">
            Eco Clean Hub
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-[#dce9df] bg-white p-4 shadow-lg lg:hidden">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-[#e7f5ec] text-[#176b45]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon size={19} />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout