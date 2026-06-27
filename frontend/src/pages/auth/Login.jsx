import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../api/usuarios'
import { rutasPorRol } from '../../utils/rutasPorRol'
import Header from '../../components/Header'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { iniciarSesion } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        try {
            const respuesta = await login({ email, password })
            iniciarSesion(respuesta.data)
            navigate(rutasPorRol[respuesta.data.rol] ?? '/')
        } catch (err) {
            const mensaje = err.response?.data?.mensaje
            setError(mensaje ?? 'Correo o contraseña incorrectos')
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header/>
            <div className="flex-1 flex items-center justify-center px-5 py-8">
                <div className="bg-slate-700 rounded-2xl p-8 w-full max-w-lg">
                    <h1 className="text-7xl font-bold text-lime-400 text-center mb-1">
                        Iniciar Sesión
                    </h1>

                    <p className="text-white text-center mb-6">Bienvenido de nuevo</p>

                    {error && (
                        <p className="bg-red-100 text-red-800 rounded-lg px-4 py-2 text-sm">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="email" className="block text-white mb-1 mt-4">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-white mb-1">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900"
                            />
                        </div>

                        <a href="#" className="text-slate-200 font-semibold text-sm hover:underline">
                            ¿Olvidaste tu contraseña?
                        </a>

                        <button
                            type="submit"
                            className="border border-white text-white rounded-full py-2 mt-2 hover:bg-white hover:text-slate-700 transition">
                            Iniciar Sesión
                        </button>
                    </form>

                    <p className="text-slate-200 text-center mt-6">
                        ¿Eres un nuevo usuario?{' '}
                        <Link to="/registro/cliente" className="text-yellow-400 font-semibold">Regístrate</Link>
                    </p>

                    <p className="text-slate-200 text-center mt-6">
                        <Link to="/registro/restaurante" className="text-yellow-400 font-semibold">Asocia Tu Restaurante</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login