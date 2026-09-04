import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { X } from "lucide-react"
import { auth } from "../../services/firebase"

function LoginModal({ onClose }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    try {
      setLoading(true)

      await signInWithEmailAndPassword(auth, email, password)

      onClose()
      navigate("/scanner")
    } catch (error) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Incorrect email or password.")
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else {
        setError("Unable to login. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-[#e1ebe4] bg-white p-8 shadow-2xl">

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#176b45] text-2xl">
            🌿
          </div>

          <h2 className="text-2xl font-bold text-[#14231a]">
            Login to Scan Waste
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Login to continue with AI waste scanning
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/20"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#176b45] py-3 font-semibold text-white transition hover:bg-[#125a39] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login & Scan"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            onClick={onClose}
            className="font-semibold text-[#176b45] hover:underline"
          >
            Create account
          </Link>
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 block w-full text-center text-sm text-gray-500 hover:text-[#176b45]"
        >
          Continue browsing
        </button>
      </div>
    </div>
  )
}

export default LoginModal
