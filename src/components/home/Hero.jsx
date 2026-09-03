import {
  ArrowRight,
  Camera,
  CheckCircle2,
  MapPin,
  Sparkles,
  Recycle,
  ShieldCheck,
} from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden px-5 pb-20 pt-36 md:pb-28 md:pt-44"
    >

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-green-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-20 h-[500px] w-[500px] rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-[#0b8f4d] shadow-sm">
            <Sparkles size={15} />
            Smart waste management, reimagined
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[1.03] tracking-[-0.04em] text-[#102119] sm:text-6xl lg:text-7xl">

            Turn waste into

            <span className="relative ml-3 inline-block text-[#0b8f4d]">
              impact.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Identify waste with AI, find the right disposal center,
            verify your action and earn Eco-Credits — all from your
            smartphone.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">

            <Link
              to="/scanner"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-[#0b8f4d] px-6 py-4 font-semibold text-white shadow-xl shadow-green-800/20 transition hover:-translate-y-1 hover:bg-[#087b42]"
            >
              <Camera size={19} />
              Scan Waste
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </Link>

            <button className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-700 shadow-sm transition hover:border-green-200 hover:bg-green-50">
              Explore Platform
            </button>

          </div>

          {/* Trust points */}
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">

            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-[#0b8f4d]" />
              AI-powered
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-[#0b8f4d]" />
              Verified disposal
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-[#0b8f4d]" />
              GPS enabled
            </div>

          </div>
        </motion.div>

        {/* RIGHT — Scanner Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-[500px]"
        >

          {/* Main card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-[#10251a] p-4 shadow-2xl shadow-green-950/20">

            {/* Fake camera */}
            <div className="relative h-[430px] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#315e46] via-[#1c3d2b] to-[#091a10]">

              {/* Camera grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Center scanner */}
              <div className="absolute inset-0 flex items-center justify-center">

                <div className="relative h-56 w-56">

                  {/* Corner brackets */}
                  <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-green-300" />
                  <div className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-green-300" />
                  <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-green-300" />
                  <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-green-300" />

                  {/* Recycle icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Recycle
                      size={82}
                      strokeWidth={1.3}
                      className="text-green-200"
                    />
                  </div>

                  {/* Scan line */}
                  <motion.div
                    animate={{ y: [0, 208, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute left-2 right-2 top-5 h-[2px] bg-green-300 shadow-[0_0_18px_rgba(134,239,172,1)]"
                  />

                </div>
              </div>

              {/* Camera label */}
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-medium text-white backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                AI SCANNER
              </div>

              {/* Bottom result */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">

                <div className="flex items-center justify-between">

                  <div>
                    <div className="text-xs text-green-200">
                      AI DETECTED
                    </div>

                    <div className="mt-1 text-xl font-bold text-white">
                      Dry Waste
                    </div>
                  </div>

                  <div className="rounded-xl bg-green-400/15 px-3 py-2 text-right">
                    <div className="text-[10px] text-green-200">
                      CONFIDENCE
                    </div>
                    <div className="font-bold text-green-300">
                      96.4%
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-5 top-28 rounded-2xl border border-white bg-white p-4 shadow-xl sm:-right-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <MapPin size={19} className="text-[#0b8f4d]" />
                </div>

                <div>
                  <div className="text-xs text-slate-500">
                    Nearest MRF
                  </div>
                  <div className="font-bold text-slate-800">
                    1.8 km away
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating credit */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-5 -left-5 rounded-2xl border border-white bg-white p-4 shadow-xl sm:-left-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lg">
                  🌱
                </div>

                <div>
                  <div className="text-xs text-slate-500">
                    Eco-Credits
                  </div>
                  <div className="font-bold text-[#0b8f4d]">
                    +50 earned
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}

export default Hero