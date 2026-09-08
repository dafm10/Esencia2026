import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { FaSignOutAlt, FaUserCircle, FaBars } from 'react-icons/fa'

interface TopbarProps {
    onToggleSidebar: () => void;
}

const Topbar = ({ onToggleSidebar }: TopbarProps) => {
    const navigate = useNavigate()
    const [userName, setUserName] = useState<string>('Administrador')

    useEffect(() => {
        const getUserInfo = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.user_metadata?.full_name) {
                setUserName(user.user_metadata.full_name)
            }
        }
        getUserInfo()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/') // Return to landing page
    }

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 shadow-xs">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onToggleSidebar}
                    className="p-2 text-slate-500 lg:hidden hover:bg-slate-100 rounded-lg"
                >
                    <FaBars className="text-xl" />
                </button>
                <div className="flex items-center gap-2 text-slate-600">
                    <FaUserCircle className="text-2xl text-brand-500" />
                    <span className="font-semibold hidden sm:inline">{userName}</span>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
                <FaSignOutAlt />
                Cerrar Sesión
            </button>
        </header>
    )
}

export default Topbar
