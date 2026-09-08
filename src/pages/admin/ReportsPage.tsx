import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Ticket } from '../../types/tycketTypes'
import ReportChart from '../../components/admin/ReportChart'
import { FaSearch, FaDownload } from 'react-icons/fa'
import { workshops } from '../../data/workshops'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const ReportsPage = () => {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedWorkshop, setSelectedWorkshop] = useState('')
    const [filterDay1, setFilterDay1] = useState(false)
    const [filterDay2, setFilterDay2] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTickets = async () => {
            const { data } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (data) setTickets(data as Ticket[])
            setLoading(false)
        }
        fetchTickets()
    }, [])

    const filteredTickets = tickets.filter(t => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = t.full_name.toLowerCase().includes(term) || t.dni.includes(term);
        
        let matchesWorkshop = true;
        if (selectedWorkshop) {
            const w = workshops.find(wk => wk.id === selectedWorkshop);
            if (w) {
                const w1 = w.nameDay1 || w.name;
                const w2 = w.nameDay2 || w.name;
                if (filterDay1 && filterDay2) {
                    matchesWorkshop = t.workshop_day1 === w1 || t.workshop_day2 === w2;
                } else if (filterDay1) {
                    matchesWorkshop = t.workshop_day1 === w1;
                } else if (filterDay2) {
                    matchesWorkshop = t.workshop_day2 === w2;
                } else {
                    matchesWorkshop = t.workshop_day1 === w1 || t.workshop_day2 === w2;
                }
            } else {
                matchesWorkshop = false;
            }
        }

        return matchesSearch && matchesWorkshop;
    })

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Reporte de Asistentes');

        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre Completo', key: 'full_name', width: 30 },
            { header: 'Correo', key: 'email', width: 25 },
            { header: 'Teléfono', key: 'phone', width: 15 },
            { header: 'DNI', key: 'dni', width: 12 },
            { header: 'Edad', key: 'edad', width: 10 },
            { header: 'Profesión', key: 'profesion', width: 20 },
            { header: 'Iglesia', key: 'church', width: 20 },
            { header: 'Cargo en Iglesia', key: 'church_role', width: 15 },
            { header: 'Área', key: 'area', width: 15 },
            { header: 'Distrito', key: 'district', width: 15 },
            { header: 'Taller Día 1', key: 'workshop_day1', width: 30 },
            { header: 'Taller Día 2', key: 'workshop_day2', width: 30 },
            { header: 'Estado', key: 'status', width: 12 },
            { header: 'Fecha Registro', key: 'created_at', width: 20 }
        ];

        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1D5DB' } };

        filteredTickets.forEach((t, idx) => {
            sheet.addRow({
                id: idx + 1,
                full_name: t.full_name,
                email: t.email,
                phone: t.phone,
                dni: t.dni,
                edad: t.edad || '-',
                profesion: t.profesion || '-',
                church: t.church,
                church_role: t.church_role,
                area: t.area,
                district: t.district,
                workshop_day1: t.workshop_day1 || 'Pendiente',
                workshop_day2: t.workshop_day2 || 'Pendiente',
                status: t.status === 'approved' ? 'Aprobado' : t.status === 'rejected' ? 'Rechazado' : 'Pendiente',
                created_at: new Date(t.created_at).toLocaleString('es-ES')
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'Reporte_Asistentes.xlsx');
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando reportes...</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reportes Generales</h1>
                <p className="text-slate-500">Visualiza estadísticas y el registro completo de asistentes.</p>
            </div>

            <ReportChart tickets={tickets} />

            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-800">Listado de Asistentes ({filteredTickets.length})</h3>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:w-auto">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre o DNI..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <select 
                                value={selectedWorkshop}
                                onChange={e => setSelectedWorkshop(e.target.value)}
                                className="w-full md:w-64 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-all text-slate-700"
                            >
                                <option value="">Todos los talleres</option>
                                {workshops.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>

                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={filterDay1}
                                    onChange={e => setFilterDay1(e.target.checked)}
                                    className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                                />
                                Día 1
                            </label>
                            
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={filterDay2}
                                    onChange={e => setFilterDay2(e.target.checked)}
                                    className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                                />
                                Día 2
                            </label>
                        </div>

                        <button
                            onClick={exportToExcel}
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <FaDownload />
                            Exportar
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Nombre Completo</th>
                                <th className="px-6 py-4">DNI</th>
                                <th className="px-6 py-4">Área</th>
                                <th className="px-6 py-4">Iglesia</th>
                                <th className="px-6 py-4">Taller Día 1</th>
                                <th className="px-6 py-4">Taller Día 2</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{ticket.full_name}</td>
                                    <td className="px-6 py-4">{ticket.dni}</td>
                                    <td className="px-6 py-4">{ticket.area}</td>
                                    <td className="px-6 py-4 text-slate-700">{ticket.church}</td>
                                    <td className="px-6 py-4 text-slate-700 text-sm">{ticket.workshop_day1 || '-'}</td>
                                    <td className="px-6 py-4 text-slate-700 text-sm">{ticket.workshop_day2 || '-'}</td>
                                </tr>
                            ))}
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron asistentes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ReportsPage