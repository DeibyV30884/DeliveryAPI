import { useEffect, useState } from 'react'
import {
    buscarClientesRecarga,
    obtenerHistorialRecargas,
    crearRecargaSaldo
} from '../../api/usuarios'

function RecargarSaldo() {
    const [termino, setTermino] = useState('')
    const [clientes, setClientes] = useState([])
    const [historial, setHistorial] = useState([])
    const [mensaje, setMensaje] = useState('')
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
    const [monto, setMonto] = useState('')
    const [metodoPago, setMetodoPago] = useState('')



    useEffect(() => {
        cargarHistorial()
    }, [])

    async function cargarHistorial() {
        try {
            const respuesta = await obtenerHistorialRecargas()
            setHistorial(respuesta.data ?? [])
        } catch {
            setMensaje('No se pudo cargar el historial de recargas')
        }
    }

    async function buscarClientes() {
        setMensaje('')

        if (!termino.trim()) {
            setMensaje('Digite un nombre o correo para buscar')
            return
        }

        try {
            const respuesta = await buscarClientesRecarga(termino)
            setClientes(respuesta.data ?? [])
        } catch (error) {
            setClientes([])
            setMensaje(
                error.response?.data?.mensaje ??
                'No se pudieron buscar los clientes'
            )
        }
    }

    async function confirmarRecarga() {
        setMensaje('')

        if (!monto || Number(monto) <= 0) {
            setMensaje('Digite un monto válido')
            return
        }

        if (!metodoPago) {
            setMensaje('Seleccione un método de pago')
            return
        }

        try {
            await crearRecargaSaldo({
                clienteId: clienteSeleccionado.clienteId,
                monto: Number(monto),
                metodoPago
            })

            setMensaje('Recarga realizada correctamente')
            setMonto('')
            setMetodoPago('')
            setClienteSeleccionado(null)

            await cargarHistorial()
            await buscarClientes()
        } catch (error) {
            setMensaje(
                error.response?.data?.mensaje ??
                'No se pudo realizar la recarga'
            )
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">
                Recargar Saldo
            </h1>

            <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    Buscar cliente
                </h2>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={termino}
                        onChange={(event) => setTermino(event.target.value)}
                        placeholder="Nombre o correo electrónico"
                        className="flex-1 rounded-lg px-4 py-2 bg-white text-slate-900 outline-none"
                    />

                    <button
                        type="button"
                        onClick={buscarClientes}
                        className="bg-lime-500 hover:bg-lime-400 text-slate-900 font-semibold px-6 py-2 rounded-lg"
                    >
                        Buscar
                    </button>
                </div>

                {mensaje && (
                    <p className="text-yellow-300 mt-4">{mensaje}</p>
                )}

                {clientes.length > 0 && (
                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-200">
                            <thead className="bg-slate-700">
                            <tr>
                                <th className="px-4 py-3">Cliente</th>
                                <th className="px-4 py-3">Cédula</th>
                                <th className="px-4 py-3">Correo</th>
                                <th className="px-4 py-3">Saldo actual</th>
                                <th className="px-4 py-3">Acción</th>
                            </tr>
                            </thead>

                            <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.clienteId} className="border-b border-slate-700">
                                    <td className="px-4 py-3">{cliente.nombreCompleto}</td>
                                    <td className="px-4 py-3">{cliente.cedula}</td>
                                    <td className="px-4 py-3">{cliente.email}</td>
                                    <td className="px-4 py-3">
                                        ₡{Number(cliente.saldo).toLocaleString('es-CR')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => setClienteSeleccionado(cliente)}
                                            className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg"
                                        >
                                            Recargar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {clienteSeleccionado && (
                    <div className="mt-6 bg-slate-700 rounded-xl p-5">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Recargar saldo a {clienteSeleccionado.nombreCompleto}
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-slate-200 mb-1">
                                    Monto
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={monto}
                                    onChange={(event) => setMonto(event.target.value)}
                                    className="w-full rounded-lg px-4 py-2 bg-white text-slate-900 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-200 mb-1">
                                    Método de pago
                                </label>
                                <select
                                    value={metodoPago}
                                    onChange={(event) => setMetodoPago(event.target.value)}
                                    className="w-full rounded-lg px-4 py-2 bg-white text-slate-900 outline-none"
                                >
                                    <option value="">Seleccione</option>
                                    <option value="Sinpe Móvil">Sinpe Móvil</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button
                                type="button"
                                onClick={() => setClienteSeleccionado(null)}
                                className="bg-slate-500 hover:bg-slate-400 text-white px-5 py-2 rounded-lg"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={confirmarRecarga}
                                className="bg-lime-500 hover:bg-lime-400 text-slate-900 font-semibold px-5 py-2 rounded-lg"
                            >
                                Confirmar recarga
                            </button>
                        </div>
                    </div>
                )}

            </div>

            <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white">
                    Historial de recargas
                </h2>

                {historial.length > 0 ? (
                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-200">
                            <thead className="bg-slate-700">
                            <tr>
                                <th className="px-4 py-3">Cliente</th>
                                <th className="px-4 py-3">Realizado por</th>
                                <th className="px-4 py-3">Monto</th>
                                <th className="px-4 py-3">Método de pago</th>
                                <th className="px-4 py-3">Fecha</th>
                            </tr>
                            </thead>

                            <tbody>
                            {historial.map((recarga) => (
                                <tr
                                    key={recarga.recargaId}
                                    className="border-b border-slate-700"
                                >
                                    <td className="px-4 py-3">{recarga.cliente}</td>
                                    <td className="px-4 py-3">{recarga.realizadoPor}</td>
                                    <td className="px-4 py-3">
                                        ₡{Number(recarga.monto).toLocaleString('es-CR')}
                                    </td>
                                    <td className="px-4 py-3">{recarga.metodoPago}</td>
                                    <td className="px-4 py-3">
                                        {new Date(recarga.fecha).toLocaleString('es-CR')}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-slate-300 mt-4">
                        No hay recargas registradas
                    </p>
                )}
            </div>
        </div>
    )
}

export default RecargarSaldo