import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/telefono-inteligente.png'

function SidebarCliente() {
    const { cerrarSesion } = useAuth()
    const [menuAbierto, setMenuAbierto] = useState(false)

    const links = [
        { to: '/cliente/restaurantes', label: 'Explorar Restaurantes' },
        { to: '/cliente/seguimiento', label: 'Seguimiento de Pedido' },
        { to: '/cliente/historial', label: 'Historial' },
        { to: '/cliente/perfil', label: 'Perfil' },
    ]

    function abrirMenu() {
        setMenuAbierto(true)
    }

    function cerrarMenu() {
        setMenuAbierto(false)
    }

    // Armamos la clase del aside a mano, dependiendo si el menú esta abierto o no
    let claseDelAside = "fixed md:sticky top-0 left-0 z-50 h-screen w-72 md:w-64 shrink-0 bg-slate-800 flex flex-col justify-between py-6 shadow-2xl md:shadow-none transition-transform duration-300 ease-out md:translate-x-0 "

    if (menuAbierto) {
        claseDelAside = claseDelAside + "translate-x-0"
    } else {
        claseDelAside = claseDelAside + "-translate-x-full"
    }

    function estiloDelLink({ isActive }) {
        if (isActive) {
            return "px-4 py-3 rounded-xl text-sm font-medium transition bg-lime-400 text-slate-900"
        } else {
            return "px-4 py-3 rounded-xl text-sm font-medium transition text-slate-200 hover:bg-slate-700"
        }
    }

    return (
        <>
            {/* Barra de arriba, solo se ve en el celular */}
            <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-slate-800 px-4 py-3 shadow-md">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="logo" className="h-8" />
                    <span className="text-lg font-bold text-blue-200">DeUna CR</span>
                </div>
                <button
                    onClick={abrirMenu}
                    className="rounded-lg p-2 text-slate-200 transition hover:bg-slate-700"
                    aria-label="Abrir menú"
                >
                    <Menu size={24} />
                </button>
            </div>

            {menuAbierto === true && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={cerrarMenu}
                />
            )}


            <aside className={claseDelAside}>
                <div>
                    <div className="hidden md:flex justify-center items-center gap-2 px-4">
                        <img src={logo} alt="logo" className="h-10" />
                        <span className="text-xl font-bold text-blue-200">DeUna CR</span>
                    </div>

                    <div className="flex md:hidden items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="logo" className="h-8" />
                            <span className="text-lg font-bold text-blue-200">DeUna CR</span>
                        </div>
                        <button onClick={cerrarMenu} className="rounded-lg p-2 text-slate-200 transition hover:bg-slate-700" aria-label="Cerrar menú">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <nav className="flex flex-col gap-1 px-3">
                        {links.map((link) => {
                            return (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={cerrarMenu}
                                    className={estiloDelLink}
                                >
                                    {link.label}
                                </NavLink>
                            )
                        })}
                    </nav>
                    <button
                        onClick={cerrarSesion}
                        className="mx-3 rounded-xl px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-700"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
        </>
    )
}

export default SidebarCliente