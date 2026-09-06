import {
  Leaf,
  Code2,
  Share2,
  BriefcaseBusiness,
  ArrowUpRight,
} from "lucide-react"
import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Main Footer */}
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b8f4d] text-white shadow-lg shadow-green-700/20">
                <Leaf size={20} />
              </div>

              <div className="text-lg font-bold tracking-tight">
                Eco<span className="text-[#0b8f4d]">Clean</span> Hub
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              A smart waste management platform connecting AI,
              verified disposal and citizen participation.
            </p>

            {/* Social / Project Links */}
            <div className="mt-5 flex gap-2">
              <button
                aria-label="Project Code"
                className="rounded-xl bg-slate-50 p-2.5 text-slate-500 transition hover:bg-green-50 hover:text-green-700"
              >
                <Code2 size={17} />
              </button>

              <button
                aria-label="Social Media"
                className="rounded-xl bg-slate-50 p-2.5 text-slate-500 transition hover:bg-green-50 hover:text-green-700"
              >
                <Share2 size={17} />
              </button>

              <button
                aria-label="Team"
                className="rounded-xl bg-slate-50 p-2.5 text-slate-500 transition hover:bg-green-50 hover:text-green-700"
              >
                <BriefcaseBusiness size={17} />
              </button>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-bold text-[#102119]">
              Platform
            </h3>

            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <a
                href="#features"
                className="flex items-center gap-1 transition hover:text-green-600"
              >
                AI Scanner
                <ArrowUpRight size={13} />
              </a>

              <a
                href="#features"
                className="flex items-center gap-1 transition hover:text-green-600"
              >
                MRF Network
                <ArrowUpRight size={13} />
              </a>

              <a
                href="#features"
                className="flex items-center gap-1 transition hover:text-green-600"
              >
                Eco-Credits
                <ArrowUpRight size={13} />
              </a>

              <a
                href="#features"
                className="flex items-center gap-1 transition hover:text-green-600"
              >
                Leaderboard
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-bold text-[#102119]">
              Solutions
            </h3>

            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <a
                href="#"
                className="block transition hover:text-green-600"
              >
                Citizens
              </a>

              <a
                href="#"
                className="block transition hover:text-green-600"
              >
                NSS / NCC
              </a>

              <a
                href="#"
                className="block transition hover:text-green-600"
              >
                Municipalities
              </a>

              <a
                href="#"
                className="block transition hover:text-green-600"
              >
                MRF Centers
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-[#102119]">
              Eco Clean Hub
            </h3>

            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <a
                href="#"
                className="block transition hover:text-green-600"
              >
                About Us
              </a>

              <a
                href="#how-it-works"
                className="block transition hover:text-green-600"
              >
                How It Works
              </a>

              <a
                href="#"
                className="block transition hover:text-green-600"
              >
                Privacy
              </a>

              <a
                href="#"
                className="block transition hover:text-green-600"
              >
                Contact
              </a>

              {/* Admin Login */}
              <Link
                to="/admin"
                className="group mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-700/20 transition hover:-translate-y-0.5 hover:bg-[#087b42] hover:shadow-xl"
              >
                Admin
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>
            © 2026 Eco Clean Hub. Built for a cleaner tomorrow.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer