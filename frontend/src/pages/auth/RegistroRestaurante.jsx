import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registrarRestaurante } from '../../api/usuarios'
import HeaderRegistro from '../../components/HeaderRegistro.jsx'

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

function Toggle({ checked, onChange }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-400 rounded-full peer-checked:bg-lime-400 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
        </label>
    )
}

function RegistroRestaurante() {
    const [formData, setFormData] = useState({
        nombreRestaurante: '',
        cedulaJuridica: '',
        telefono: '',
        direccion: '',
        linkGoogleMaps: '',
        email: '',
        password: '',
        confirmarPassword: '',
        aceptaComision: false,
    })

    const [horarios, setHorarios] = useState(
        DIAS_SEMANA.map((dia) => ({
            dia,
            abierto: dia !== 'Domingo',
            horaApertura: '',
            horaCierre: '',
        }))
    )

    const [errores, setErrores] = useState([])
    const [registroExitoso, setRegistroExitoso] = useState(false)

    function handleChange(event) {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    function handleToggleComision() {
        setFormData((prev) => ({ ...prev, aceptaComision: !prev.aceptaComision }))
    }

    function handleToggleDia(dia) {
        setHorarios((prev) =>
            prev.map((h) => (h.dia === dia ? { ...h, abierto: !h.abierto } : h))
        )
    }

    function handleHorarioChange(dia, campo, valor) {
        setHorarios((prev) =>
            prev.map((h) => (h.dia === dia ? { ...h, [campo]: valor } : h))
        )
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setErrores([])

        if (formData.password !== formData.confirmarPassword) {
            setErrores(['Las contraseñas no coinciden'])
            return
        }

        if (!formData.aceptaComision) {
            setErrores(['Tiene que aceptar la comisión del 5% para poder registrar su restaurante'])
            return
        }

        const payload = {
            nombreRestaurante: formData.nombreRestaurante,
            cedulaJuridica: formData.cedulaJuridica,
            telefono: formData.telefono,
            direccion: formData.direccion,
            linkGoogleMaps: formData.linkGoogleMaps,
            aceptaComision: formData.aceptaComision,
            email: formData.email,
            password: formData.password,
            horarios: horarios.map((h) => ({
                dia: h.dia,
                abierto: h.abierto,
                horaApertura: h.abierto && h.horaApertura ? `${h.horaApertura}:00` : null,
                horaCierre: h.abierto && h.horaCierre ? `${h.horaCierre}:00` : null,
            })),
        }

        try {
            await registrarRestaurante(payload)
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
                <div className="bg-slate-700 rounded-2xl p-8 w-full max-w-lg text-center">
                    <h1 className="text-7xl font-bold text-lime-400 mb-4">¡Registro exitoso!</h1>
                    <p className="text-white mb-6">Tu restaurante fue registrado correctamente.</p>
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
            <div className="flex-1 flex items-center justify-center px-4 py-10">
                <div className="bg-slate-700 rounded-2xl p-8 w-full max-w-6xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-lime-400 text-center mb-1">
                        Formulario de Registro
                    </h1>
                    <p className="text-white text-center mb-6">
                        Registro de Restaurante, unete a la red de Costa Rica
                    </p>

                    {errores.length > 0 && (
                        <ul className="bg-red-100 text-red-800 rounded-lg p-3 mb-4 text-sm list-disc list-inside">
                            {errores.map((mensaje, index) => (
                                <li key={index}>{mensaje}</li>
                            ))}
                        </ul>
                    )}

                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                        {/* Columna izquierda */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-white font-semibold mb-2">Información del Negocio</h2>
                                <div className="flex flex-col gap-3">
                                    <input
                                        name="nombreRestaurante"
                                        placeholder="Nombre del Restaurante/Negocio"
                                        value={formData.nombreRestaurante}
                                        onChange={handleChange}
                                        className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                    />

                                    <div className="flex items-center gap-3 text-white text-sm">
                                        <span>¿Acepta Comisión del 5% por pedido vendido?</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white">
                                        <span>No</span>
                                        <Toggle checked={formData.aceptaComision} onChange={handleToggleComision} />
                                        <span>Sí</span>
                                    </div>

                                    <input
                                        name="cedulaJuridica"
                                        placeholder="Cédula Jurídica"
                                        value={formData.cedulaJuridica}
                                        onChange={handleChange}
                                        className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                    />
                                    <input
                                        name="telefono"
                                        placeholder="Teléfono del Negocio"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-white font-semibold mb-2">Horario de Operación</h2>
                                <div className="flex flex-col gap-2">
                                    {horarios.map((h) => (
                                        <div key={h.dia} className="flex items-center gap-3 text-white text-sm">
                                            <span className="w-20 shrink-0">{h.dia}:</span>
                                            <Toggle checked={h.abierto} onChange={() => handleToggleDia(h.dia)} />
                                            <span className="w-14 shrink-0">{h.abierto ? 'Abierto' : 'Cerrado'}</span>
                                            <input
                                                type="time"
                                                disabled={!h.abierto}
                                                value={h.horaApertura}
                                                onChange={(e) => handleHorarioChange(h.dia, 'horaApertura', e.target.value)}
                                                className="rounded-full px-2 py-1 outline-none bg-white text-slate-900 text-xs disabled:opacity-40"
                                            />
                                            <span>a</span>
                                            <input
                                                type="time"
                                                disabled={!h.abierto}
                                                value={h.horaCierre}
                                                onChange={(e) => handleHorarioChange(h.dia, 'horaCierre', e.target.value)}
                                                className="rounded-full px-2 py-1 outline-none bg-white text-slate-900 text-xs disabled:opacity-40"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-white font-semibold mb-2">Ubicación</h2>
                                <div className="flex flex-col gap-3">
                                    <input
                                        name="direccion"
                                        placeholder="Dirección"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                    />
                                    <input
                                        name="linkGoogleMaps"
                                        placeholder="Link de Google Maps"
                                        value={formData.linkGoogleMaps}
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
                                        placeholder="Correo Electrónico"
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
                                        placeholder="Confirmar Contraseña"
                                        value={formData.confirmarPassword}
                                        onChange={handleChange}
                                        className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="md:col-span-2 border border-white text-white rounded-full py-2 mt-2 hover:bg-white hover:text-slate-700 transition"
                        >
                            Registrarme
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegistroRestaurante