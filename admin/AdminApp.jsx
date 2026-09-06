import { Route, Routes } from "react-router-dom"

import AdminLogin from "./pages/AdminLogin"
import AdminRoutes from "./routes/AdminRoutes"

function AdminApp() {
  return (
    <Routes>
      <Route
        index
        element={<AdminLogin />}
      />

      <Route
        path="*"
        element={<AdminRoutes />}
      />
    </Routes>
  )
}

export default AdminApp