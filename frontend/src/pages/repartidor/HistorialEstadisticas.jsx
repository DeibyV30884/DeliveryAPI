import { useCallback, useEffect, useState } from 'react'
import {
    CalendarDays,
    PackageCheck,
    RefreshCw,
    Wallet,
} from 'lucide-react'
import { obtenerHistorialEstadisticasRepartidor } from '../../api/repartidores'

const ESTADOS = [
    { valor: 'Todos', texto: 'Todos los pedidos' },
    { valor: 'Entregado', texto: 'Pedidos entregados' },
    { valor: 'Pendiente', texto: 'Pedidos pendientes' },
    { valor: 'En camino', texto: 'Pedidos en camino' },
    { valor: 'Cancelado', texto: 'Pedidos cancelados' },
]

function HistorialEstadisticas() {
    const [estado, setEstado] = useState('Entregado')
    const [fecha, setFecha] = useState('')

    const [pedidos, setPedidos] = useState([])
    const [estadisticas, setEstadisticas] = useState({
        pedidosEntregados: 0,
        gananciasTotales: 0,
    })

    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const cargarDatos = useCallback(async () => {
        try {
            setCargando(true)
            setError('')

            const respuesta =
                await obtenerHistorialEstadisticasRepartidor({
                    estado,
                    fecha,
                })

            const datos = respuesta.data ?? {}

            setPedidos(
                Array.isArray(datos.pedidos)
                    ? datos.pedidos
                    : []
            )

            setEstadisticas({
                pedidosEntregados: Number(
                    datos.estadisticas?.pedidosEntregados ?? 0
                ),
                gananciasTotales: Number(
                    datos.estadisticas?.gananciasTotales ?? 0
                ),
            })
        } catch (err) {
            console.error(
                'Error al cargar el historial del repartidor:',
                err
            )

            setError(
                err.response?.data?.mensaje ||
                'No se pudo cargar el historial y las estadísticas.'
            )

            setPedidos([])
            setEstadisticas({
                pedidosEntregados: 0,
                gananciasTotales: 0,
            })
        } finally {
            setCargando(false)
        }
    }, [estado, fecha])

    useEffect(() => {
        cargarDatos()
    }, [cargarDatos])

    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            maximumFractionDigits: 0,
        }).format(Number(valor ?? 0))
    }

    function formatearDistancia(valor) {
        return new Intl.NumberFormat('es-CR', {
            maximumFractionDigits: 2,
        }).format(Number(valor ?? 0))
    }

    function formatearFecha(fechaPedido) {
        if (!fechaPedido) {
            return 'Sin registrar'
        }

        return new Intl.DateTimeFormat('es-CR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(fechaPedido))
    }

    function limpiarFecha() {
        setFecha('')
    }

    function obtenerClaseEstado(estadoPedido) {
        switch (estadoPedido?.toLowerCase()) {
            case 'entregado':
                return 'border-emerald-400 bg-emerald-500/20 text-emerald-100'

            case 'pendiente':
                return 'border-amber-400 bg-amber-500/20 text-amber-100'

            case 'en camino':
                return 'border-blue-400 bg-blue-500/20 text-blue-100'

            case 'cancelado':
                return 'border-red-400 bg-red-500/20 text-red-100'

            default:
                return 'border-slate-400 bg-slate-500/20 text-slate-100'
        }
    }

    return (
        <section className="mx-auto w-full max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-lime-400 md:text-5xl">
                    Historial y Estadísticas
                </h1>

                <p className="mt-2 text-slate-300">
                    Consulta los pedidos asignados y las ganancias obtenidas.
                </p>
            </div>

            <div className="rounded-2xl bg-slate-800 p-5 shadow-xl md:p-8">
                <h2 className="mb-5 text-xl font-bold uppercase text-white">
                    Historial de pedidos
                </h2>

                <div className="mb-7 grid gap-4 rounded-2xl border border-slate-600 bg-slate-900/60 p-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
                    <div>
                        <label
                            htmlFor="estado-pedido"
                            className="mb-2 block text-sm font-semibold text-slate-200"
                        >
                            Estado del pedido
                        </label>

                        <select
                            id="estado-pedido"
                            value={estado}
                            onChange={(evento) =>
                                setEstado(evento.target.value)
                            }
                            className="w-full rounded-xl border border-slate-500 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-lime-400"
                        >
                            {ESTADOS.map((opcion) => (
                                <option
                                    key={opcion.valor}
                                    value={opcion.valor}
                                >
                                    {opcion.texto}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="fecha-pedido"
                            className="mb-2 block text-sm font-semibold text-slate-200"
                        >
                            Fecha
                        </label>

                        <div className="relative">
                            <input
                                id="fecha-pedido"
                                type="date"
                                value={fecha}
                                onChange={(evento) =>
                                    setFecha(evento.target.value)
                                }
                                className="w-full rounded-xl border border-slate-500 bg-slate-800 px-4 py-3 pr-11 text-white outline-none transition [color-scheme:dark] focus:border-lime-400"
                            />

                            <CalendarDays
                                size={20}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                            />
                        </div>

                        {fecha && (
                            <button
                                type="button"
                                onClick={limpiarFecha}
                                className="mt-2 text-sm text-sky-300 hover:text-sky-200"
                            >
                                Mostrar todas las fechas
                            </button>
                        )}
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={cargarDatos}
                            disabled={cargando}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white px-5 py-3 font-semibold text-white transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 xl:w-auto"
                        >
                            <RefreshCw
                                size={19}
                                className={cargando ? 'animate-spin' : ''}
                            />

                            Actualizar
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-400 bg-red-500/20 p-4 text-red-100">
                        {error}
                    </div>
                )}

                {cargando && (
                    <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-10 text-center text-slate-200">
                        Cargando historial...
                    </div>
                )}

                {!cargando && !error && pedidos.length === 0 && (
                    <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-10 text-center">
                        <PackageCheck
                            size={42}
                            className="mx-auto mb-3 text-slate-400"
                        />

                        <p className="font-semibold text-white">
                            No se encontraron pedidos
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                            Cambia el estado o elimina el filtro de fecha.
                        </p>
                    </div>
                )}

                {!cargando && !error && pedidos.length > 0 && (
                    <>
                        {/* Tabla para computadoras */}
                        <div className="hidden overflow-hidden rounded-2xl border border-slate-600 md:block">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-white text-slate-700">
                                    <tr>
                                        <th className="border-r border-slate-300 px-4 py-4 text-left text-sm font-semibold">
                                            Cliente
                                        </th>

                                        <th className="border-r border-slate-300 px-4 py-4 text-center text-sm font-semibold">
                                            Distancia
                                        </th>

                                        <th className="border-r border-slate-300 px-4 py-4 text-left text-sm font-semibold">
                                            Dirección
                                        </th>

                                        <th className="border-r border-slate-300 px-4 py-4 text-center text-sm font-semibold">
                                            Tiempo
                                        </th>

                                        <th className="border-r border-slate-300 px-4 py-4 text-center text-sm font-semibold">
                                            Estado
                                        </th>

                                        <th className="px-4 py-4 text-right text-sm font-semibold">
                                            Ganancia
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-600">
                                    {pedidos.map((pedido) => (
                                        <tr
                                            key={pedido.pedidoId}
                                            className="bg-sky-800/70 text-slate-100 transition hover:bg-sky-700"
                                        >
                                            <td className="border-r border-slate-600 px-4 py-4 font-medium">
                                                {pedido.cliente}
                                            </td>

                                            <td className="border-r border-slate-600 px-4 py-4 text-center">
                                                {formatearDistancia(
                                                    pedido.distanciaKm
                                                )}{' '}
                                                km
                                            </td>

                                            <td className="border-r border-slate-600 px-4 py-4">
                                                {pedido.direccion}
                                            </td>

                                            <td className="border-r border-slate-600 px-4 py-4 text-center">
                                                {pedido.tiempoMinutos}{' '}
                                                min
                                            </td>

                                            <td className="border-r border-slate-600 px-4 py-4 text-center">
                                                    <span
                                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${obtenerClaseEstado(
                                                            pedido.estado
                                                        )}`}
                                                    >
                                                        {pedido.estado}
                                                    </span>
                                            </td>

                                            <td className="px-4 py-4 text-right font-bold">
                                                {formatearMoneda(
                                                    pedido.ganancia
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tarjetas para celulares */}
                        <div className="grid gap-4 md:hidden">
                            {pedidos.map((pedido) => (
                                <article
                                    key={pedido.pedidoId}
                                    className="rounded-2xl border border-slate-600 bg-sky-800/70 p-5 text-white"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-sky-200">
                                                Pedido #{pedido.pedidoId}
                                            </p>

                                            <h3 className="text-lg font-bold">
                                                {pedido.cliente}
                                            </h3>
                                        </div>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${obtenerClaseEstado(
                                                pedido.estado
                                            )}`}
                                        >
                                            {pedido.estado}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-100">
                                        <p>
                                            <span className="font-semibold">
                                                Dirección:
                                            </span>{' '}
                                            {pedido.direccion}
                                        </p>

                                        <p>
                                            <span className="font-semibold">
                                                Distancia:
                                            </span>{' '}
                                            {formatearDistancia(
                                                pedido.distanciaKm
                                            )}{' '}
                                            km
                                        </p>

                                        <p>
                                            <span className="font-semibold">
                                                Tiempo:
                                            </span>{' '}
                                            {pedido.tiempoMinutos} minutos
                                        </p>

                                        <p>
                                            <span className="font-semibold">
                                                Fecha:
                                            </span>{' '}
                                            {formatearFecha(
                                                pedido.fechaEntrega ??
                                                pedido.fechaPedido
                                            )}
                                        </p>

                                        <p>
                                            <span className="font-semibold">
                                                Ganancia:
                                            </span>{' '}
                                            {formatearMoneda(
                                                pedido.ganancia
                                            )}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}

                <div className="mt-10">
                    <h2 className="mb-5 text-xl font-bold uppercase text-white">
                        Estadísticas
                    </h2>

                    <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
                        <article className="rounded-2xl border-2 border-white bg-slate-900/40 p-6 text-center text-white">
                            <PackageCheck
                                size={32}
                                className="mx-auto mb-3 text-lime-400"
                            />

                            <p className="text-lg font-semibold">
                                Pedidos entregados
                            </p>

                            <p className="mt-3 text-3xl font-extrabold">
                                {estadisticas.pedidosEntregados}
                            </p>
                        </article>

                        <article className="rounded-2xl border-2 border-white bg-slate-900/40 p-6 text-center text-white">
                            <Wallet
                                size={32}
                                className="mx-auto mb-3 text-lime-400"
                            />

                            <p className="text-lg font-semibold">
                                Ganancias
                            </p>

                            <p className="mt-3 text-3xl font-extrabold">
                                {formatearMoneda(
                                    estadisticas.gananciasTotales
                                )}
                            </p>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HistorialEstadisticas