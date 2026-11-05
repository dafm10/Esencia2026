import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { FaArrowLeft, FaSave, FaSpinner } from 'react-icons/fa'

export default function UserDetail() {
    const { id } = useParams<{ id: string }>()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        role: 'operator',
        dni: '',
        email: ''
    })

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error("Error fetching user:", error)
                setError('Error al cargar la información del usuario.')
            } else if (data) {
                setFormData({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    role: data.role || 'operator',
                    dni: data.dni || '',
                    email: data.email || ''
                })
            }
            setLoading(false)
        }
        
        fetchUser()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return
        
        setSaving(true)
        setError(null)
        setSuccess(false)
        
        const { data, error } = await supabase
            .from('admin_users')
            .update({
                full_name: formData.full_name,
                phone: formData.phone,
                role: formData.role
            })
            .eq('id', id)
            .select()

        if (error) {
            setError('Error al actualizar el usuario: ' + error.message)
        } else if (!data || data.length === 0) {
            setError('No se guardó el cambio: no tienes permisos para modificar este usuario.')
        } else {
            setSuccess(true)
        }
        setSaving(false)
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando usuario...</div>

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link to="/admin/users" className="text-slate-500 hover:text-brand-600 transition-colors">
                    <FaArrowLeft className="text-xl" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editar Usuario</h1>
                    <p className="text-slate-500">Actualiza la información y permisos del usuario.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
                {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}
                {success && <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">¡Usuario actualizado con éxito!</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.full_name} 
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })} 
                                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                            <input 
                                type="text" 
                                value={formData.phone} 
                                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">DNI (No editable)</label>
                            <input 
                                type="text" 
                                value={formData.dni} 
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico (No editable)</label>
                            <input 
                                type="email" 
                                value={formData.email} 
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-500 outline-none" 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                            <select 
                                value={formData.role} 
                                onChange={e => setFormData({ ...formData, role: e.target.value })} 
                                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            >
                                <option value="operator">Operador (Ver todo, sin gestión de usuarios)</option>
                                <option value="admin">Administrador (Control total)</option>
                            </select>
                            <p className="mt-1.5 text-xs text-slate-500">
                                Los administradores pueden crear, editar y eliminar usuarios. Los operadores sólo pueden gestionar registros y órdenes.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <Link 
                            to="/admin/users" 
                            className="px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
                        >
                            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
