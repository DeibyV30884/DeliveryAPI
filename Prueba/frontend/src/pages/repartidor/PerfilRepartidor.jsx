import { useState, useEffect } from 'react'
import { obtenerPerfilRepartidor, editarPerfilRepartidor, desactivarPerfilRepartidor } from '../../api/usuarios'
import { useAuth } from '../../context/AuthContext'

function PerfilRepartidor() {
    const { cerrarSesion } = useAuth()


    const [perfil, setPerfil] = useState(null)

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        password: '',
    })

    const [error, setError] = useState('')
    const [exito, setExito] = useState('')
    const [cargando, setCargando] = useState(true)


    useEffect(() => {
        obtenerPerfilRepartidor()
            .then(function (res) {
                const d = res.data
                setPerfil(d)

                let nombreValor = ''
                if (d.nombre) {
                    nombreValor = d.nombre
                }

                let apellidoValor = ''
                if (d.apellido) {
                    apellidoValor = d.apellido
                }

                let telefonoValor = ''
                if (d.telefono) {
                    telefonoValor = d.telefono
                }

                let emailValor = ''
                if (d.email) {
                    emailValor = d.email
                }

                setFormData({
                    nombre: nombreValor,
                    apellido: apellidoValor,
                    telefono: telefonoValor,
                    email: emailValor,
                    password: '',
                })
            })
            .catch(function () {
                setError('No se pudo cargar el perfil')
            })
            .finally(function () {
                setCargando(false)
            })
    }, [])

    function handleChange(e) {
        const nombreCampo = e.target.name
        const valorCampo = e.target.value

        setFormData(function (prev) {
            const copia = { ...prev }
            copia[nombreCampo] = valorCampo
            return copia
        })
    }

    async function handleGuardar() {
        setError('')
        setExito('')

        const payload = { ...formData }
        if (!payload.password || payload.password.trim() === '') {
            delete payload.password
        }

        try {
            await editarPerfilRepartidor(payload)
            setExito('Perfil actualizado correctamente' )

            const res = await obtenerPerfilRepartidor()
            const d = res.data
            setPerfil(d)
        } catch (err) {
            let mensaje = 'Error al guardar los cambios'
            if (err.response && err.response.data && err.response.data.mensaje) {
                mensaje = err.response.data.mensaje
            }
            setError(mensaje)
        }
    }

    async function handleEliminar() {
        const confirmar = confirm('¿Estás seguro que quiere eliminar su perfil? Esta acción no se puede deshacer.')
        if (!confirmar) {
            return
        }

        try {
            await desactivarPerfilRepartidor()
            cerrarSesion()
        } catch (err) {
            let mensaje = 'Error al eliminar el perfil'
            if (err.response && err.response.data && err.response.data.mensaje) {
                mensaje = err.response.data.mensaje
            }
            setError(mensaje)
        }
    }

    if (cargando) {
        return <p className="text-white">Cargando perfil...</p>
    }

    return (
        <div className="bg-slate-700 rounded-2xl p-6 w-full">
            <h1 className="text-4xl font-bold text-lime-400 mb-6">MI PERFIL</h1>

            {error && <p className="bg-red-100 text-red-800 rounded-lg px-4 py-2 text-sm mb-4">{error}</p>}
            {exito && <p className="bg-green-100 text-green-800 rounded-lg px-4 py-2 text-sm mb-4">{exito}</p>}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Columna izquierda */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-white font-bold tracking-wide">INFORMACIÓN PERSONAL</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-300 text-xs mb-1 block">Nombre</label>
                            <input name="nombre" value={formData.nombre} onChange={handleChange}
                                   className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-xs mb-1 block">Apellidos</label>
                            <input name="apellido" value={formData.apellido} onChange={handleChange}
                                   className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Teléfono</label>
                        <input name="telefono" value={formData.telefono} onChange={handleChange}
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                    <div>

                        <label className="text-slate-300 text-xs mb-1 block">Cédula</label>
                        <input value={perfil ? perfil.cedula : ''} disabled
                               className="w-full rounded-full px-4 py-2 outline-none bg-slate-500 text-slate-300 text-sm cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Restaurante asociado</label>
                        <input value={perfil ? perfil.restauranteNombre : ''} disabled
                               className="w-full rounded-full px-4 py-2 outline-none bg-slate-500 text-slate-300 text-sm cursor-not-allowed" />
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="flex flex-col gap-4">

                    <h2 className="text-white font-bold tracking-wide">DATOS DE ACCESO</h2>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Correo Electrónico</label>
                        <input name="email" value={formData.email} onChange={handleChange}
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Nueva Contraseña (opcional)</label>
                        <input name="password" type="password" autoComplete="new-password" value={formData.password} onChange={handleChange}
                               placeholder="Dejar vacío para no cambiar"
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-6">
                <button onClick={handleEliminar}
                        className="border border-white text-white rounded-full px-6 py-2 text-sm hover:bg-red-600 hover:border-red-600 transition">
                    Eliminar Perfil
                </button>
                <button onClick={handleGuardar}
                        className="border border-white text-white rounded-full px-6 py-2 text-sm hover:bg-white hover:text-slate-700 transition">
                    Guardar Cambios
                </button>
            </div>

        </div>
    )
}


export default PerfilRepartidor