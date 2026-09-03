import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"

const Home = lazy(() => import("../pages/Home"))
const Login = lazy(() => import("../pages/Login"))
const Register = lazy(() => import("../pages/Register"))
const Dashboard = lazy(() => import("../pages/Dashboard"))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6faf7]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#176b45] text-white">
          <span className="text-xl">🌿</span>
        </div>

        <p className="text-sm font-medium text-slate-500">
          Loading Eco Clean Hub...
        </p>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes