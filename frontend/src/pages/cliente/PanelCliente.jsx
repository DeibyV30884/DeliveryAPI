import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import SidebarCliente from '../../components/SidebarCliente'
import { useAuth } from '../../context/AuthContext'
import { SaldoProvider, useSaldo } from '../../context/SaldoContext'

function SaldoHeader() {
    const { saldo, refrescarSaldo } = useSaldo()

    useEffect(() => {
        refrescarSaldo()
    }, [refrescarSaldo])

    const saldoFormateado = saldo !== null
        ? `₡${Number(saldo).toLocaleString('es-CR')}` : 'Cargando...'

    return (
        <span className="bg-slate-700 text-lime-400 font-semibold px-4 py-1 rounded-full text-sm whitespace-nowrap">
            {saldoFormateado}
        </span>
    )
}

function PanelCliente() {
    const { usuario } = useAuth()

    return (
        <SaldoProvider>
            <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
                <SidebarCliente />

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="bg-slate-800 px-4 md:px-6 py-4 md:py-7 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3 md:gap-4 min-w-0">
                            <span className="text-slate-200 text-sm truncate">Hola, {usuario?.nombre}</span>
                            <SaldoHeader />
                        </div>
                    </header>

                    <main className="flex-1 p-4 md:p-6 min-w-0">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SaldoProvider>
    )
}

export default PanelCliente