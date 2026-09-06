import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Leaf,
} from "lucide-react"

import { useState } from "react"
import {
  getIdTokenResult,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { useNavigate } from "react-router-dom"

import { auth } from "../../src/services/firebase"

function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")

    if (!email.trim() || !password) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        )

      const tokenResult = await getIdTokenResult(
        userCredential.user,
        true
      )

      const role = tokenResult?.claims?.role

      if (role !== "admin") {
        await auth.signOut()

        setError(
          "This account does not have administrator access."
        )

        return
      }

      navigate("/admin/dashboard", {
        replace: true,
      })
    } catch (loginError) {
      console.error(
        "Admin login error:",
        loginError
      )

      if (
        loginError?.code ===
        "auth/invalid-credential"
      ) {
        setError(
          "Invalid email or password."
        )
      } else if (
        loginError?.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Too many login attempts. Please try again later."
        )
      } else {
        setError(
          loginError?.message ||
            "Unable to sign in. Please try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f8f6] px-4 py-8 sm:px-6">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#176b45] text-white shadow-lg shadow-green-900/10">
              <Leaf size={30} strokeWidth={2.2} />
            </div>
          </div>

          {/* Login Card */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">

            {/* Heading */}
            <div className="text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#176b45]">
                <ShieldCheck size={14} />
                Secure Administration
              </div>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#14231a]">
                Admin Login
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in with an authorized administrator
                account.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Admin Email
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        width="20"
                        height="16"
                        x="2"
                        y="4"
                        rx="2"
                      />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>

                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="admin@example.com"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pl-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#176b45] focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="admin-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#176b45] focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b8f4d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-800/15 transition hover:-translate-y-0.5 hover:bg-[#087b42] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to Admin
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Back */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm font-semibold text-slate-500 transition hover:text-[#176b45]"
              >
                ← Back to Eco Clean Hub
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <ShieldCheck size={14} />
            <span>
              Authorized administrators only.
              Unauthorized access is restricted.
            </span>
          </div>

        </div>
      </div>
    </main>
  )
}

export default AdminLogin