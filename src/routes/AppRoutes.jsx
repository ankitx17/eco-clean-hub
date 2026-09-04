import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "../components/common/ProtectedRoute"

const Home = lazy(() => import("../pages/Home"))
const Login = lazy(() => import("../pages/Login"))
const Register = lazy(() => import("../pages/Register"))
const Dashboard = lazy(() => import("../pages/Dashboard"))
const Scanner = lazy(() => import("../pages/Scanner"))
const MRF = lazy(() => import("../pages/MRF"))
const Verification = lazy(() => import("../pages/Verification"))
const Rewards = lazy(() => import("../pages/Rewards"))
const Leaderboard = lazy(() => import("../pages/Leaderboard"))
const Activity = lazy(() => import("../pages/Activity"))
const Profile = lazy(() => import("../pages/Profile"))
const NotFound = lazy(() => import("../pages/NotFound"))

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

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["citizen"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/mrf" element={<MRF />} />
          <Route
            path="/verification"
            element={<Verification />}
          />
          <Route path="/rewards" element={<Rewards />} />
          <Route
            path="/leaderboard"
            element={<Leaderboard />}
          />
          <Route path="/activity" element={<Activity />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  )
}

export default AppRoutes