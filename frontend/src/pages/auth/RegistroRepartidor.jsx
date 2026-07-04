import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { registrarRepartidor, obtenerRestaurantes } from '../../api/usuarios'
import HeaderRegistro from '../../components/HeaderRegistro.jsx'

function RegistroRepartidor() {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmarPassword: '',
        telefono: '',
        cedula: '',
        restauranteId: '',
    })
    const [restaurantes, setRestaurantes] = useState([])
    const [errores, setErrores] = useState([])
    const [registroExitoso, setRegistroExitoso] = useState(false)

    useEffect(() => {
        obtenerRestaurantes()
            .then((res) => setRestaurantes(res.data))
            .catch(() => setErrores(['No se pudieron cargar los restaurantes']))
    }, [])

    function handleChange(event) {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setErrores([])

        if (formData.password !== formData.confirmarPassword) {
            setErrores(['Las contraseñas no coinciden'])
            return
        }

        try {
            const payload = { ...formData, restauranteId: parseInt(formData.restauranteId) }
            await registrarRepartidor(payload)
            setRegistroExitoso(true)
        } catch (error) {
            const datosError = error.response?.data
            if (datosError?.errors) {
                setErrores(Object.values(datosError.errors).flat())
            } else if (datosError?.mensaje) {
                setErrores([datosError.mensaje])
            } else {
                setErrores(['Ocurrió un error al registrar. Intente de nuevo.'])
            }
        }
    }

    if (registroExitoso) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                <div className="bg-slate-700 rounded-2xl p-8 w-full max-w-md text-center">
                    <h1 className="text-2xl font-bold text-lime-400 mb-4">¡Registro exitoso!</h1>
                    <p className="text-white mb-6">Tu cuenta de repartidor fue creada correctamente.</p>
                    <Link to="/" className="text-yellow-400 font-semibold">
                        Ir a iniciar sesión
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <HeaderRegistro />
            <div className="flex-1 flex bg-slate-900 items-center justify-center px-4 py-10">
                <div className="bg-slate-700 rounded-2xl p-8 w-full max-w-2xl">
                    <h1 className="text-7xl font-bold text-lime-400 text-center mb-1">
                        Formulario de Registro
                    </h1>
                    <p className="text-white text-center mb-6">Registro de Repartidor</p>

                    {errores.length > 0 && (
                        <ul className="bg-red-100 text-red-800 rounded-lg p-3 mb-4 text-sm list-disc list-inside">
                            {errores.map((mensaje, index) => (
                                <li key={index}>{mensaje}</li>
                            ))}
                        </ul>
                    )}

                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-white font-semibold mb-2">Información Personal</h2>
                            <div className="flex flex-col gap-3">
                                <input
                                    name="nombre"
                                    placeholder="Nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                                <input
                                    name="apellido"
                                    placeholder="Apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                                <input
                                    name="telefono"
                                    placeholder="Teléfono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                                <input
                                    name="cedula"
                                    placeholder="Cédula"
                                    value={formData.cedula}
                                    onChange={handleChange}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                                <div className="relative w-full">
                                    <select
                                        name="restauranteId"
                                        value={formData.restauranteId}
                                        onChange={handleChange}
                                        className="w-full rounded-full px-4 py-2 pr-10 outline-none bg-white text-slate-900 appearance-none"
                                    >
                                        <option value="">Selecciona un restaurante</option>
                                        {restaurantes.map((r) => (
                                            <option key={r.restauranteId} value={r.restauranteId}>
                                                {r.nombreRestaurante}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                         <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                         </svg>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-white font-semibold mb-2">Datos de Acceso</h2>
                            <div className="flex flex-col gap-3">
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Contraseña"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                                <input
                                    name="confirmarPassword"
                                    type="password"
                                    placeholder="Confirmar contraseña"
                                    value={formData.confirmarPassword}
                                    onChange={handleChange}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="md:col-span-2 border border-white text-white rounded-full py-2 mt-2 hover:bg-white hover:text-slate-700 transition"
                        >
                            Registrarse
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegistroRepartidor