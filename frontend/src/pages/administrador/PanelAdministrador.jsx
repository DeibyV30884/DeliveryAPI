import { Outlet } from 'react-router-dom'
import SidebarAdministrador from '../../components/SidebarAdministrador.jsx'
import { useAuth } from '../../context/AuthContext'

function PanelAdministrador() {
    const { usuario } = useAuth()

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
            <SidebarAdministrador/>
            <div className="flex-1 flex flex-col">
                <header className="bg-slate-800 px-6 py-7 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-200 text-sm">Hola, {usuario?.nombre}</span>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default PanelAdministrador