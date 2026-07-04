import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/telefono-inteligente.png'

function SidebarRestaurante() {
    const { cerrarSesion } = useAuth()

    const links = [
        { to: '/restaurante/pedidos', label: 'Pedidos Entrantes' },
        { to: '/restaurante/gestionporducto', label: 'Gestión de producto' },
        { to: '/restaurante/repartidores', label: 'Mapa de repartidores' },
        { to: '/restaurante/perfil', label: 'Perfil' },
    ]

    return (

        <aside className="w-56 min-h-screen bg-slate-800 flex flex-col justify-between py-6">

            <div className="flex justify-center items-center gap-2 px-4">
                <img src={logo} alt="logo" className="h-10" />
                <span className="text-xl font-bold text-blue-200">DeUna CR</span>
            </div>

            <div className="flex flex-col gap-1">
            <nav className="flex flex-col gap-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `px-6 py-4 text-sm font-medium transition ${
                                isActive 
                                    ? 'bg-slate-600 text-lime-400'  : 'text-slate-200 hover:bg-slate-700'
                            }`
                        }
                    >
                        {link.label}
                    </NavLink>

                ))}
            </nav>
            <button onClick={cerrarSesion}
                    className=" px-6 py-4 text-sm text-slate-200 hover:bg-slate-700 rounded transition text-left">
                Cerrar Sesión
            </button>
            </div>
        </aside>
    )
}

export default SidebarRestaurante