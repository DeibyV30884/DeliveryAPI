import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import {
    buscarClientesRecarga,
    obtenerHistorialRecargas,
    crearRecargaSaldo
} from '../../api/usuarios'
import PaginacionProductos from '../../components/PaginacionProductos'

const HISTORIAL_POR_PAGINA = 10

function RecargarSaldo() {
    const [termino, setTermino] = useState('')
    const [clientes, setClientes] = useState([])
    const [historial, setHistorial] = useState([])
    const [mensaje, setMensaje] = useState('')
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
    const [monto, setMonto] = useState('')
    const [metodoPago, setMetodoPago] = useState('')
    const [paginaHistorial, setPaginaHistorial] = useState(1)

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
            setClientes([])
            setClienteSeleccionado(null)
            setMensaje('Digite un nombre o correo para buscar')
            return
        }

        try {
            const respuesta = await buscarClientesRecarga(termino)
            const resultados = respuesta.data ?? []

            setClientes(resultados)
            setClienteSeleccionado(null)
            setMonto('')
            setMetodoPago('')

            if (resultados.length === 0) {
                setMensaje('No se encontraron clientes')
            }
        } catch (error) {
            setClientes([])
            setClienteSeleccionado(null)
            setMensaje(
                error.response?.data?.mensaje ??
                'No se pudieron buscar los clientes'
            )
        }
    }

    async function confirmarRecarga() {
        setMensaje('')

        if (!clienteSeleccionado) {
            setMensaje('Seleccione un cliente')
            return
        }

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

    function cancelarRecarga() {
        setClienteSeleccionado(null)
        setMonto('')
        setMetodoPago('')
        setMensaje('')
    }

    const totalRecargas = historial.length
    const totalPaginasHistorial = Math.max(
        1,
        Math.ceil(totalRecargas / HISTORIAL_POR_PAGINA)
    )
    const historialPagina = historial.slice(
        (paginaHistorial - 1) * HISTORIAL_POR_PAGINA,
        paginaHistorial * HISTORIAL_POR_PAGINA
    )

    return (
        <section className="mx-auto w-full max-w-7xl text-white">
            <div className="mb-6">
                <h1 className="text-4xl font-extrabold text-lime-400 md:text-5xl">
                    Recargas de Saldo
                </h1>

                <p className="mt-2 text-sm uppercase tracking-wide text-slate-300">
                    Administrador
                </p>
            </div>

            <div className="mb-7 rounded-2xl bg-slate-800 p-6 shadow-xl md:p-8">
                <h2 className="mb-5 text-xl font-bold uppercase text-white">
                    Buscar cliente
                </h2>

                <form
                    className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-700 p-5 lg:flex-row lg:items-end"
                    onSubmit={(event) => {
                        event.preventDefault()
                        buscarClientes()
                    }}
                >
                    <div className="flex-1">
                        <label
                            htmlFor="buscar-cliente"
                            className="mb-2 block text-sm font-semibold text-slate-200"
                        >
                            Nombre o correo electrónico
                        </label>

                        <div className="relative">
                            <input
                                id="buscar-cliente"
                                type="text"
                                value={termino}
                                onChange={(event) => {
                                    const valor = event.target.value
                                    setTermino(valor)

                                    if (!valor.trim()) {
                                        setMensaje('')
                                        setClientes([])
                                        setClienteSeleccionado(null)
                                        setMonto('')
                                        setMetodoPago('')
                                    }
                                }}
                                placeholder="Nombre, apellido, cédula o correo"
                                className="w-full rounded-xl border border-slate-500 bg-slate-800 py-3 pl-5 pr-12 text-white outline-none transition placeholder:text-slate-400 focus:border-lime-400"
                            />

                            <Search
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                                size={20}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="rounded-xl bg-lime-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-lime-400"
                    >
                        Buscar
                    </button>
                </form>

                {mensaje && (
                    <div className="mb-6 rounded-xl border border-amber-400 bg-amber-500/20 p-4 text-amber-100">
                        {mensaje}
                    </div>
                )}

                {clientes.length > 0 && (
                    <div className="mb-2 overflow-x-auto rounded-2xl border border-slate-700">
                        <table className="w-full border-collapse min-w-[720px]">
                            <thead className="bg-slate-100 text-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                <th className="px-4 py-3 text-left font-medium">Cédula</th>
                                <th className="px-4 py-3 text-left font-medium">Correo</th>
                                <th className="px-4 py-3 text-center font-medium">Saldo actual</th>
                                <th className="px-4 py-3 text-center font-medium">Acción</th>
                            </tr>
                            </thead>

                            <tbody className="bg-slate-700 text-white">
                            {clientes.map((cliente) => (
                                <tr
                                    key={cliente.clienteId}
                                    className="border-t border-slate-600"
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {cliente.nombreCompleto}
                                    </td>

                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {cliente.cedula}
                                    </td>

                                    <td className="px-4 py-3">
                                        {cliente.email}
                                    </td>

                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                        ₡{Number(cliente.saldo).toLocaleString('es-CR')}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setClienteSeleccionado(cliente)
                                                    setMonto('')
                                                    setMetodoPago('')
                                                    setMensaje('')
                                                }}
                                                className="rounded-full border border-slate-400 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-400"
                                            >
                                                Recargar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {clienteSeleccionado && (
                    <div className="mt-6 rounded-2xl border border-slate-600 bg-slate-700 p-5">
                        <h2 className="mb-4 text-lg font-semibold text-white">
                            Recargar saldo a {clienteSeleccionado.nombreCompleto}
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200">
                                    Monto
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={monto}
                                    onChange={(event) => setMonto(event.target.value)}
                                    className="w-full rounded-xl border border-slate-500 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-lime-400"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200">
                                    Método de pago
                                </label>

                                <select
                                    value={metodoPago}
                                    onChange={(event) => setMetodoPago(event.target.value)}
                                    className="w-full rounded-xl border border-slate-500 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-lime-400"
                                >
                                    <option value="">Seleccione</option>
                                    <option value="Sinpe Móvil">Sinpe Móvil</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                onClick={cancelarRecarga}
                                className="rounded-xl bg-slate-600 px-5 py-2 font-semibold text-white transition hover:bg-slate-500"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={confirmarRecarga}
                                className="rounded-xl bg-lime-500 px-5 py-2 font-semibold text-slate-900 transition hover:bg-lime-400"
                            >
                                Confirmar recarga
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-2xl bg-slate-800 p-6 shadow-xl md:p-8">
                <h2 className="mb-5 text-xl font-bold uppercase text-white">
                    Historial de recargas
                </h2>

                {historial.length === 0 ? (
                    <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-10 text-center text-slate-200">
                        No hay recargas registradas.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-2xl border border-slate-700">
                            <table className="w-full border-collapse min-w-[820px]">
                                <thead className="bg-slate-100 text-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                    <th className="px-4 py-3 text-left font-medium">Realizado por</th>
                                    <th className="px-4 py-3 text-center font-medium">Monto</th>
                                    <th className="px-4 py-3 text-center font-medium">Método de pago</th>
                                    <th className="px-4 py-3 text-center font-medium">Fecha</th>
                                </tr>
                                </thead>

                                <tbody className="bg-slate-700 text-white">
                                {historialPagina.map((recarga) => (
                                    <tr
                                        key={recarga.recargaId}
                                        className="border-t border-slate-600"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {recarga.cliente}
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {recarga.realizadoPor}
                                        </td>

                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            ₡{Number(recarga.monto).toLocaleString('es-CR')}
                                        </td>

                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            {recarga.metodoPago}
                                        </td>

                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            {new Date(recarga.fecha).toLocaleString('es-CR')}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <PaginacionProductos
                            pagina={paginaHistorial}
                            totalPaginas={totalPaginasHistorial}
                            total={totalRecargas}
                            onCambiarPagina={setPaginaHistorial}
                        />
                    </>
                )}
            </div>
        </section>
    )
}

export default RecargarSaldo