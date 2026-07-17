import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { obtenerHistorialCliente } from '../../api/pedidos'

function HistorialCliente() {
    const [pedidos, setPedidos] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [orden, setOrden] = useState('fecha-desc')
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        cargarHistorial()
    }, [])

    async function cargarHistorial() {
        try {
            setCargando(true)
            setError('')

            const respuesta = await obtenerHistorialCliente()
            setPedidos(respuesta.data ?? [])
        } catch (error) {
            console.error('Error al cargar el historial:', error)

            setError(
                error.response?.data?.mensaje ||
                'No se pudo cargar el historial de pedidos.'
            )
        } finally {
            setCargando(false)
        }
    }

    const pedidosFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()

        const resultado = pedidos.filter((pedido) => {
            const productos = pedido.productos
                ?.map((producto) => producto.nombre)
                .join(' ')
                .toLowerCase() ?? ''

            return (
                !texto ||
                pedido.nombreRestaurante?.toLowerCase().includes(texto) ||
                pedido.estado?.toLowerCase().includes(texto) ||
                pedido.direccionEntrega?.toLowerCase().includes(texto) ||
                productos.includes(texto) ||
                String(pedido.pedidoId).includes(texto)
            )
        })

        return [...resultado].sort((a, b) => {
            switch (orden) {
                case 'fecha-asc':
                    return new Date(a.fechaPedido) - new Date(b.fechaPedido)

                case 'total-desc':
                    return Number(b.total) - Number(a.total)

                case 'total-asc':
                    return Number(a.total) - Number(b.total)

                case 'estado':
                    return String(a.estado).localeCompare(
                        String(b.estado),
                        'es'
                    )

                case 'fecha-desc':
                default:
                    return new Date(b.fechaPedido) - new Date(a.fechaPedido)
            }
        })
    }, [pedidos, busqueda, orden])

    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            maximumFractionDigits: 0,
        }).format(Number(valor ?? 0))
    }

    function formatearFecha(fecha) {
        if (!fecha) {
            return 'Pendiente'
        }

        return new Intl.DateTimeFormat('es-CR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(fecha))
    }

    function obtenerClaseEstado(estado) {
        switch (estado?.toLowerCase()) {
            case 'entregado':
                return 'bg-emerald-500/20 text-emerald-200 border-emerald-400'

            case 'cancelado':
                return 'bg-red-500/20 text-red-200 border-red-400'

            case 'pendiente':
                return 'bg-amber-500/20 text-amber-100 border-amber-400'

            case 'en camino':
                return 'bg-blue-500/20 text-blue-100 border-blue-400'

            default:
                return 'bg-slate-500/20 text-slate-100 border-slate-400'
        }
    }

    if (cargando) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <p className="text-lg text-slate-300">
                    Cargando historial...
                </p>
            </div>
        )
    }

    return (
        <section className="mx-auto w-full max-w-7xl">
            <h1 className="mb-6 text-4xl font-extrabold text-lime-400 md:text-5xl">
                Historial
            </h1>

            <div className="rounded-2xl bg-sky-800 p-6 shadow-xl md:p-8">
                <h2 className="mb-5 text-xl font-bold text-white">
                    Información de pedidos anteriores
                </h2>

                <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end">
                    <div className="flex-1">
                        <label
                            htmlFor="buscar-pedido"
                            className="mb-2 block font-semibold uppercase text-white"
                        >
                            Buscar
                        </label>

                        <div className="relative">
                            <input
                                id="buscar-pedido"
                                type="text"
                                value={busqueda}
                                onChange={(evento) =>
                                    setBusqueda(evento.target.value)
                                }
                                placeholder="Restaurante, producto, estado..."
                                className="w-full rounded-full border-2 border-white bg-transparent py-3 pl-5 pr-12 text-white outline-none placeholder:text-sky-200 focus:border-lime-400"
                            />

                            <Search
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-300"
                                size={24}
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-64">
                        <label
                            htmlFor="orden-pedidos"
                            className="mb-2 block font-semibold text-white"
                        >
                            Ordenar por
                        </label>

                        <select
                            id="orden-pedidos"
                            value={orden}
                            onChange={(evento) => setOrden(evento.target.value)}
                            className="w-full rounded-full border-2 border-white bg-sky-900 px-4 py-3 text-white outline-none focus:border-lime-400"
                        >
                            <option value="fecha-desc">
                                Más recientes
                            </option>

                            <option value="fecha-asc">
                                Más antiguos
                            </option>

                            <option value="total-desc">
                                Mayor total
                            </option>

                            <option value="total-asc">
                                Menor total
                            </option>

                            <option value="estado">
                                Estado
                            </option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-400 bg-red-500/20 p-4 text-red-100">
                        {error}
                    </div>
                )}

                {!error && pedidosFiltrados.length === 0 && (
                    <div className="rounded-xl border border-sky-200 bg-sky-700 p-8 text-center text-white">
                        {pedidos.length === 0
                            ? 'Todavía no tienes pedidos registrados.'
                            : 'No se encontraron pedidos con esa búsqueda.'}
                    </div>
                )}

                {!error && pedidosFiltrados.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {pedidosFiltrados.map((pedido) => (
                            <article
                                key={pedido.pedidoId}
                                className="rounded-2xl border-2 border-white bg-sky-600/80 p-5 text-white transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-sky-100">
                                            Pedido #{pedido.pedidoId}
                                        </p>

                                        <h3 className="text-xl font-bold">
                                            {pedido.nombreRestaurante}
                                        </h3>
                                    </div>

                                    <span
                                        className={`rounded-full border px-3 py-1 text-sm font-semibold ${obtenerClaseEstado(
                                            pedido.estado
                                        )}`}
                                    >
                                        {pedido.estado}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm md:text-base">
                                    <p>
                                        <span className="font-semibold">
                                            Fecha del pedido:
                                        </span>{' '}
                                        {formatearFecha(pedido.fechaPedido)}
                                    </p>

                                    <div>
                                        <p className="font-semibold">
                                            Productos:
                                        </p>

                                        <ul className="ml-5 list-disc text-sky-50">
                                            {pedido.productos?.map(
                                                (producto) => (
                                                    <li
                                                        key={`${pedido.pedidoId}-${producto.productoId}`}
                                                    >
                                                        {producto.cantidad} ×{' '}
                                                        {producto.nombre}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>

                                    <p>
                                        <span className="font-semibold">
                                            Dirección:
                                        </span>{' '}
                                        {pedido.direccionEntrega}
                                    </p>

                                    <p>
                                        <span className="font-semibold">
                                            Total:
                                        </span>{' '}
                                        {formatearMoneda(pedido.total)}
                                    </p>

                                    <p>
                                        <span className="font-semibold">
                                            Fecha de entrega:
                                        </span>{' '}
                                        {formatearFecha(pedido.fechaEntrega)}
                                    </p>

                                    <p>
                                        <span className="font-semibold">
                                            Costo de envío:
                                        </span>{' '}
                                        {formatearMoneda(pedido.costoEnvio)}
                                    </p>

                                    <p>
                                        <span className="font-semibold">
                                            Distancia:
                                        </span>{' '}
                                        {pedido.distanciaKm} km
                                    </p>

                                    <p>
                                        <span className="font-semibold">
                                            Tiempo estimado:
                                        </span>{' '}
                                        {pedido.tiempoEstimadoMin} minutos
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default HistorialCliente