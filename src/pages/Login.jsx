import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../services/firebase"

function Login() {
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

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      navigate("/dashboard")
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
    <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-[#e1ebe4]">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#176b45] text-2xl">
            🌿
          </div>

          <h1 className="text-2xl font-bold text-[#14231a]">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to your Eco Clean Hub account
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
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#176b45] hover:underline"
          >
            Create account
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-[#176b45]"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Login