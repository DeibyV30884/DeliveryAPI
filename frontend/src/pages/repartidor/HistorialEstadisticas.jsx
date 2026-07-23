import { useCallback, useEffect, useState } from 'react'
import {
    CalendarDays,
    PackageCheck,
    RefreshCw,
    RotateCcw,
    Wallet,
} from 'lucide-react'
import { obtenerHistorialEstadisticasRepartidor } from '../../api/repartidores'
import MapaUbicacionModal from '../../components/MapaUbicacionModal'
import PaginacionProductos from '../../components/PaginacionProductos'

const ESTADOS = [
    { valor: 'Todos', texto: 'Todos los pedidos' },
    { valor: 'Entregado', texto: 'Pedidos entregados' },
    { valor: 'Pendiente', texto: 'Pedidos pendientes' },
    { valor: 'En camino', texto: 'Pedidos en camino' },
    { valor: 'Cancelado', texto: 'Pedidos cancelados' },
]

const PEDIDOS_POR_PAGINA = 10

function HistorialEstadisticas() {
    const [estado, setEstado] = useState('Entregado')
    const [fecha, setFecha] = useState('')

    const [pedidos, setPedidos] = useState([])
    const [estadisticas, setEstadisticas] = useState({
        pedidosEntregados: 0,
        gananciasTotales: 0,
    })

    const [pagina, setPagina] = useState(1)

    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    // Cuando esto tiene un valor { origen, destino, nombreRestaurante }, se abre el modal del mapa
    const [modalMapa, setModalMapa] = useState(null)

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

            setPagina(1)
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

    // Abre el modal del mapa con el origen (restaurante) y destino (dirección de entrega) del pedido
    function abrirMapa(pedido) {
        const origen = [
            Number(pedido.latitudRestaurante),
            Number(pedido.longitudRestaurante),
        ]
        const destino = [
            Number(pedido.latitudEntrega),
            Number(pedido.longitudEntrega),
        ]

        setModalMapa({
            origen,
            destino,
            nombreRestaurante: pedido.nombreRestaurante ?? '',
        })
    }

    function cerrarMapa() {
        setModalMapa(null)
    }

    // Paginación en el cliente sobre la lista ya filtrada por el servidor
    const totalPedidos = pedidos.length
    const totalPaginas = Math.max(
        1,
        Math.ceil(totalPedidos / PEDIDOS_POR_PAGINA)
    )
    const pedidosPagina = pedidos.slice(
        (pagina - 1) * PEDIDOS_POR_PAGINA,
        pagina * PEDIDOS_POR_PAGINA
    )

    const modalAbierto = modalMapa !== null

    return (
        <section className="mx-auto w-full max-w-7xl text-white">
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

                <div className="mb-7 grid gap-4 rounded-2xl border border-slate-700 bg-slate-700 p-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
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

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
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

                            <button
                                type="button"
                                onClick={limpiarFecha}
                                disabled={!fecha}
                                title="Restablecer fecha"
                                className="flex items-center gap-1 rounded-full border border-slate-400 px-3 py-3 text-xs font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-400 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <RotateCcw size={16} />
                                Restablecer
                            </button>
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={cargarDatos}
                            disabled={cargando}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-slate-900 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60 xl:w-auto"
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
                        <div className="overflow-x-auto rounded-2xl border border-slate-700">
                            <table className="w-full min-w-[820px] border-collapse">
                                <thead className="bg-slate-100 text-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Cliente
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium">
                                        Distancia
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium">
                                        Dirección
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium">
                                        Tiempo
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium">
                                        Fecha
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Ganancia
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="bg-slate-700 text-white">
                                {pedidosPagina.map((pedido) => (
                                    <tr
                                        key={pedido.pedidoId}
                                        className="border-t border-slate-600"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {pedido.cliente}
                                        </td>

                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            {formatearDistancia(
                                                pedido.distanciaKm
                                            )}{' '}
                                            km
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    abrirMapa(pedido)
                                                }
                                                className="rounded-full border border-slate-400 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-400 whitespace-nowrap"
                                            >
                                                Ver ubicación
                                            </button>
                                        </td>

                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            {pedido.tiempoMinutos} min
                                        </td>

                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            {formatearFecha(
                                                pedido.fechaEntrega ??
                                                pedido.fechaPedido
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${obtenerClaseEstado(
                                                    pedido.estado
                                                )}`}
                                            >
                                                {pedido.estado}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                                            {formatearMoneda(
                                                pedido.ganancia
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <PaginacionProductos
                            pagina={pagina}
                            totalPaginas={totalPaginas}
                            total={totalPedidos}
                            onCambiarPagina={setPagina}
                        />
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

            <MapaUbicacionModal
                abierto={modalAbierto}
                onClose={cerrarMapa}
                origen={modalMapa?.origen ?? null}
                destino={modalMapa?.destino ?? null}
                nombreRestaurante={modalMapa?.nombreRestaurante ?? ''}
            />
        </section>
    )
}

export default HistorialEstadisticas