import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import type { Ticket } from '../../types/tycketTypes'
import { workshops } from '../../data/workshops'
import { generateTicketPdf } from '../../utils/pdfGenerator'
import StatusBadge from '../../components/admin/StatusBadge'
import {
    FaArrowLeft,
    FaCheck,
    FaTimes,
    FaSpinner,
    FaDownload,
    FaWhatsapp,
    FaEdit,
    FaTrash,
    FaSave,
    FaExclamationTriangle,
} from 'react-icons/fa'

interface EditTicketForm {
    full_name: string
    dni: string
    edad: string
    profesion: string
    email: string
    phone: string
    church: string
    church_role: string
    area: string
    district: string
    voucher_code: string
    workshop_day1: string
    workshop_day2: string
}

const resolveWorkshopDay1 = (val?: string): string => {
    if (!val) return ''
    const foundById = workshops.find((w) => w.id === val)
    if (foundById) return foundById.nameDay1 || foundById.name
    return val
}

const resolveWorkshopDay2 = (val?: string): string => {
    if (!val) return ''
    const foundById = workshops.find((w) => w.id === val)
    if (foundById) return foundById.nameDay2 || foundById.name
    return val
}

const OrderDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Admin role & management states
    const [isAdmin, setIsAdmin] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [workshopCounts, setWorkshopCounts] = useState<{
        day1: Record<string, number>
        day2: Record<string, number>
    }>({ day1: {}, day2: {} })

    const [editForm, setEditForm] = useState<EditTicketForm>({
        full_name: '',
        dni: '',
        edad: '',
        profesion: '',
        email: '',
        phone: '',
        church: '',
        church_role: '',
        area: '',
        district: '',
        voucher_code: '',
        workshop_day1: '',
        workshop_day2: '',
    })

    const fetchWorkshopCounts = async () => {
        try {
            const { data } = await supabase.rpc('get_workshop_counts')
            if (data) {
                const counts = {
                    day1: {} as Record<string, number>,
                    day2: {} as Record<string, number>,
                }
                data.forEach((row: { day: string; workshop: string; count: string }) => {
                    if (row.day === 'day1') counts.day1[row.workshop] = parseInt(row.count, 10)
                    if (row.day === 'day2') counts.day2[row.workshop] = parseInt(row.count, 10)
                })
                setWorkshopCounts(counts)
            }
        } catch (err) {
            console.error('Error fetching workshop counts:', err)
        }
    }

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Check current user role
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (user) {
                    const { data: roleData } = await supabase
                        .from('admin_users')
                        .select('role')
                        .eq('id', user.id)
                        .single()

                    if (roleData?.role === 'admin') {
                        setIsAdmin(true)
                    }
                }

                // 2. Fetch ticket details
                const { data, error: ticketError } = await supabase
                    .from('tickets')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (ticketError) throw ticketError
                setTicket(data)

                // 3. Fetch signed URL in case the bucket is private
                if (data.voucher_path) {
                    const { data: urlData, error: urlError } = await supabase.storage
                        .from('vouchers')
                        .createSignedUrl(data.voucher_path, 3600)
                    if (urlError) {
                        console.error('Error cargando imagen:', urlError)
                        setImageUrl('error')
                    } else if (urlData) {
                        setImageUrl(urlData.signedUrl)
                    }
                }

                // 4. Fetch workshop counts for workshop editing
                await fetchWorkshopCounts()
            } catch (err: unknown) {
                console.error(err)
                setError('No se pudo cargar el registro.')
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchInitialData()
    }, [id])

    const handleStartEdit = () => {
        if (!ticket) return
        setEditForm({
            full_name: ticket.full_name || '',
            dni: ticket.dni || '',
            edad: ticket.edad || '',
            profesion: ticket.profesion || '',
            email: ticket.email || '',
            phone: ticket.phone || '',
            church: ticket.church || '',
            church_role: ticket.church_role || '',
            area: ticket.area || '',
            district: ticket.district || '',
            voucher_code: ticket.voucher_code || '',
            workshop_day1: resolveWorkshopDay1(ticket.workshop_day1),
            workshop_day2: resolveWorkshopDay2(ticket.workshop_day2),
        })
        setError(null)
        setSuccessMessage(null)
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleSaveEdit = async (e: FormEvent) => {
        e.preventDefault()
        if (!ticket || !isAdmin) return

        setIsSaving(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const { data: updatedTicket, error: updateError } = await supabase
                .from('tickets')
                .update({
                    full_name: editForm.full_name.trim(),
                    dni: editForm.dni.trim(),
                    edad: editForm.edad.trim(),
                    profesion: editForm.profesion.trim(),
                    email: editForm.email.trim(),
                    phone: editForm.phone.trim(),
                    church: editForm.church.trim(),
                    church_role: editForm.church_role.trim(),
                    area: editForm.area.trim(),
                    district: editForm.district.trim(),
                    voucher_code: editForm.voucher_code.trim(),
                    workshop_day1: editForm.workshop_day1,
                    workshop_day2: editForm.workshop_day2,
                })
                .eq('id', ticket.id)
                .select('*')
                .single()

            if (updateError) throw updateError
            if (!updatedTicket) {
                throw new Error('No se pudo actualizar el registro (verifica permisos RLS).')
            }

            setTicket(updatedTicket)
            setIsEditing(false)
            setSuccessMessage('¡Información del registro actualizada correctamente!')
            await fetchWorkshopCounts()
        } catch (err: unknown) {
            console.error(err)
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al guardar los cambios del registro.'
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteTicket = async () => {
        if (!ticket || !isAdmin) return
        setIsDeleting(true)
        setError(null)

        try {
            const { error: deleteError } = await supabase
                .from('tickets')
                .delete()
                .eq('id', ticket.id)

            if (deleteError) throw deleteError

            // Verify record was actually removed (in case RLS silently blocked deletion)
            const { data: checkStillExists } = await supabase
                .from('tickets')
                .select('id')
                .eq('id', ticket.id)
                .maybeSingle()

            if (checkStillExists) {
                throw new Error(
                    'No se pudo eliminar el registro debido a permisos de base de datos (política RLS DELETE).'
                )
            }

            if (ticket.voucher_path) {
                try {
                    await supabase.storage.from('vouchers').remove([ticket.voucher_path])
                } catch (storageErr) {
                    console.warn('No se pudo eliminar el comprobante del storage:', storageErr)
                }
            }

            setIsDeleteModalOpen(false)
            navigate('/admin/orders')
        } catch (err: unknown) {
            console.error(err)
            setIsDeleteModalOpen(false)
            setError(
                err instanceof Error ? err.message : 'Ocurrió un error al eliminar el registro.'
            )
        } finally {
            setIsDeleting(false)
        }
    }

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!ticket) return
        setActionLoading(true)
        setError(null)
        setSuccessMessage(null)
        try {
            if (action === 'approve') {
                // Get current admin user
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                // Call the Edge Function for approval (which generates PDF, QR, and sends email)
                const { error: fnError } = await supabase.functions.invoke('approve-order', {
                    body: {
                        ticket_id: ticket.id,
                        admin_id: user?.id,
                    },
                })
                if (fnError) {
                    let serverMessage = fnError.message
                    try {
                        const errObj = fnError as {
                            context?: { json?: () => Promise<{ error?: string }> }
                        }
                        if (typeof errObj.context?.json === 'function') {
                            const errData = await errObj.context.json()
                            serverMessage = errData.error || serverMessage
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
            setError(
                err instanceof Error ? err.message : 'Ocurrió un error al procesar la acción.'
            )
        } finally {
            setActionLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        if (!ticket) return
        setIsGenerating(true)
        try {
            const pdfBytes = await generateTicketPdf(ticket)
            // @ts-expect-error: pdfBytes is Uint8Array which works with Blob in browser
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `ticket-${ticket.dni}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error(err)
            alert('Error al generar PDF')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleWhatsApp = () => {
        if (!ticket) return
        const text = `¡Hola ${ticket.full_name}! Tu registro para Esencia Conf ha sido aprobado. Por favor, revisa el ticket adjunto (envíalo descargándolo). ¡Nos vemos!`
        const phoneClean = ticket.phone.replace(/\D/g, '')
        const phoneWithCode = phoneClean.startsWith('51') ? phoneClean : `51${phoneClean}`
        const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
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
                <p className="text-slate-500">{error || 'Registro no encontrado.'}</p>
                <button
                    type="button"
                    onClick={() => navigate('/admin/orders')}
                    className="text-brand-600 hover:underline"
                >
                    Volver a Registros
                </button>
            </div>
        )
    }

    const standardDay1Options = workshops.map((w) => w.nameDay1 || w.name)
    const standardDay2Options = workshops.map((w) => w.nameDay2 || w.name)

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <button
                type="button"
                onClick={() => navigate('/admin/orders')}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
                <FaArrowLeft /> Volver a registros
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Detalle de Registro</h1>
                    <p className="text-slate-500">ID: {ticket.id}</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Registrado el: {new Date(ticket.created_at).toLocaleString('es-PE')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={ticket.status} />

                    {isAdmin && (
                        <>
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={handleStartEdit}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
                                >
                                    <FaEdit className="text-brand-600" />
                                    Editar Información
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                            >
                                <FaTrash />
                                Eliminar Registro
                            </button>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                    {successMessage}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Datos del asistente */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Información del Asistente
                        </h2>
                        {isAdmin && !isEditing && (
                            <button
                                type="button"
                                onClick={handleStartEdit}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                            >
                                <FaEdit /> Editar
                            </button>
                        )}
                    </div>

                    {isEditing && isAdmin ? (
                        <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.full_name}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, full_name: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">
                                        DNI *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={8}
                                        value={editForm.dni}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                dni: e.target.value.replace(/\D/g, ''),
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">
                                        Edad
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.edad}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, edad: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    Profesión u Oficio
                                </label>
                                <input
                                    type="text"
                                    value={editForm.profesion}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, profesion: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    Correo Electrónico *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={editForm.email}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, email: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    Teléfono *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={editForm.phone}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, phone: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                />
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    Iglesia Local *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.church}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, church: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    Cargo
                                </label>
                                <input
                                    type="text"
                                    value={editForm.church_role}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, church_role: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">
                                        Área *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.area}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, area: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">
                                        Distrito *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.district}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, district: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    Taller - Día 1 *
                                </label>
                                <select
                                    required
                                    value={editForm.workshop_day1}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, workshop_day1: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                >
                                    <option value="" disabled>
                                        Selecciona un taller para el Día 1
                                    </option>
                                    {editForm.workshop_day1 &&
                                        !standardDay1Options.includes(editForm.workshop_day1) && (
                                            <option value={editForm.workshop_day1}>
                                                {editForm.workshop_day1} (Actual)
                                            </option>
                                        )}
                                    {['ADOLESCENTES', 'JÓVENES', 'GENERAL'].map((category) => {
                                        const categoryWorkshops = workshops.filter(
                                            (w) => w.category === category
                                        )
                                        if (categoryWorkshops.length === 0) return null
                                        return (
                                            <optgroup key={`edit-d1-${category}`} label={category}>
                                                {categoryWorkshops.map((w) => {
                                                    const wName = w.nameDay1 || w.name
                                                    const count = workshopCounts.day1[wName] || 0
                                                    const limitLabel =
                                                        w.limit !== null
                                                            ? `(${count}/${w.limit})`
                                                            : `(${count})`
                                                    return (
                                                        <option key={`edit-d1-${w.id}`} value={wName}>
                                                            {wName} {limitLabel}
                                                        </option>
                                                    )
                                                })}
                                            </optgroup>
                                        )
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    Taller - Día 2 *
                                </label>
                                <select
                                    required
                                    value={editForm.workshop_day2}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, workshop_day2: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                >
                                    <option value="" disabled>
                                        Selecciona un taller para el Día 2
                                    </option>
                                    {editForm.workshop_day2 &&
                                        !standardDay2Options.includes(editForm.workshop_day2) && (
                                            <option value={editForm.workshop_day2}>
                                                {editForm.workshop_day2} (Actual)
                                            </option>
                                        )}
                                    {['ADOLESCENTES', 'JÓVENES', 'GENERAL'].map((category) => {
                                        const categoryWorkshops = workshops.filter(
                                            (w) => w.category === category
                                        )
                                        if (categoryWorkshops.length === 0) return null
                                        return (
                                            <optgroup key={`edit-d2-${category}`} label={category}>
                                                {categoryWorkshops.map((w) => {
                                                    const wName = w.nameDay2 || w.name
                                                    const count = workshopCounts.day2[wName] || 0
                                                    const limitLabel =
                                                        w.limit !== null
                                                            ? `(${count}/${w.limit})`
                                                            : `(${count})`
                                                    return (
                                                        <option key={`edit-d2-${w.id}`} value={wName}>
                                                            {wName} {limitLabel}
                                                        </option>
                                                    )
                                                })}
                                            </optgroup>
                                        )
                                    })}
                                </select>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    N° de Operación / Celular
                                </label>
                                <input
                                    type="text"
                                    value={editForm.voucher_code}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, voucher_code: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                />
                            </div>

                            <div className="flex gap-3 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={isSaving}
                                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : (
                                        <FaSave />
                                    )}
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    ) : (
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
                                <span className="block text-slate-500">Edad</span>
                                <span className="font-medium text-slate-900">
                                    {ticket.edad || '-'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Profesión u Oficio</span>
                                <span className="font-medium text-slate-900">
                                    {ticket.profesion || '-'}
                                </span>
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
                                <span className="font-medium text-slate-900">
                                    {ticket.church_role}
                                </span>
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
                                    {resolveWorkshopDay1(ticket.workshop_day1) || 'No seleccionado'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Taller - Día 2</span>
                                <span className="font-medium text-slate-900">
                                    {resolveWorkshopDay2(ticket.workshop_day2) || 'No seleccionado'}
                                </span>
                            </div>

                            {ticket.status === 'approved' && (
                                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleDownloadPDF}
                                        disabled={isGenerating}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {isGenerating ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaDownload />
                                        )}
                                        Descargar Ticket PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleWhatsApp}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#20b858]"
                                    >
                                        <FaWhatsapp className="text-lg" />
                                        Contactar por WhatsApp
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Comprobante de Pago */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Detalles de Pago</h2>
                    <div className="mb-6 space-y-4 text-sm">
                        <div>
                            <span className="block text-slate-500">N° de Operación / Celular</span>
                            <span className="font-medium text-slate-900">
                                {ticket.voucher_code}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {!ticket.voucher_path ? (
                            <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-slate-500">
                                <div className="mb-3 rounded-full bg-slate-100 p-4">
                                    <FaCheck className="text-3xl text-emerald-500" />
                                </div>
                                <span className="text-base font-bold text-slate-700">
                                    SIN COMPROBANTE
                                </span>
                                <span className="mt-1 text-sm text-slate-500">REGISTRO MASIVO</span>
                            </div>
                        ) : imageUrl === 'error' ? (
                            <div className="flex h-64 flex-col items-center justify-center p-2 text-slate-400">
                                <FaTimes className="mb-2 text-3xl text-red-400" />
                                <span className="text-sm font-medium">
                                    Bloqueado por permisos (RLS)
                                </span>
                            </div>
                        ) : imageUrl ? (
                            <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative block"
                            >
                                <img
                                    src={imageUrl}
                                    alt="Comprobante de pago"
                                    className="h-64 w-full object-contain p-2"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="font-medium text-white">
                                        Ver imagen completa
                                    </span>
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
                                type="button"
                                onClick={() => handleAction('approve')}
                                disabled={actionLoading}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <FaSpinner className="animate-spin" />
                                ) : (
                                    <FaCheck />
                                )}
                                Aprobar Registro
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAction('reject')}
                                disabled={actionLoading}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <FaSpinner className="animate-spin" />
                                ) : (
                                    <FaTimes />
                                )}
                                Rechazar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            {isDeleteModalOpen && isAdmin && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-order-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
                >
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center gap-3 text-red-600">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                                <FaExclamationTriangle className="text-lg" />
                            </div>
                            <h2 id="delete-order-title" className="text-lg font-bold text-slate-900">
                                ¿Eliminar este registro?
                            </h2>
                        </div>

                        <p className="mb-6 text-sm text-slate-600">
                            Estás por eliminar permanentemente el registro de{' '}
                            <strong className="font-semibold text-slate-900">
                                {ticket.full_name}
                            </strong>{' '}
                            (DNI: <strong className="font-semibold text-slate-900">{ticket.dni}</strong>
                            ). Esta acción liberará sus cupos de talleres y no se puede deshacer.
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteTicket}
                                disabled={isDeleting}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <FaSpinner className="animate-spin" />
                                ) : (
                                    <FaTrash />
                                )}
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderDetailPage