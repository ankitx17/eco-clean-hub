import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Construction,
  TreePine,
  Waves,
  Building,
  Shovel,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

function SelectTerrain() {
  const navigate = useNavigate()
  const location = useLocation()

  const mode = location.state?.mode || "SOLO"

  const terrains = [
    {
      name: "Campus / School",
      description: "Clean your campus or school",
      icon: Building2,
      value: "Campus / School",
    },
    {
      name: "Roadside / Street",
      description: "Clean streets and roadside areas",
      icon: Construction,
      value: "Roadside / Street",
    },
    {
      name: "Public Park",
      description: "Keep parks clean and green",
      icon: TreePine,
      value: "Public Park",
    },
    {
      name: "River / Beach",
      description: "Help clean natural water areas",
      icon: Waves,
      value: "River / Beach",
    },
    {
      name: "Urban Area",
      description: "Make your city cleaner",
      icon: Building,
      value: "Urban Area",
    },
    {
      name: "Other",
      description: "Choose another cleanup location",
      icon: Shovel,
      value: "Other",
    },
  ]

  const handleTerrainClick = (terrain) => {
    navigate("/cleanup", {
      state: {
        mode,
        terrain: terrain.value,
      },
    })
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f6faf7] text-[#14231a]">

      {/* HEADER */}
      <header className="border-b border-[#dfeae3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-2.5 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#176b45] transition hover:bg-[#edf8f1]"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="ml-3">
            <h2 className="text-sm font-bold text-[#14231a] sm:text-base">
              Start a Mission
            </h2>

            <p className="text-[11px] text-slate-500 sm:text-xs">
              Choose where you want to make an impact
            </p>
          </div>

        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">

        {/* TITLE */}
        <div className="mb-5 text-center">

          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf8f1] text-[#176b45]">
            <TreePine size={21} />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Select Your{" "}
            <span className="text-[#176b45]">Terrain</span>
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Choose where you want to complete your mission
          </p>

          <div className="mt-2 inline-flex items-center rounded-full bg-[#dcf8e7] px-4 py-1 text-[11px] font-bold text-[#176b45]">
            {mode} EVENT
          </div>

        </div>

        {/* TERRAIN CARDS */}
        <div className="grid grid-cols-3 gap-3">

          {terrains.map((terrain) => {
            const Icon = terrain.icon

            return (
              <button
                key={terrain.value}
                type="button"
                onClick={() => handleTerrainClick(terrain)}
                className="group relative h-[145px] overflow-hidden rounded-2xl border border-[#4caf72] bg-gradient-to-br from-[#219653] to-[#11663e] p-4 text-left text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* DECORATIVE CIRCLE */}
                <div className="pointer-events-none absolute -right-7 -top-7 h-20 w-20 rounded-full bg-white/10" />

                {/* TOP */}
                <div className="relative flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#176b45] shadow-sm transition group-hover:scale-105">
                    <Icon size={21} />
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition group-hover:bg-white group-hover:text-[#176b45]">
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>

                </div>

                {/* CONTENT */}
                <div className="relative mt-3">

                  <h2 className="text-base font-extrabold sm:text-lg">
                    {terrain.name}
                  </h2>

                  <p className="mt-0.5 text-[11px] leading-4 text-green-50 sm:text-xs">
                    {terrain.description}
                  </p>

                </div>

                {/* ACTION */}
                <div className="absolute bottom-3 left-4 text-[11px] font-bold text-white/90">
                  Choose this location →
                </div>

              </button>
            )
          })}

        </div>

      </main>
    </div>
  )
}

export default SelectTerrain