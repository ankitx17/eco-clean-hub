import {
  Leaf,
  Recycle,
  Users,
  MapPinned,
  ShieldCheck,
} from "lucide-react"

const stats = [
  {
    icon: Recycle,
    value: "24K+",
    label: "Waste Actions",
  },
  {
    icon: ShieldCheck,
    value: "18K+",
    label: "Verified Disposals",
  },
  {
    icon: Users,
    value: "5K+",
    label: "Active Citizens",
  },
  {
    icon: MapPinned,
    value: "120+",
    label: "MRF Locations",
  },
]

function Impact() {
  return (
    <section id="impact" className="px-5 py-24">
      <div className="mx-auto max-w-7xl">

        {/* Main Impact Container */}
        <div className="rounded-[2rem] bg-gradient-to-br from-green-50 to-emerald-100/60 p-8 sm:p-12">

          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">

            {/* Left Content */}
            <div>

              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b8f4d] text-white shadow-lg shadow-green-700/20">
                <Leaf size={27} />
              </div>

              {/* Heading */}
              <h2 className="mt-7 text-4xl font-black tracking-tight text-[#102119] sm:text-5xl">
                Small actions.
                <br />

                <span className="text-[#0b8f4d]">
                  Measurable impact.
                </span>
              </h2>

              {/* Description */}
              <p className="mt-5 max-w-md leading-7 text-slate-600">
                Every verified action contributes to cleaner communities,
                better waste segregation and smarter resource planning.
              </p>

              {/* Small Impact Line */}
              <div className="mt-8 flex items-center gap-3">

                <div className="flex -space-x-2">
                  <div className="h-9 w-9 rounded-full border-2 border-white bg-green-200" />
                  <div className="h-9 w-9 rounded-full border-2 border-white bg-emerald-300" />
                  <div className="h-9 w-9 rounded-full border-2 border-white bg-lime-300" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0b8f4d] text-xs font-bold text-white">
                    +
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#102119]">
                    Community powered
                  </p>

                  <p className="text-xs text-slate-500">
                    Every action makes a difference
                  </p>
                </div>

              </div>
            </div>

            {/* Right Statistics */}
            <div className="grid gap-4 sm:grid-cols-2">

              {stats.map((stat) => {
                const Icon = stat.icon

                return (
                  <div
                    key={stat.label}
                    className="group rounded-3xl border border-white bg-white/80 p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/5"
                  >

                    {/* Top Row */}
                    <div className="flex items-center justify-between">

                      {/* Icon */}
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#0b8f4d] transition duration-300 group-hover:bg-[#0b8f4d] group-hover:text-white">
                        <Icon size={20} />
                      </div>

                      {/* Label */}
                      <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
                        Impact
                      </span>

                    </div>

                    {/* Number */}
                    <div className="mt-7 text-3xl font-black tracking-tight text-[#102119]">
                      {stat.value}
                    </div>

                    {/* Description */}
                    <div className="mt-1 text-sm text-slate-500">
                      {stat.label}
                    </div>

                  </div>
                )
              })}

            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default Impact