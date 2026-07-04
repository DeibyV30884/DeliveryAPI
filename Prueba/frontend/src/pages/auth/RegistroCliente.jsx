import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registrarCliente } from '../../api/usuarios'
import HeaderRegistro from "../../components/HeaderRegistro.jsx";

function RegistroCliente() {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmarPassword: '',
        telefono: '',
        cedula: '',
    })
    const [errores, setErrores] = useState([])
    const [registroExitoso, setRegistroExitoso] = useState(false)

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
            await registrarCliente(formData)
            setRegistroExitoso(true)
        } catch (error) {
            const datosError = error.response?.data
            if (datosError?.errors) {
                setErrores(Object.values(datosError.errors).flat())
            } else if (datosError?.mensaje) {
                setErrores([datosError.mensaje])
            } else {
                setErrores(['Ocurrió un error al registrar. Intenta de nuevo.'])
            }
        }
    }

    if (registroExitoso) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                <div className="bg-slate-700 rounded-2xl p-8 w-full max-w-md text-center">
                    <h1 className="text-2xl font-bold text-lime-400 mb-4">¡Registro exitoso!</h1>
                    <p className="text-white mb-6">Tu cuenta de cliente fue creada correctamente.</p>
                    <Link to="/" className="text-yellow-400 font-semibold">
                        Ir a iniciar sesión
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <HeaderRegistro/>
        <div className=" flex-1 flex bg-slate-900 items-center justify-center px-4 py-10">
            <div className="bg-slate-700 rounded-2xl p-8 w-full max-w-2xl">
                <h1 className="text-7xl font-bold text-lime-400 text-center mb-1">
                    Formulario de Registro
                </h1>
                <p className="text-white text-center mb-6">Registro de Cliente</p>

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

export default RegistroCliente