import { Route, Routes } from "react-router-dom"
import PublicLayout from "../components/layout/PublicLayout"
import LandingPage from "../pages/public/LandingPage"
import NotFoundPage from "../pages/public/NotFoundPage"
import LoginPage from "../pages/admin/LoginPage"
import ProtectedRoute from "./ProtectedRoute"
import AdminLayout from "../components/layout/AdminLayout"
import DashboardPage from "../pages/admin/DashboardPage"
import OrdersPage from "../pages/admin/OrdersPage"
import OrderDetailPage from "../pages/admin/OrderDetailPage"
import AttendancePage from "../pages/admin/AttendancePage"
import ReportsPage from "../pages/admin/ReportsPage"
import BulkRegisterPage from "../pages/admin/BulkRegisterPage"
import UserPage from "../pages/admin/UserPage"

const AppRouter = () => {
    return (
        <>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                </Route>

                <Route path="/admin/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<DashboardPage />} />
                        <Route path="/admin/orders" element={<OrdersPage />} />
                        <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
                        <Route path="/admin/import" element={<BulkRegisterPage />} />
                        <Route path="/admin/attendance" element={<AttendancePage />} />
                        <Route path="/admin/reports" element={<ReportsPage />} />
                        <Route path="/admin/users" element={<UserPage />} />
                    </Route>
                </Route>

                {/* pagina 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    )
}

export default AppRouter