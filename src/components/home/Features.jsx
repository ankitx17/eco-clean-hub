import {
  BrainCircuit,
  Map,
  ShieldCheck,
  WifiOff,
  Trophy,
  BarChart3,
} from "lucide-react"

const features = [
  {
    icon: BrainCircuit,
    title: "On-Device AI",
    description:
      "Waste classification happens directly on your device for fast and privacy-conscious identification.",
  },
  {
    icon: ShieldCheck,
    title: "Proof-of-Disposal",
    description:
      "GPS and before-after image validation create a verifiable disposal trail.",
  },
  {
    icon: Map,
    title: "Smart MRF Network",
    description:
      "Discover authorized Material Recovery Facilities and find the best disposal route.",
  },
  {
    icon: WifiOff,
    title: "Offline First",
    description:
      "Core functionality is designed to continue working even with limited connectivity.",
  },
  {
    icon: Trophy,
    title: "Eco-Credits",
    description:
      "Turn verified environmental actions into points, badges, streaks and rankings.",
  },
  {
    icon: BarChart3,
    title: "Impact Analytics",
    description:
      "Understand your contribution while helping communities identify waste-management hotspots.",
  },
]

function Features() {
  return (
    <section id="features" className="bg-[#10251a] px-5 py-24 text-white">

      <div className="mx-auto max-w-7xl">

        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-300">
            One platform
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Everything you need to
            <span className="text-green-300"> dispose better.</span>
          </h2>

          <p className="mt-5 leading-7 text-green-50/60">
            A connected ecosystem for citizens, students, MRF centers
            and municipal teams.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.09]"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-300/10 text-green-300">
                  <Icon size={23} />
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-green-50/60">
                  {feature.description}
                </p>

              </div>
            )
          })}

        </div>

      </div>
    </section>
  )
}

export default Features