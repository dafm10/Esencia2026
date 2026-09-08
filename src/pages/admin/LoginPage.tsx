import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { FaIdCard, FaLock, FaSpinner } from 'react-icons/fa'

const LoginPage = () => {
    const [dni, setDni] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                navigate('/admin')
            }
        }
        checkSession()
    }, [navigate])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            // 1. Obtener el correo asociado al DNI vía RPC
            const { data: email, error: rpcError } = await supabase.rpc('get_admin_email_by_dni', {
                p_dni: dni
            })

            if (rpcError || !email) {
                throw new Error("Credenciales inválidas. Verifica tu DNI o contraseña.")
            }

            // 2. Iniciar sesión en Supabase con el correo obtenido y la contraseña
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email as string,
                password,
            })

            if (authError) {
                throw new Error("Credenciales inválidas. Verifica tu DNI o contraseña.")
            }

            // Éxito: Redirigir al dashboard
            navigate('/admin')

        } catch (err: unknown) {
            console.error("Error en login:", err)
            setError(err instanceof Error ? err.message : "Ocurrió un error al intentar iniciar sesión.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <div className="bg-brand-600 px-8 py-10 text-center text-white">
                    <h1 className="text-3xl font-black tracking-tight">
                        Esencia<span className="font-light">Admin</span>
                    </h1>
                    <p className="mt-2 text-brand-100 opacity-90">Panel de Administración del Evento</p>
                </div>

                <div className="px-8 py-10">
                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                DNI de Administrador
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <FaIdCard className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ''))} // Solo números
                                    maxLength={8}
                                    placeholder="Ej. 46489536"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <FaLock className="text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || dni.length < 8 || password.length === 0}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-bold tracking-wide text-white transition-all hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 disabled:opacity-50 disabled:hover:bg-brand-600"
                        >
                            {loading ? <FaSpinner className="animate-spin text-lg" /> : 'Iniciar Sesión'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-8">
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-600">
                    ← Volver a la página principal
                </Link>
            </div>
        </div>
    )
}

export default LoginPage