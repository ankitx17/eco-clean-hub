import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"

import ProtectedRoute from "../components/common/ProtectedRoute"

// =====================================================
// ADMIN APP
// Lazy-loaded so admin code is NOT included in initial bundle
// =====================================================

const AdminApp = lazy(
  () => import("../../admin/AdminApp")
)

// =====================================================
// PUBLIC / CITIZEN PAGES
// =====================================================

const Home = lazy(() => import("../pages/Home"))
const Login = lazy(() => import("../pages/Login"))
const Register = lazy(() => import("../pages/Register"))

const VendorRegistration = lazy(
  () => import("../pages/VendorRegistration")
)

const Dashboard = lazy(
  () => import("../pages/Dashboard")
)

/* NEW: ECO VIDEO HUB */
const EcoVideoHub = lazy(
  () => import("../pages/EcoVideoHub")
)

const RedeemRewards = lazy(
  () => import("../pages/RedeemRewards")
)

const MissionSelection = lazy(
  () => import("../pages/MissionSelection")
)

const SelectTerrain = lazy(
  () => import("../pages/SelectTerrain")
)

const SubmitCleanup = lazy(
  () => import("../pages/SubmitCleanup")
)

const Scanner = lazy(
  () => import("../pages/Scanner")
)

const MRF = lazy(
  () => import("../pages/MRF")
)

const MRFRoute = lazy(
  () => import("../pages/MRFRoute")
)

const Verification = lazy(
  () => import("../pages/Verification")
)

const Rewards = lazy(
  () => import("../pages/Rewards")
)

const Leaderboard = lazy(
  () => import("../pages/Leaderboard")
)

const Activity = lazy(
  () => import("../pages/Activity")
)

const Profile = lazy(
  () => import("../pages/Profile")
)

const Donation = lazy(
  () => import("../pages/Donation")
)

const FundingRequest = lazy(
  () => import("../pages/FundingRequest")
)

// NEW: Certificate
const Certificate = lazy(
  () => import("../pages/Certificate")
)

// Existing admin funding requests page
const AdminFundingRequests = lazy(
  () => import("../pages/AdminFundingRequests")
)

const NotFound = lazy(
  () => import("../pages/NotFound")
)

// =====================================================
// ROUTE LOADER
// =====================================================

function RouteLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#176b45] border-t-transparent" />
    </div>
  )
}

// =====================================================
// APP ROUTES
// =====================================================

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>

        {/* =====================================================
            ADMIN APP
            Lazy-loaded for better initial bundle performance.
            ===================================================== */}

        <Route
          path="/admin/*"
          element={<AdminApp />}
        />

        {/* =====================================================
            PUBLIC ROUTES
            ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Vendor Registration */}
        <Route
          path="/vendor-register"
          element={<VendorRegistration />}
        />

        {/* =====================================================
            PUBLIC MRF ROUTES
            ===================================================== */}

        <Route
          path="/mrf"
          element={<MRF />}
        />

        <Route
          path="/mrf/route/:mrfId"
          element={<MRFRoute />}
        />

        {/* =====================================================
            CITIZEN PROTECTED ROUTES
            ===================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* NEW: ECO VIDEO HUB */}
          <Route
            path="/eco-video-hub"
            element={<EcoVideoHub />}
          />

          <Route
            path="/redeem"
            element={<RedeemRewards />}
          />

          <Route
            path="/missions"
            element={<MissionSelection />}
          />

          <Route
            path="/missions/terrain"
            element={<SelectTerrain />}
          />

          <Route
            path="/cleanup"
            element={<SubmitCleanup />}
          />

          <Route
            path="/scanner"
            element={<Scanner />}
          />

          <Route
            path="/verification"
            element={<Verification />}
          />

          <Route
            path="/rewards"
            element={<Rewards />}
          />

          <Route
            path="/leaderboard"
            element={<Leaderboard />}
          />

          {/* NEW: Certificate */}
          <Route
            path="/certificate"
            element={<Certificate />}
          />

          <Route
            path="/activity"
            element={<Activity />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/donation"
            element={<Donation />}
          />

          <Route
            path="/funding-request"
            element={<FundingRequest />}
          />

        </Route>

        {/* =====================================================
            OLD ADMIN FUNDING REQUESTS
            ===================================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]} />
          }
        >
          <Route
            path="/admin/funding-requests"
            element={<AdminFundingRequests />}
          />
        </Route>

        {/* =====================================================
            NOT FOUND
            ===================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </Suspense>
  )
}

export default AppRoutes