import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { rutasPorRol } from '../utils/rutasPorRol'

function RutaProtegida({ rolesPermitidos, children }) {
    const { usuario } = useAuth()

    // Caso 1: no hay sesión iniciada: al login
    if (!usuario) {
        return <Navigate to="/" replace />
    }

    // Caso 2: hay sesión, pero el rol no tiene permiso aquí: a SU panel correcto
    if (!rolesPermitidos.includes(usuario.rol)) {
        return <Navigate to={rutasPorRol[usuario.rol] ?? '/'} replace />
    }

    // Caso 3: todo bien, nuestra la pantalla real
    return children
}

export default RutaProtegida