import {
  Camera,
  BrainCircuit,
  MapPinned,
  ShieldCheck,
  Trophy,
} from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Scan",
    description: "Point your camera at waste and let AI identify it instantly.",
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "Classify",
    description: "Get clear Wet, Dry or E-waste segregation guidance.",
  },
  {
    number: "03",
    icon: MapPinned,
    title: "Navigate",
    description: "Find the nearest authorized MRF center using your location.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Verify",
    description: "Prove responsible disposal through GPS and image validation.",
  },
  {
    number: "05",
    icon: Trophy,
    title: "Reward",
    description: "Earn Eco-Credits for every successfully verified action.",
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-24">

      <div className="mx-auto max-w-7xl">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0b8f4d]">
            Simple by design
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight text-[#102119] sm:text-5xl">
            From waste to impact
            <span className="text-[#0b8f4d]"> in five steps.</span>
          </h2>

          <p className="mt-5 text-slate-600">
            Eco Clean Hub makes responsible disposal simple,
            verifiable and rewarding.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-5">

          {steps.map((step) => {
            const Icon = step.icon

            return (
              <div
                key={step.number}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-2 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5"
              >

                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[#0b8f4d] transition group-hover:bg-[#0b8f4d] group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <span className="text-sm font-bold text-slate-300">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>

              </div>
            )
          })}

        </div>

      </div>
    </section>
  )
}

export default HowItWorks