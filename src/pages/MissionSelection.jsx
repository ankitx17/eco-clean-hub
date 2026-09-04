import { ArrowRight, Leaf, Users, TreePine } from "lucide-react"
import { useNavigate } from "react-router-dom"

function MissionSelection() {
  const navigate = useNavigate()

  const missions = [
    {
      title: "Solo Event",
      description: "Complete an activity on your own",
      icon: Leaf,
      mode: "SOLO",
      action: "Make a Difference",
    },
    {
      title: "Group Event",
      description: "Join others for a bigger impact",
      icon: Users,
      mode: "GROUP",
      action: "Together We Can",
    },
    {
      title: "Plantation",
      description: "Plant trees and help grow a greener future",
      icon: TreePine,
      mode: "PLANTATION",
      action: "Grow a Better Tomorrow",
    },
  ]

  const handleMissionClick = (mode) => {
    navigate("/missions/terrain", {
      state: {
        mode: mode,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#14231a]">

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-10 text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#dcf8e7] px-5 py-2 text-sm font-semibold text-[#176b45]">
            <Leaf size={16} />
            CLEAN TODAY • GREENER TOMORROW
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Choose Your{" "}
            <span className="text-[#176b45]">
              Mission
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500 sm:text-lg">
            Select how you want to make an impact
          </p>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-[#9ed4b2]" />
            <Leaf size={20} className="text-[#176b45]" />
            <div className="h-px w-20 bg-[#9ed4b2]" />
          </div>

        </div>

        {/* MISSION CARDS */}
        <div className="grid gap-6 md:grid-cols-3">

          {missions.map((mission) => {
            const Icon = mission.icon

            return (
              <button
                key={mission.title}
                type="button"
                onClick={() => handleMissionClick(mission.mode)}
                className="group relative overflow-hidden rounded-3xl border border-[#4caf72] bg-gradient-to-br from-[#219653] to-[#11663e] p-7 text-left text-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >

                {/* DECORATIVE BACKGROUND */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />

                <div className="pointer-events-none absolute -bottom-10 -right-5 opacity-10">
                  <Icon size={150} />
                </div>

                {/* ICON */}
                <div className="relative mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#176b45] shadow-sm transition duration-300 group-hover:scale-105">
                  <Icon size={32} strokeWidth={2} />
                </div>

                {/* CONTENT */}
                <div className="relative">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight">
                        {mission.title}
                      </h2>

                      <p className="mt-3 max-w-[280px] text-sm leading-6 text-green-50">
                        {mission.description}
                      </p>
                    </div>

                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 transition duration-300 group-hover:bg-white group-hover:text-[#176b45]">
                      <ArrowRight
                        size={21}
                        className="transition duration-300 group-hover:translate-x-1"
                      />
                    </div>

                  </div>

                  {/* ACTION */}
                  <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#176b45] shadow-sm transition duration-300 group-hover:px-6">
                    {mission.action}
                    <ArrowRight size={16} />
                  </div>

                </div>

              </button>
            )
          })}

        </div>

        {/* BOTTOM INFO */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#cfe9d9] bg-[#eaf8ef] p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d2f1dc] text-[#176b45]">
              <Leaf size={24} />
            </div>

            <div>
              <h3 className="font-bold text-[#176b45]">
                Every action counts!
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Choose a mission and be part of a cleaner,
                healthier, and greener tomorrow.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  )
}

export default MissionSelection