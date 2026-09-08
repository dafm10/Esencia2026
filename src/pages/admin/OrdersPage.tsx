import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabaseClient'
import type { Ticket } from '../../types/tycketTypes'
import OrdersTable from '../../components/admin/OrdersTable'
import { FaSpinner, FaFileExcel } from 'react-icons/fa'

const OrdersPage = () => {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)

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

    const handleExport = () => {
        const worksheetData = tickets.map(t => ({
            'Nombre Completo': t.full_name,
            'Email': t.email,
            'Teléfono': t.phone,
            'DNI': t.dni,
            'Iglesia': t.church,
            'Cargo en Iglesia': t.church_role,
            'Área': t.area,
            'Distrito': t.district,
            'Nro Operación': t.voucher_code,
            'Estado': t.status,
            'Taller Día 1': t.workshop_day1,
            'Taller Día 2': t.workshop_day2,
            'Código Ticket': t.ticket_code,
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

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <FaSpinner className="animate-spin text-4xl text-brand-500" />
                </div>
            ) : (
                <OrdersTable tickets={tickets} />
            )}
        </div>
    )
}

export default OrdersPage