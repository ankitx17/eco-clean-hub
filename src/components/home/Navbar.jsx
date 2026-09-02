import { Leaf, Menu, X, ArrowRight } from "lucide-react"
import { useState } from "react"

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="mx-auto max-w-7xl rounded-2xl border border-white/70 bg-white/80 px-5 py-3 shadow-lg shadow-green-950/5 backdrop-blur-xl">

        <div className="flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b8f4d] text-white shadow-lg shadow-green-700/20">
              <Leaf size={21} strokeWidth={2.5} />
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                Eco<span className="text-[#0b8f4d]">Clean</span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Hub
              </div>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#home" className="text-sm font-medium text-slate-700 transition hover:text-[#0b8f4d]">
              Home
            </a>

            <a href="#how-it-works" className="text-sm font-medium text-slate-700 transition hover:text-[#0b8f4d]">
              How It Works
            </a>

            <a href="#features" className="text-sm font-medium text-slate-700 transition hover:text-[#0b8f4d]">
              Features
            </a>

            <a href="#impact" className="text-sm font-medium text-slate-700 transition hover:text-[#0b8f4d]">
              Impact
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <button className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-green-50">
              Login
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-700/20 transition hover:-translate-y-0.5 hover:bg-[#087b42]">
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl p-2 text-slate-700 md:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mt-4 border-t border-slate-100 pt-4 md:hidden">
            <div className="flex flex-col gap-2">

              <a href="#home" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-green-50">
                Home
              </a>

              <a href="#how-it-works" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-green-50">
                How It Works
              </a>

              <a href="#features" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-green-50">
                Features
              </a>

              <a href="#impact" className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-green-50">
                Impact
              </a>

              <button className="mt-2 rounded-xl bg-[#0b8f4d] px-4 py-3 text-sm font-semibold text-white">
                Get Started
              </button>

            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar