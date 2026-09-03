import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { auth } from "../services/firebase"

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()

    setError("")

    // Basic validation
    if (!name.trim()) {
      setError("Please enter your full name.")
      return
    }

    if (!email.trim()) {
      setError("Please enter your email.")
      return
    }

    if (!password) {
      setError("Please enter a password.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    try {
      setLoading(true)

      // Create Firebase account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      )

      // Save user's name in Firebase Authentication profile
      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      })

      // Registration successful
      navigate("/dashboard")
    } catch (error) {
      console.error("Firebase Registration Error:", error)

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.")
          break

        case "auth/invalid-email":
          setError("Please enter a valid email address.")
          break

        case "auth/weak-password":
          setError("Password is too weak. Use at least 6 characters.")
          break

        case "auth/operation-not-allowed":
          setError(
            "Email/Password authentication is not enabled in Firebase."
          )
          break

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          )
          break

        case "auth/invalid-api-key":
          setError(
            "Firebase configuration is incorrect. Please check firebase.js."
          )
          break

        default:
          setError(
            `${error.code || "Error"}: ${
              error.message || "Unable to create account."
            }`
          )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-[#e1ebe4] bg-white p-8 shadow-xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#176b45] text-2xl">
            🌿
          </div>

          <h1 className="text-2xl font-bold text-[#14231a]">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join Eco Clean Hub and make a difference
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/20 disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/20 disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#176b45] focus:ring-2 focus:ring-[#176b45]/20 disabled:bg-gray-100"
            />

            <p className="mt-2 text-xs text-gray-400">
              Password must contain at least 6 characters.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#176b45] py-3 font-semibold text-white transition hover:bg-[#125a39] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#176b45] hover:underline"
          >
            Login
          </Link>
        </p>

        {/* Home Link */}
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

export default Register