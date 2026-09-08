import { useRef, useState, useEffect, type FormEvent } from "react"
import type { RegisterFormData } from "../../types/types"
import { FaTimes, FaSpinner, FaDownload } from "react-icons/fa"
import { supabase } from "../../lib/supabaseClient"
import { workshops } from "../../data/workshops"
import { generateTicketPdf } from "../../utils/pdfGenerator"
import type { Ticket } from "../../types/tycketTypes"

const initialFormData: RegisterFormData = {
    fullName: '',
    email: '',
    phone: '',
    dni: '',
    edad: '',
    profesion: '',
    church: '',
    churchRole: '',
    area: '',
    district: '',
    voucherCode: '',
    voucherFile: null,
    workshopDay1: '',
    workshopDay2: ''
}

const inputStyles = 'w-full rounded-full border border-dashed border-brand-300 bg-white/90 px-6 py-3.5 text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-500'

const RegisterForm = () => {
    const [formData, setFormData] = useState<RegisterFormData>(initialFormData)
    const [fileName, setFileName] = useState('Sin archivos seleccionados')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [workshopCounts, setWorkshopCounts] = useState<{ day1: Record<string, number>, day2: Record<string, number> }>({ day1: {}, day2: {} })
    const [registeredTicket, setRegisteredTicket] = useState<Ticket | null>(null)

    useEffect(() => {
        async function fetchCounts() {
            try {
                const { data } = await supabase.rpc('get_workshop_counts')
                if (data) {
                    const counts = { day1: {} as Record<string, number>, day2: {} as Record<string, number> }
                    data.forEach((row: { day: string; workshop: string; count: string }) => {
                        if (row.day === 'day1') counts.day1[row.workshop] = parseInt(row.count)
                        if (row.day === 'day2') counts.day2[row.workshop] = parseInt(row.count)
                    })
                    setWorkshopCounts(counts)
                }
            } catch (e) {
                console.error("Error fetching workshop counts", e)
            }
        }
        fetchCounts()
    }, [])

    function handleChange(field: keyof RegisterFormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null
        setFormData((prev) => ({ ...prev, voucherFile: file }))
        setFileName(file ? file.name : 'Sin archivos seleccionados')
    }

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            const submitData = new FormData()
            submitData.append('fullName', formData.fullName)
            submitData.append('email', formData.email)
            submitData.append('phone', formData.phone)
            submitData.append('dni', formData.dni)
            submitData.append('edad', formData.edad)
            submitData.append('profesion', formData.profesion)
            submitData.append('church', formData.church)
            submitData.append('churchRole', formData.churchRole)
            submitData.append('area', formData.area)
            submitData.append('district', formData.district)
            submitData.append('voucherCode', formData.voucherCode)
            submitData.append('workshopDay1', formData.workshopDay1)
            submitData.append('workshopDay2', formData.workshopDay2)
            if (formData.voucherFile) {
                submitData.append('voucherFile', formData.voucherFile)
            }

            const { data, error } = await supabase.functions.invoke('create-order', {
                body: submitData
            })

            if (error) {
                // Si la Edge Function devuelve un error 400 o 500, intentamos leer su JSON interno
                let serverMessage = error.message;
                try {
                    const errObj = error as { context?: { json?: () => Promise<{ error?: string }> } };
                    if (typeof errObj.context?.json === 'function') {
                        const errData = await errObj.context.json();
                        serverMessage = errData.error || serverMessage;
                    }
                } catch {
                    // ignorar
                }
                throw new Error(serverMessage);
            }

            if (data?.error) throw new Error(data.error)

            if (data?.ticket) {
                setRegisteredTicket(data.ticket)
            }
            setMessage({ type: 'success', text: '¡Registro completado con éxito! Puedes descargar tu entrada aquí mismo o buscarla en tu correo.' })
            setFormData(initialFormData)
            setFileName('Sin archivos seleccionados')
            if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (err) {
            const error = err as Error
            console.error("Submit Error:", error)
            setMessage({ type: 'error', text: error.message || "Ocurrió un error inesperado al registrarte." })
        } finally {
            setIsLoading(false)
        }
    }

    function handleRemoveFile() {
        setFormData((prev) => ({ ...prev, voucherFile: null }))
        setFileName('Sin archivos seleccionados')

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const [isDownloading, setIsDownloading] = useState(false);
    const handleDownloadTicket = async () => {
        if (!registeredTicket) return;
        setIsDownloading(true);
        try {
            const pdfBytes = await generateTicketPdf(registeredTicket);
            // @ts-expect-error: pdfBytes is Uint8Array which works with Blob in browser
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket-${registeredTicket.dni}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error generating PDF", error);
            alert("Hubo un error al generar tu entrada.");
        } finally {
            setIsDownloading(false);
        }
    }

    return (
        <section id="registro" className="bg-brand-50 bg-cover bg-center py-24">
            <div className="relative z-10 mx-auto max-w-4xl px-6">
                <div className="mb-4 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-slate-900">Regístrate al Evento</h2>
                    <div className="mx-auto mb-6 h-1 w-16 bg-linear-to-r from-brand-800 to-brand-400" />
                    <p className="mb-12 text-slate-500">Recuerda hacer el pago desde tu Banca Móvil BCP y elige Pago de Servicios</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <input
                        type="text"
                        placeholder="Nombre y Apellidos completos"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <input
                        type="email"
                        placeholder="Tu correo electrónico*"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <input
                        type="tel"
                        placeholder="Teléfono*"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <input
                        type="text"
                        placeholder="DNI*"
                        value={formData.dni}
                        onChange={(e) => handleChange('dni', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <input
                        type="number"
                        placeholder="Edad*"
                        value={formData.edad}
                        onChange={(e) => handleChange('edad', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Profesión u Oficio*"
                        value={formData.profesion}
                        onChange={(e) => handleChange('profesion', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Iglesia Local en..."
                        value={formData.church}
                        onChange={(e) => handleChange('church', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Cargo en la Iglesia*"
                        value={formData.churchRole}
                        onChange={(e) => handleChange('churchRole', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Área*"
                        value={formData.area}
                        onChange={(e) => handleChange('area', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Distrito*"
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        className={inputStyles}
                        required
                    />

                    <select
                        value={formData.workshopDay1}
                        onChange={(e) => handleChange('workshopDay1', e.target.value)}
                        className={`${inputStyles} appearance-none bg-white`}
                        required
                    >
                        <option value="" disabled>Selecciona tu Taller (Día 1)*</option>
                        {['ADOLESCENTES', 'JÓVENES', 'GENERAL'].map(category => (
                            <optgroup key={`d1-cat-${category}`} label={category}>
                                {workshops.filter(w => w.category === category).map((w) => {
                                    const wName = w.nameDay1 || w.name;
                                    const count = workshopCounts.day1[wName] || 0;
                                    const isFull = w.limit !== null && count >= w.limit;
                                    return (
                                        <option key={`d1-${w.id}`} value={wName} disabled={isFull}>
                                            {wName} {isFull ? '(Sala llena)' : ''}
                                        </option>
                                    )
                                })}
                            </optgroup>
                        ))}
                    </select>

                    <div>
                        <select
                            value={formData.workshopDay2}
                            onChange={(e) => handleChange('workshopDay2', e.target.value)}
                            className={`${inputStyles} appearance-none bg-white`}
                            required
                        >
                            <option value="" disabled>Selecciona tu Taller (Día 2)*</option>
                            {['ADOLESCENTES', 'JÓVENES', 'GENERAL'].map(category => (
                                <optgroup key={`d2-cat-${category}`} label={category}>
                                    {workshops.filter(w => w.category === category).map((w) => {
                                        const wName = w.nameDay2 || w.name;
                                        const count = workshopCounts.day2[wName] || 0;
                                        const isFull = w.limit !== null && count >= w.limit;
                                        return (
                                            <option key={`d2-${w.id}`} value={wName} disabled={isFull}>
                                                {wName} {isFull ? '(Sala llena)' : ''}
                                            </option>
                                        )
                                    })}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-1">
                        <input
                            type="text"
                            placeholder="Nro. de Operación"
                            value={formData.voucherCode}
                            onChange={(e) => handleChange('voucherCode', e.target.value)}
                            className={inputStyles}
                            required
                        />
                        <p className="mt-2 px-4 text-xs text-slate-400">Paga desde App BCP -&gt; Pago de Servicios -&gt; Iglesia Dios de La Profe</p>
                    </div>

                    <div className="sm:col-span-1">
                        <div className="flex h-13 items-center gap-3 rounded-full border border-dashed border-brand-300 bg-white/90 px-3">
                            <label
                                htmlFor="voucher-file"
                                className="cursor-pointer whitespace-nowrap rounded-full bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300"
                            >
                                Adjuntar
                            </label>
                            <input
                                id="voucher-file"
                                type="file"
                                required={!formData.voucherFile}
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <span className="flex-1 truncate text-sm text-slate-500">{fileName}</span>

                            {formData.voucherFile && (
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-600"
                                    aria-label="Quitar archivo"
                                >
                                    <FaTimes className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        <p className="mt-2 px-4 text-[11px] text-slate-400">
                            JPG, PNG o PDF (Máx 5MB)
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="col-span-full mx-auto mt-6 flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-brand-800 to-brand-400 px-12 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="animate-spin" /> Registrando...
                            </>
                        ) : 'Registrarme'}
                    </button>

                    {message && (
                        <div className={`col-span-full mt-4 rounded-lg p-6 text-center text-sm font-medium flex flex-col items-center justify-center gap-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <p className="text-base">{message.text}</p>
                            {message.type === 'success' && registeredTicket && (
                                <button
                                    type="button"
                                    onClick={handleDownloadTicket}
                                    disabled={isDownloading}
                                    className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                    {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                                    Descargar mi Entrada PDF
                                </button>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </section >
    )
}

export default RegisterForm