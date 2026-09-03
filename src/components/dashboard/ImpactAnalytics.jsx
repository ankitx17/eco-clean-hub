import {
  BarChart3,
  Leaf,
  Recycle,
  TrendingUp,
  TreePine,
} from "lucide-react"

function ImpactAnalytics() {
  const impactStats = [
    {
      title: "Total Waste Diverted",
      value: "24.6",
      unit: "kg",
      change: "+4.2 kg",
      icon: Recycle,
    },
    {
      title: "CO₂ Reduction",
      value: "18.4",
      unit: "kg",
      change: "+3.1 kg",
      icon: Leaf,
    },
    {
      title: "Trees Equivalent",
      value: "2.7",
      unit: "trees",
      change: "+0.4",
      icon: TreePine,
    },
  ]

  return (
    <section className="mb-8">

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-[#176b45]" />

          <h2 className="text-xl font-bold">
            Personal Impact Analytics
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          See how your waste-management actions are making an impact
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        {impactStats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
                  <Icon size={21} />
                </div>

                <div className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-[#176b45]">
                  <TrendingUp size={11} />
                  Growing
                </div>

              </div>

              <p className="mt-5 text-sm text-slate-500">
                {stat.title}
              </p>

              <div className="mt-1 flex items-end gap-2">
                <h3 className="text-3xl font-bold">
                  {stat.value}
                </h3>

                <span className="mb-1 text-xs text-slate-400">
                  {stat.unit}
                </span>
              </div>

              <p className="mt-2 text-xs font-medium text-green-600">
                ↑ {stat.change} this month
              </p>

            </div>
          )
        })}

      </div>

      <div className="mt-4 rounded-2xl border border-[#dfeae3] bg-white p-5 shadow-sm sm:p-6">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="font-bold">
              Monthly Recycling Progress
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Your progress towards this month's environmental goal
            </p>
          </div>

          <span className="text-lg font-bold text-[#176b45]">
            72%
          </span>

        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#edf2ee]">
          <div className="h-full w-[72%] rounded-full bg-[#176b45]" />
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-400">
          <span>0 kg</span>
          <span>Goal: 34 kg</span>
        </div>

      </div>

    </section>
  )
}

export default ImpactAnalytics