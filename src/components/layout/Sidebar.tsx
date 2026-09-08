import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaChartPie, FaListUl, FaQrcode, FaChevronRight, FaTimes, FaChartBar, FaUsers } from 'react-icons/fa'
import { supabase } from '../../lib/supabaseClient'
import { useEffect, useState } from 'react'

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [userRole, setUserRole] = useState<string | null>(null)

    useEffect(() => {
        const fetchRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data, error } = await supabase
                    .from('admin_users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                
                if (error) {
                    console.error("Error fetching user role:", error)
                } else if (data) {
                    setUserRole(data.role)
                }
            }
        }
        fetchRole()
    }, [])

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <FaChartPie className="text-xl" /> },
        { name: 'Registros', path: '/admin/orders', icon: <FaListUl className="text-xl" /> },
        { name: 'Registro Masivo', path: '/admin/import', icon: <FaListUl className="text-xl" /> },
        { name: 'Escáner QR', path: '/admin/attendance', icon: <FaQrcode className="text-xl" /> },
        { name: 'Reportes', path: '/admin/reports', icon: <FaChartBar className="text-xl" /> },
    ]

    if (userRole === 'admin') {
        navItems.push({ name: 'Usuarios', path: '/admin/users', icon: <FaUsers className="text-xl" /> })
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/admin/login')
    }

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-8 shadow-xs transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="mb-10 flex items-center justify-between px-4">
                <h1 className="bg-linear-to-r from-brand-600 to-brand-400 bg-clip-text text-2xl font-black text-transparent">
                    Esencia<span className="font-light text-slate-800">Admin</span>
                </h1>
                <button onClick={onClose} className="text-slate-500 lg:hidden hover:text-slate-700">
                    <FaTimes className="text-xl" />
                </button>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => {
                                // Close sidebar on mobile when a link is clicked
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-brand-50 text-brand-700 shadow-xs'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={isActive ? 'text-brand-600' : 'text-slate-400'}>{item.icon}</span>
                                {item.name}
                            </div>
                            <FaChevronRight className={`text-xs ${isActive ? 'text-brand-400' : 'text-slate-300 opacity-0 transition-opacity group-hover:opacity-100'}`} />
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto pt-8">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}

export default Sidebar