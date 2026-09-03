
import {
  Leaf,
  WalletCards,
} from "lucide-react"

import { Link } from "react-router-dom"

function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e3ece6] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

        <Link to="/" className="flex items-center gap-3">
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

        <div className="flex items-center gap-4">

          <Link
            to="/rewards"
            className="hidden items-center gap-2 rounded-xl border border-[#dce9e1] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-green-50 sm:flex"
          >
            <WalletCards size={17} className="text-[#176b45]" />
            Rewards
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dcefe4] text-sm font-bold text-[#176b45]">
            AK
          </div>

        </div>
      </div>
    </header>
  )
}

export default DashboardHeader