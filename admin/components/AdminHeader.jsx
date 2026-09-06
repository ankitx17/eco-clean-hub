import {
  Bell,
  ShieldCheck,
} from "lucide-react"

import useAdminAuth from "../hooks/useAdminAuth"

function AdminHeader() {
  const { user } =
    useAdminAuth()

  return (
    <header className="flex min-h-[76px] items-center justify-between border-b border-[#dce9e1] bg-white px-5 sm:px-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Eco Clean Hub
        </p>

        <p className="mt-1 text-sm font-bold text-slate-700">
          Administration
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-green-50 hover:text-[#176b45]"
          aria-label="Notifications"
        >
          <Bell size={18} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#0b8f4d]" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4ec] text-[#176b45]">
            <ShieldCheck size={19} />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-700">
              Administrator
            </p>

            <p className="max-w-[220px] truncate text-xs text-slate-400">
              {user?.email ||
                "Admin account"}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader