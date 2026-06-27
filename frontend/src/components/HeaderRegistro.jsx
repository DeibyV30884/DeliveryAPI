import { Link } from 'react-router-dom'
import logo from '../assets/telefono-inteligente.png'

function HeaderRegistro() {
    return (
        <header className="bg-slate-700 py-4 px-6 relative flex items-center justify-center">
            <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-blue-200">DeUna CR</span>
                <img src={logo} alt="" className="h-13" />
            </div>

            <Link
                to="/"
                className="absolute right-6 border border-white text-white rounded-full px-6 py-2 hover:bg-white hover:text-slate-700 transition-colors whitespace-nowrap"
            >
                Iniciar Sesión
            </Link>
        </header>
    )
}

export default HeaderRegistro