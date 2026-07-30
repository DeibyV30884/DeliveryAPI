import { useCallback, useEffect, useState } from 'react'
import {
    PackageCheck,
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

const PERIODOS = [
    { valor: 'hoy', etiqueta: 'Hoy' },
    { valor: 'semana', etiqueta: 'Semana' },
    { valor: 'mes', etiqueta: 'Mes' },
    { valor: 'anio', etiqueta: 'Año' },
]

const PEDIDOS_POR_PAGINA = 10

function HistorialEstadisticas() {
    const [estado, setEstado] = useState('Entregado')
    const [periodo, setPeriodo] = useState('hoy')

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
                    periodo,
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
    }, [estado, periodo])

    useEffect(() => {
        cargarDatos()
    }, [cargarDatos])

    function obtenerEtiquetaPeriodo(valor) {
        const encontrado = PERIODOS.find((p) => p.valor === valor)
        if (encontrado) {
            return encontrado.etiqueta
        }
        return 'Hoy'
    }

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

    function obtenerClaseEstado(estadoPedido) {
        switch (estadoPedido?.toLowerCase()) {
            case 'entregado':
                return 'border-lime-400 bg-lime-400 text-slate-900'

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

                <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-700 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full lg:w-64">
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
                            className="h-12 w-full rounded-xl border border-slate-500 bg-slate-800 px-4 text-white outline-none transition focus:border-lime-400"
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
                        <span className="mb-2 block text-sm font-semibold text-slate-200">
                            Periodo
                        </span>

                        <div className="flex flex-wrap gap-2">
                            {PERIODOS.map((p) => {
                                let clase =
                                    'flex h-12 items-center justify-center rounded-full border border-slate-600 px-4 text-sm font-semibold text-slate-300 transition hover:border-lime-400 hover:text-lime-400'

                                if (p.valor === periodo) {
                                    clase =
                                        'flex h-12 items-center justify-center rounded-full border border-lime-400 bg-lime-400 px-4 text-sm font-semibold text-slate-900'
                                }

                                return (
                                    <button
                                        key={p.valor}
                                        type="button"
                                        onClick={() => setPeriodo(p.valor)}
                                        className={clase}
                                    >
                                        {p.etiqueta}
                                    </button>
                                )
                            })}
                        </div>
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
                            Cambia el estado o el periodo seleccionado.
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
                                                className="rounded-full border border-slate-400 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white hover:bg-white hover:text-slate-800 whitespace-nowrap"
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
                        Estadísticas · {obtenerEtiquetaPeriodo(periodo)}
                    </h2>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white bg-slate-700 p-5">
                            <div className="flex items-center justify-center gap-3">
                                <PackageCheck
                                    size={28}
                                    className="text-lime-400"
                                />

                                <div className="text-center">
                                    <p className="text-2xl font-bold">
                                        {estadisticas.pedidosEntregados}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-300">
                                        Pedidos entregados
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white bg-slate-700 p-5">
                            <div className="flex items-center justify-center gap-3">
                                <Wallet
                                    size={28}
                                    className="text-lime-400"
                                />

                                <div className="text-center">
                                    <p className="text-2xl font-bold text-lime-400">
                                        {formatearMoneda(
                                            estadisticas.gananciasTotales
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-300">
                                        Ganancias
                                    </p>
                                </div>
                            </div>
                        </div>
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