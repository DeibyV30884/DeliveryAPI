import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SidebarCliente from '../../components/SidebarCliente'
import { useAuth } from '../../context/AuthContext'
import { obtenerSaldoCliente } from '../../api/usuarios'

function PanelCliente() {
    const { usuario } = useAuth()
    const [saldo, setSaldo] = useState(null)

    useEffect(() => {
        obtenerSaldoCliente()
            .then( (res) => setSaldo(res.data.saldo))
            .catch(() => setSaldo(0))
    }, [])

    const saldoFormateado = saldo !== null
        ? `₡${Number(saldo).toLocaleString('es-CR')}` : 'Cargando...'

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <SidebarCliente />
            <div className="flex-1 flex flex-col">
                <header className="bg-slate-800 px-6 py-7 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-200 text-sm">Hola, {usuario?.nombre}</span>
                        <span className="bg-slate-700 text-lime-400 font-semibold px-4 py-1 rounded-full text-sm">

                            {saldoFormateado}
                        </span>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default PanelCliente