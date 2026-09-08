import { useState, useRef } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { supabase } from '../../lib/supabaseClient'
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'

const AttendancePage = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [paused, setPaused] = useState(false)
    const [isScannerActive, setIsScannerActive] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleScan = async (detectedCodes: { rawValue: string }[]) => {
        if (!detectedCodes || detectedCodes.length === 0) return;
        const rawCode = detectedCodes[0].rawValue;
        let ticketCode = rawCode;
        try {
            const parsed = JSON.parse(rawCode);
            if (parsed.id) ticketCode = parsed.id;
        } catch {
            // Probably not JSON, fallback to raw value
        }

        // Prevent double scanning
        if (paused) return;
        setPaused(true);
        setStatus('loading');

        try {
            // Find ticket by code or id
            const { data: ticket, error: searchError } = await supabase
                .from('tickets')
                .select('*')
                .eq('id', ticketCode)
                .single()

            if (searchError || !ticket) {
                setStatus('error')
                setMessage('Ticket no encontrado o código inválido.')
                resumeAfter(3000)
                return
            }

            if (ticket.status !== 'approved') {
                setStatus('error')
                setMessage(`El ticket está ${ticket.status}. No puede ingresar.`)
                resumeAfter(3000)
                return
            }

            if (ticket.checked_in) {
                setStatus('error')
                setMessage(`Este ticket ya registró asistencia.`)
                resumeAfter(3000)
                return
            }

            // Mark as checked in
            const { error: updateError } = await supabase
                .from('tickets')
                .update({
                    checked_in: true, 
                    checked_in_at: new Date().toISOString()
                })
                .eq('id', ticket.id)

            if (updateError) throw updateError

            setStatus('success')
            setMessage(`¡Bienvenido ${ticket.full_name}! Acceso concedido.`)
            resumeAfter(3000)
        } catch (err) {
            console.error(err)
            setStatus('error')
            setMessage('Error al procesar el ticket.')
            resumeAfter(3000)
        }
    }

    const resumeAfter = (ms: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setStatus('idle')
            setPaused(false)
        }, ms)
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Control de Asistencia</h1>
                    <p className="text-slate-500">Escanea los códigos QR para registrar el ingreso.</p>
                </div>
            </div>

            {status !== 'idle' && (
                <div className={`flex items-center gap-4 rounded-xl p-6 shadow-sm border-2 animate-in fade-in slide-in-from-top-4 ${status === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' :
                    status === 'error' ? 'bg-red-50 border-red-500 text-red-900' :
                        'bg-slate-50 border-slate-300 text-slate-800'
                    }`}>
                    {status === 'loading' && <FaSpinner className="animate-spin text-4xl text-slate-500" />}
                    {status === 'success' && <FaCheckCircle className="text-4xl text-emerald-600" />}
                    {status === 'error' && <FaTimesCircle className="text-4xl text-red-600" />}

                    <div className="flex flex-col">
                        <span className="text-xl font-black">
                            {status === 'loading' ? 'Procesando...' :
                                status === 'success' ? '¡Acceso Concedido!' : 'Acceso Denegado'}
                        </span>
                        {message && <span className="text-base font-medium opacity-90">{message}</span>}
                    </div>
                </div>
            )}

            {!isScannerActive ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-xs border border-slate-200">
                    <button
                        onClick={() => setIsScannerActive(true)}
                        className="px-8 py-4 bg-brand-600 text-white font-bold rounded-full shadow-sm hover:bg-brand-700 transition-colors"
                    >
                        Iniciar Escáner
                    </button>
                    <p className="mt-4 text-sm text-slate-500 text-center max-w-sm">
                        Haz clic en el botón para activar la cámara. Es posible que el navegador te pida permisos.
                    </p>
                </div>
            ) : (
                <div className={`overflow-hidden rounded-xl border-2 ${status === 'success' ? 'border-emerald-400 opacity-50' : status === 'error' ? 'border-red-400 opacity-50' : 'border-slate-200'} bg-black shadow-xs transition-opacity duration-300`}>
                    <Scanner
                        onScan={handleScan}
                        paused={paused}
                        components={{ finder: true }}
                        constraints={{ facingMode: "environment" }}
                        onError={(err: unknown) => {
                            console.error(err);
                            const errMsg = String(err).toLowerCase();
                            if (errMsg.includes('notallowed') || errMsg.includes('permission')) {
                                alert('Permiso de cámara denegado. Por favor, otórgale acceso a la cámara en la configuración de Safari/Chrome y recarga la página.');
                            }
                        }}
                    />
                </div>
            )}

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <strong>Nota:</strong> Apunta la cámara de tu dispositivo hacia el código QR del asistente. El sistema leerá automáticamente el ticket y pausará la cámara mientras procesa.
            </div>
        </div>
    )
}

export default AttendancePage