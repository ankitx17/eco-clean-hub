import Navbar from "../components/home/Navbar"
import Hero from "../components/home/Hero"
import HowItWorks from "../components/home/HowItWorks"
import Features from "../components/home/Features"
import Impact from "../components/home/Impact"
import CTA from "../components/home/CTA"
import Footer from "../components/home/Footer"

function Home() {
  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#14231a]">
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Impact />
        <CTA />
      </main>

      <Footer />
    </div>
  )
}

export default Home