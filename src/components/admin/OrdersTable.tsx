import { Link } from 'react-router-dom'
import type { Ticket } from '../../types/tycketTypes'
import StatusBadge from './StatusBadge'
import { FaEye } from 'react-icons/fa'

export default function OrdersTable({ tickets }: { tickets: Ticket[] }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Asistente</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Iglesia / Cargo</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Ubicación</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Asistencia</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} className="transition-colors hover:bg-slate-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900">{ticket.full_name}</span>
                                        <span className="text-sm text-slate-500">{ticket.email}</span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-900">{ticket.church}</span>
                                        <span className="text-sm text-slate-500">{ticket.church_role}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{ticket.area}</div>
                                    <div className="text-xs text-slate-500">{ticket.district}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <StatusBadge status={ticket.status} />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {ticket.checked_in ? (
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold">Ingresó</span>
                                                {ticket.checked_in_at && (
                                                    <span className="text-[10px] text-emerald-500/80">
                                                        {new Date(ticket.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-medium text-slate-400">Sin ingresar</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <Link
                                        to={`/admin/orders/${ticket.id}`}
                                        className="inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-brand-700 transition-colors hover:bg-brand-100"
                                    >
                                        <FaEye /> Detalle
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {tickets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <p>No hay registros encontrados.</p>
                </div>
            )}
        </div>
    )
}