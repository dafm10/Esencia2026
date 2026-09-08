import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Ticket } from '../../types/tycketTypes'
import OrdersTable from '../../components/admin/OrdersTable'
import { FaUsers, FaClock, FaCheckCircle, FaDoorOpen } from 'react-icons/fa'

const DashboardPage = () => {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTickets = async () => {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (data) setTickets(data)
            if (error) console.error("Error cargando dashboard:", error)
            setLoading(false)
        }
        fetchTickets()
    }, [])

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
            </div>
        )
    }

    const total = tickets.length
    const pendientes = tickets.filter(t => t.status === 'pending').length
    const aprobados = tickets.filter(t => t.status === 'approved').length
    const asistencias = tickets.filter(t => t.checked_in).length

    const porcentajeAsistencia = aprobados > 0 ? Math.round((asistencias / aprobados) * 100) : 0

    // Últimos asistentes (los que hicieron check-in más recientemente)
    const ultimosAsistentes = [...tickets]
        .filter(t => t.checked_in && t.checked_in_at)
        .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime())
        .slice(0, 5)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard General</h1>
                <p className="text-slate-500">Métricas en tiempo real del evento Esencia Conf.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FaUsers className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Registrados</p>
                            <p className="text-3xl font-black text-slate-900">{total}</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                            <FaClock className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Por Aprobar</p>
                            <p className="text-3xl font-black text-slate-900">{pendientes}</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <FaCheckCircle className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Aprobados</p>
                            <p className="text-3xl font-black text-slate-900">{aprobados}</p>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-600 p-6 shadow-xs transition-shadow hover:shadow-md">
                    <div className="absolute -right-4 -top-4 opacity-10">
                        <FaDoorOpen className="text-9xl text-white" />
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                            <FaDoorOpen className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-brand-100">Ya Ingresaron</p>
                            <p className="text-3xl font-black text-white">{asistencias}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aforo / Progreso */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Aforo de Aprobados</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                        {asistencias} de {aprobados}
                    </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                    <div 
                        className="h-full bg-brand-500 transition-all duration-1000 ease-out"
                        style={{ width: `${porcentajeAsistencia}%` }}
                    />
                </div>
                <p className="mt-2 text-right text-xs font-medium text-slate-500">
                    {porcentajeAsistencia}% de los aprobados han llegado
                </p>
            </div>

            {/* Últimos Ingresos */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Últimos Ingresos</h2>
                        <p className="text-sm text-slate-500">Los 5 asistentes que acaban de escanear su ticket.</p>
                    </div>
                </div>
                
                {ultimosAsistentes.length > 0 ? (
                    <OrdersTable tickets={ultimosAsistentes} />
                ) : (
                    <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
                        <FaDoorOpen className="mb-2 text-3xl opacity-50" />
                        <p>Nadie ha ingresado todavía.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DashboardPage