import { ArrowRight, Leaf } from "lucide-react"

function CTA() {
  return (
    <section className="px-5 pb-24">

      <div className="mx-auto max-w-7xl">

        <div className="relative overflow-hidden rounded-[2rem] bg-[#0b8f4d] px-7 py-16 text-center text-white sm:px-12">

          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-green-950/20 blur-2xl" />

          <div className="relative">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Leaf size={27} />
            </div>

            <h2 className="mx-auto mt-7 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Ready to make your next waste action count?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-green-50/80">
              Start with one scan. Build better habits. Create measurable
              impact.
            </p>

            <button className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 font-bold text-[#0b8f4d] shadow-xl transition hover:-translate-y-1">
              Start Your Journey
              <ArrowRight size={18} />
            </button>

          </div>
        </div>

      </div>
    </section>
  )
}

export default CTA