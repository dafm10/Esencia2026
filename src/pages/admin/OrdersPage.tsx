import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabaseClient'
import type { Ticket } from '../../types/tycketTypes'
import OrdersTable from '../../components/admin/OrdersTable'
import { FaSpinner, FaFileExcel, FaSearch } from 'react-icons/fa'

const PAGE_SIZE = 15

const OrdersPage = () => {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const { data, error } = await supabase
                    .from('tickets')
                    .select('*')
                    .order('created_at', { ascending: false })
                
                if (error) throw error
                setTickets(data || [])
            } catch (err) {
                console.error("Error fetching tickets", err)
            } finally {
                setLoading(false)
            }
        }
        fetchTickets()
    }, [])

    const filteredTickets = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) return tickets
        return tickets.filter(t =>
            [t.full_name, t.dni, t.email, t.voucher_code].some(v =>
                String(v ?? '').toLowerCase().includes(term)
            )
        )
    }, [tickets, searchTerm])

    const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages)
    const pagedTickets = filteredTickets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    const handleExport = () => {
        const worksheetData = filteredTickets.map(t => ({
            'ID': t.id,
            'Nombre Completo': t.full_name,
            'Email': t.email,
            'Teléfono': t.phone,
            'DNI': t.dni,
            'Edad': t.edad || '-',
            'Profesión': t.profesion || '-',
            'Iglesia': t.church,
            'Cargo en Iglesia': t.church_role,
            'Área': t.area,
            'Distrito': t.district,
            'Nro Operación': t.voucher_code || '-',
            'Estado': t.status,
            'Taller Día 1': t.workshop_day1 || '-',
            'Taller Día 2': t.workshop_day2 || '-',
            'Código Ticket': t.ticket_code || '-',
            'Asistió': t.checked_in ? 'Sí' : 'No',
            'Fecha Asistencia': t.checked_in_at ? new Date(t.checked_in_at).toLocaleString('es-PE') : '-',
            'Revisado Por': t.reviewed_by || '-',
            'Fecha Revisión': t.reviewed_at ? new Date(t.reviewed_at).toLocaleString('es-PE') : '-',
            'Fecha Registro': new Date(t.created_at).toLocaleString('es-PE'),
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registros");
        XLSX.writeFile(wb, "Registros_Esencia_Conf.xlsx");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Registros Recientes</h1>
                    <p className="text-slate-500">Gestiona los pagos y la asistencia de los participantes.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    <FaFileExcel /> Exportar Excel
                </button>
            </div>

            <div className="relative w-full md:max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="search"
                    placeholder="Buscar por nombre, DNI, correo o Nro. de operación..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                    aria-label="Buscar registros"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-all"
                />
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <FaSpinner className="animate-spin text-4xl text-brand-500" />
                </div>
            ) : (
                <>
                    <OrdersTable tickets={pagedTickets} />
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
                        <span>
                            {filteredTickets.length === 0
                                ? '0 resultados'
                                : `Mostrando ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredTickets.length)} de ${filteredTickets.length}`}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <button
                                onClick={() => setPage(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default OrdersPage