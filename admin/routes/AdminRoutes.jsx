import { Navigate, Route, Routes } from "react-router-dom"

import useAdminAuth from "../hooks/useAdminAuth"
import AdminLayout from "../layouts/AdminLayout"
import Dashboard from "../pages/Dashboard"
import Users from "../pages/Users"

function AdminRoutes() {
  const {
    user,
    isAdmin,
    loading,
  } = useAdminAuth()

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

  if (!user) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route
          path="dashboard"
          element={<Dashboard />}
        />

<Route
  path="users"
  element={<Users />}
/>

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