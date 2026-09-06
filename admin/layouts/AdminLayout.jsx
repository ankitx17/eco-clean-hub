import {
  Outlet,
} from "react-router-dom"

import AdminSidebar from "../components/AdminSidebar"
import AdminHeader from "../components/AdminHeader"

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#f5f8f6]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 overflow-x-hidden p-5 sm:p-7 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout