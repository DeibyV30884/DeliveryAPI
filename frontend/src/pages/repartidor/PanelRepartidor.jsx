import { Outlet } from 'react-router-dom'
import SidebarRepartidor from '../../components/SidebarRepartidor'
import { useAuth } from '../../context/AuthContext'


function PanelRepartidor() {
    const { usuario } = useAuth()

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
            <SidebarRepartidor/>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-slate-800 px-4 md:px-6 py-4 md:py-7 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <span className="text-slate-200 text-sm truncate">Hola, {usuario?.nombre}</span>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default PanelRepartidor