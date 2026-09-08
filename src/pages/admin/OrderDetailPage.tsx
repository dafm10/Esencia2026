import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import type { Ticket } from '../../types/tycketTypes'
import { workshops } from '../../data/workshops'
import { generateTicketPdf } from '../../utils/pdfGenerator'
import StatusBadge from '../../components/admin/StatusBadge'
import { FaArrowLeft, FaCheck, FaTimes, FaSpinner, FaDownload, FaWhatsapp } from 'react-icons/fa'

const OrderDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const { data, error } = await supabase
                    .from('tickets')
                    .select('*')
                    .eq('id', id)
                    .single()
                
                if (error) throw error
                setTicket(data)

                // Fetch signed URL in case the bucket is private
                if (data.voucher_path) {
                    const { data: urlData, error: urlError } = await supabase.storage.from('vouchers').createSignedUrl(data.voucher_path, 3600)
                    if (urlError) {
                        console.error("Error cargando imagen:", urlError)
                        setImageUrl('error')
                    } else if (urlData) {
                        setImageUrl(urlData.signedUrl)
                    }
                }
            } catch (err: unknown) {
                console.error(err)
                setError("No se pudo cargar el registro.")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchTicket()
    }, [id])

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!ticket) return
        setActionLoading(true)
        setError(null)
        try {
            if (action === 'approve') {
                // Get current admin user
                const { data: { user } } = await supabase.auth.getUser();

                // Call the new Edge Function for approval (which generates PDF, QR, and sends email)
                const { error: fnError } = await supabase.functions.invoke('approve-order', {
                    body: { 
                        ticket_id: ticket.id,
                        admin_id: user?.id
                    }
                })
                if (fnError) {
                    let serverMessage = fnError.message;
                    try {
                        const errObj = fnError as { context?: { json?: () => Promise<{ error?: string }> } };
                        if (typeof errObj.context?.json === 'function') {
                            const errData = await errObj.context.json();
                            serverMessage = errData.error || serverMessage;
                        }
                    } catch { 
                        // ignorar
                    }
                    throw new Error(serverMessage)
                }
            } else {
                // Reject logic (just update db)
                const { error: dbError } = await supabase
                    .from('tickets')
                    .update({ status: 'rejected' })
                    .eq('id', ticket.id)
                if (dbError) throw dbError
            }
            
            // Re-fetch to update UI
            const { data } = await supabase.from('tickets').select('*').eq('id', ticket.id).single()
            if (data) setTicket(data)
        } catch (err: unknown) {
            console.error(err)
            setError(err instanceof Error ? err.message : "Ocurrió un error al procesar la acción.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        if (!ticket) return;
        setIsGenerating(true)
        try {
            const pdfBytes = await generateTicketPdf(ticket);
            // @ts-expect-error: pdfBytes is Uint8Array which works with Blob in browser
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket-${ticket.dni}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Error al generar PDF");
        } finally {
            setIsGenerating(false)
        }
    }

    const handleWhatsApp = () => {
        if (!ticket) return;
        const text = `¡Hola ${ticket.full_name}! Tu registro para Esencia Conf ha sido aprobado. Por favor, revisa el ticket adjunto (envíalo descargándolo). ¡Nos vemos!`;
        const phoneClean = ticket.phone.replace(/\D/g, '');
        const phoneWithCode = phoneClean.startsWith('51') ? phoneClean : `51${phoneClean}`;
        const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <FaSpinner className="animate-spin text-4xl text-brand-500" />
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="flex h-64 flex-col items-center justify-center space-y-4">
                <p className="text-slate-500">{error || "Registro no encontrado."}</p>
                <button onClick={() => navigate('/admin/orders')} className="text-brand-600 hover:underline">Volver a Registros</button>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <button 
                onClick={() => navigate('/admin/orders')}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
                <FaArrowLeft /> Volver a registros
            </button>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Detalle de Registro</h1>
                    <p className="text-slate-500">ID: {ticket.id}</p>
                </div>
                <StatusBadge status={ticket.status} />
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Datos del asistente */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Información del Asistente</h2>
                    <div className="space-y-4 text-sm">
                        <div>
                            <span className="block text-slate-500">Nombre Completo</span>
                            <span className="font-medium text-slate-900">{ticket.full_name}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">DNI</span>
                            <span className="font-medium text-slate-900">{ticket.dni}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Correo Electrónico</span>
                            <span className="font-medium text-slate-900">{ticket.email}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Teléfono</span>
                            <span className="font-medium text-slate-900">{ticket.phone}</span>
                        </div>
                        <div className="border-t border-slate-100 pt-4">
                            <span className="block text-slate-500">Iglesia Local</span>
                            <span className="font-medium text-slate-900">{ticket.church}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Cargo</span>
                            <span className="font-medium text-slate-900">{ticket.church_role}</span>
                        </div>
                        <div className="border-t border-slate-100 pt-4">
                            <span className="block text-slate-500">Área</span>
                            <span className="font-medium text-slate-900">{ticket.area}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Distrito</span>
                            <span className="font-medium text-slate-900">{ticket.district}</span>
                        </div>
                        <div className="border-t border-slate-100 pt-4">
                            <span className="block text-slate-500">Taller - Día 1</span>
                            <span className="font-medium text-slate-900">
                                {workshops.find(w => w.id === ticket.workshop_day1)?.name || ticket.workshop_day1 || 'No seleccionado'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-slate-500">Taller - Día 2</span>
                            <span className="font-medium text-slate-900">
                                {workshops.find(w => w.id === ticket.workshop_day2)?.name || ticket.workshop_day2 || 'No seleccionado'}
                            </span>
                        </div>

                        {ticket.status === 'approved' && (
                            <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-slate-100">
                                <button 
                                    onClick={handleDownloadPDF}
                                    disabled={isGenerating}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {isGenerating ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                                    Descargar Ticket PDF
                                </button>
                                <button 
                                    onClick={handleWhatsApp}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#20b858]"
                                >
                                    <FaWhatsapp className="text-lg" />
                                    Contactar por WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comprobante de Pago */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Detalles de Pago</h2>
                    <div className="mb-6 space-y-4 text-sm">
                        <div>
                            <span className="block text-slate-500">N° de Operación / Celular</span>
                            <span className="font-medium text-slate-900">{ticket.voucher_code}</span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {imageUrl === 'error' ? (
                            <div className="flex h-64 flex-col items-center justify-center p-2 text-slate-400">
                                <FaTimes className="text-3xl text-red-400 mb-2" />
                                <span className="text-sm font-medium">Bloqueado por permisos (RLS)</span>
                            </div>
                        ) : imageUrl ? (
                            <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="group relative block">
                                <img 
                                    src={imageUrl} 
                                    alt="Comprobante de pago" 
                                    className="h-64 w-full object-contain p-2"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="font-medium text-white">Ver imagen completa</span>
                                </div>
                            </a>
                        ) : (
                            <div className="flex h-64 items-center justify-center p-2 text-slate-400">
                                <FaSpinner className="animate-spin text-2xl" />
                            </div>
                        )}
                    </div>

                    {ticket.status === 'pending' && (
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => handleAction('approve')}
                                disabled={actionLoading}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                Aprobar Registro
                            </button>
                            <button
                                onClick={() => handleAction('reject')}
                                disabled={actionLoading}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
                            >
                                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                                Rechazar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrderDetailPage