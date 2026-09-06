import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import useAdminAuth from "../hooks/useAdminAuth"
import AdminLayout from "../layouts/AdminLayout"

import Dashboard from "../pages/Dashboard"
import Users from "../pages/Users"
import Vendors from "../pages/Vendors"
import Facilities from "../pages/Facilities"


function AdminRoutes() {
  const {
    user,
    isAdmin,
    loading,
  } = useAdminAuth()


  /* =====================================================
     CHECKING AUTH
     ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8f6]">

        <div className="flex flex-col items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b8f4d] text-white shadow-lg">

            <span className="text-2xl">
              🌿
            </span>

          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">

            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#176b45] border-t-transparent" />

            <span>
              Checking admin access...
            </span>

          </div>

        </div>

      </div>
    )
  }


  /* =====================================================
     NOT LOGGED IN
     ===================================================== */

  if (!user) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }


  /* =====================================================
     NOT ADMIN
     ===================================================== */

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }


  /* =====================================================
     ADMIN ROUTES
     ===================================================== */

  return (
    <Routes>

      <Route element={<AdminLayout />}>

        {/* Dashboard */}

        <Route
          path="dashboard"
          element={<Dashboard />}
        />


        {/* Users */}

        <Route
          path="users"
          element={<Users />}
        />


        {/* Vendors */}

        <Route
          path="vendors"
          element={<Vendors />}
        />


        {/* Facilities */}

        <Route
          path="facilities"
          element={<Facilities />}
        />


        {/* Future admin pages will be added here */}


        {/* Unknown admin route */}

        <Route
          path="*"
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

      </Route>

    </Routes>
  )
}


export default AdminRoutes