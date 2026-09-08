import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const ProtectedRoute = () => {
    const { session, loading } = useAuth()

    if (loading) return <div>Cargando...</div>
    if (!session) return <Navigate to='/admin/login' replace />
    return <Outlet />
}

export default ProtectedRoute