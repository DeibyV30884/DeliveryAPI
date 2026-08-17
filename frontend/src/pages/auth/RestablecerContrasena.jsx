import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { restablecerContrasena } from '../../api/usuarios'
import Header from '../../components/Header'

function RestablecerContrasena() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [error, setError] = useState('')
    const [exito, setExito] = useState(false)
    const [cargando, setCargando] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')

        if (password !== confirmar) {
            setError('Las contraseñas no coinciden')
            return
        }
        if (!token) {
            setError('El enlace no es válido')
            return
        }

        setCargando(true)
        try {
            await restablecerContrasena(token, password)
            setExito(true)
            setTimeout(() => navigate('/login'), 2500)
        } catch (err) {
            const mensaje = err.response?.data?.mensaje
            setError(mensaje ?? 'El enlace no es válido o ha expirado')
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
                        Nueva Contraseña
                    </h1>

                    {error && (
                        <p className="bg-red-100 text-red-800 rounded-lg px-4 py-2 text-sm mb-4 mt-4">
                            {error}
                        </p>
                    )}

                    {exito ? (
                        <p className="bg-lime-100 text-slate-900 rounded-lg px-4 py-3 text-sm text-center mt-4">
                            Contraseña actualizada. Redirigiendo al inicio de sesión...
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                            <div>
                                <label htmlFor="password" className="block text-white mb-1">
                                    Nueva Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmar" className="block text-white mb-1">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    id="confirmar"
                                    type="password"
                                    required
                                    value={confirmar}
                                    onChange={(e) => setConfirmar(e.target.value)}
                                    className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                className="border border-white text-white rounded-full py-2 mt-2 hover:bg-white hover:text-slate-700 transition disabled:opacity-50">
                                {cargando ? 'Guardando...' : 'Restablecer Contraseña'}
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

export default RestablecerContrasena