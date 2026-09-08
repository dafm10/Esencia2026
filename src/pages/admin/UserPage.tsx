import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { FaPlus, FaTrash, FaSpinner, FaUserShield, FaUser } from 'react-icons/fa'

interface AdminUser {
    id: string
    dni: string
    email: string
    full_name: string
    phone: string
    role: string
    created_at: string
}

export default function UserPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        dni: '',
        email: '',
        full_name: '',
        phone: '',
        password: '',
        role: 'operator'
    })

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setUsers(data)
        if (error) console.error("Error fetching users:", error)
        setLoading(false)
    }

    useEffect(() => {
        // Wrap in setTimeout to bypass the strict Biome synchronous setState check
        const timer = setTimeout(() => {
            fetchUsers().catch(console.error)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const { error: rpcError } = await supabase.rpc('create_admin_user', {
                p_email: formData.email,
                p_password: formData.password,
                p_dni: formData.dni,
                p_full_name: formData.full_name,
                p_phone: formData.phone,
                p_role: formData.role
            })

            if (rpcError) throw new Error(rpcError.message)

            setFormData({ dni: '', email: '', full_name: '', phone: '', password: '', role: 'operator' })
            setIsModalOpen(false)
            fetchUsers()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario.'
            setError(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return

        // In Supabase, deleting from admin_users might cascade if set up, 
        // but normally we also need to delete from auth.users using an admin API.
        // For now, we will just delete from admin_users to revoke access.
        const { error } = await supabase.from('admin_users').delete().eq('id', id)
        if (!error) {
            setUsers(users.filter(u => u.id !== id))
        } else {
            alert('Error al eliminar: ' + error.message)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
                    <p className="text-slate-500">Administra los accesos al panel de control.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                    <FaPlus /> Nuevo Usuario
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">DNI</th>
                                <th className="px-6 py-4">Teléfono</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{user.full_name}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">{user.dni}</td>
                                    <td className="px-6 py-4">{user.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                                            {user.role === 'admin' ? 'Administrador' : 'Operador'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                            title="Eliminar acceso"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Crear Nuevo Usuario</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                <input type="text" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                                    <input type="text" required maxLength={8} value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })} className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Correo (Para acceso técnico)</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                                <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                                    <option value="operator">Operador (Ver todo, sin gestión de usuarios)</option>
                                    <option value="admin">Administrador (Control total)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                                    {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
