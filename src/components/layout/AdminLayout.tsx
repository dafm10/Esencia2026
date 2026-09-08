import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Overlay para móviles */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl p-4 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}