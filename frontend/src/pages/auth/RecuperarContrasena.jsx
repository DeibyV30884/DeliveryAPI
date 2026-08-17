import { useState } from 'react'
import { Link } from 'react-router-dom'
import { solicitarRecuperacionContrasena } from '../../api/usuarios'
import Header from '../../components/Header'

function RecuperarContrasena() {
    const [email, setEmail] = useState('')
    const [enviado, setEnviado] = useState(false)
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setCargando(true)
        try {
            await solicitarRecuperacionContrasena(email)
            setEnviado(true)
        } catch (err) {
            const mensaje = err.response?.data?.mensaje
            setError(mensaje ?? 'Hubo error, intente de nuevo')
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center px-5 py-8">
                <div className="bg-slate-700 rounded-2xl p-8 w-full max-w-lg">
                    <h1 className="text-4xl font-bold text-lime-400 text-center mb-1">
                        Recuperar Contraseña
                    </h1>
                    <p className="text-white text-center mb-6">
                        Ingrese su correo y para enviarle un enlace para restablecerla
                    </p>

                    {error && (
                        <p className="bg-red-100 text-red-800 rounded-lg px-4 py-2 text-sm mb-4">
                            {error}
                        </p>
                    )}

                    {enviado ? (
                        <p className="bg-lime-100 text-slate-900 rounded-lg px-4 py-3 text-sm text-center">
                            Si el correo está registrado, recibirá un enlace de recuperación.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="email" className="block text-white mb-1">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                className="border border-white text-white rounded-full py-2 mt-2 hover:bg-white hover:text-slate-700 transition disabled:opacity-50">
                                {cargando ? 'Enviando...' : 'Enviar enlace'}
                            </button>
                        </form>
                    )}

                    <p className="text-slate-200 text-center mt-6">
                        <Link to="/login" className="text-yellow-400 font-semibold">Volver a Iniciar Sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RecuperarContrasena