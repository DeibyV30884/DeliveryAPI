import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    obtenerPerfilRepartidor,
    cambiarDisponibilidad,
    obtenerHistorialEstadisticasRepartidor,
    obtenerAsignadoPendiente,
    obtenerPedidoActivoRepartidor,
    aceptarPedidoRepartidor,
    devolverPedidoRepartidor,
    obtenerEstadoRegreso,
} from '../../api/usuarios'
import MapaUbicacionModal from '../../components/MapaUbicacionModal'

// Cada cuanto revisamos si el repartidor ya volvió al restaurante
const INTERVALO_REGRESO_MS = 5000

function Dashboard() {
    const navigate = useNavigate()

    const [disponible, setDisponible] = useState(false)
    const [cambiandoDisponibilidad, setCambiandoDisponibilidad] = useState(false)

    const [estadisticasHoy, setEstadisticasHoy] = useState({ pedidosEntregados: 0, gananciasTotales: 0 })
    const [pedidoPendiente, setPedidoPendiente] = useState(null)
    const [tienePedidoActivo, setTienePedidoActivo] = useState(false)

    // Estado del viaje de regreso al restaurante (después de confirmar una entrega)
    const [regreso, setRegreso] = useState(null)

    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(false)
    const [error, setError] = useState('')

    // Cuando esto tiene un valor [lat, lng], se abre el modal del mapa
    const [modalDestino, setModalDestino] = useState(null)

    // Revisa si el repartidor está regresando al restaurante y, si ya llegó,
    // el backend lo marca disponible solo. Aquí reflejamos ese cambio en pantalla.
    // Nota: una vez que ya llegó, el backend deja de asociar ese viaje de regreso
    // al pedido, así que después de esto el repartidor puede cambiar su
    // disponibilidad a mano (por ejemplo, para simular que dejó de trabajar)
    // sin que se le revierta automáticamente.
    async function verificarRegreso() {
        try {
            const res = await obtenerEstadoRegreso()
            setRegreso(res.data)
            if (res.data.disponible) {
                setDisponible(true)
            }
            return res.data
        } catch {
            setRegreso(null)
            return null
        }
    }

    // Esta función le pide al servidor los datos del dashboard
    async function cargarDatos() {
        setError('')
        try {
            const resPerfil = await obtenerPerfilRepartidor()
            setDisponible(resPerfil.data.disponible)

            const resEstadisticas = await obtenerHistorialEstadisticasRepartidor(null, 'hoy')
            setEstadisticasHoy(resEstadisticas.data.estadisticas)

            let hayActivo = false
            try {
                await obtenerPedidoActivoRepartidor()
                hayActivo = true
            } catch {
                hayActivo = false
            }
            setTienePedidoActivo(hayActivo)

            if (hayActivo) {
                setPedidoPendiente(null)
                setRegreso(null)
            } else {
                let hayPendiente = null
                try {
                    const resPendiente = await obtenerAsignadoPendiente()
                    hayPendiente = resPendiente.data
                } catch {
                    hayPendiente = null
                }
                setPedidoPendiente(hayPendiente)

                // Si no tiene ni pedido activo ni pendiente, puede que esté regresando al restaurante
                if (!hayPendiente) {
                    await verificarRegreso()
                } else {
                    setRegreso(null)
                }
            }
        } catch {
            setError('No se pudieron cargar los datos del dashboard.')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarDatos()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Mientras esté regresando, se revisa cada cierto tiempo hasta que ya haya llegado
    useEffect(() => {
        if (!regreso || !regreso.regresando) return

        const intervalo = setInterval(async () => {
            const actualizado = await verificarRegreso()
            if (actualizado && !actualizado.regresando) {
                // Ya llego: refrescamos todo el dashboard para que se vea disponible de nuevo
                await cargarDatos()
            }
        }, INTERVALO_REGRESO_MS)

        return () => clearInterval(intervalo)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [regreso])

    async function handleCambiarDisponibilidad(e) {
        const nuevoValor = e.target.value === 'true'
        setCambiandoDisponibilidad(true)
        setError('')
        try {
            await cambiarDisponibilidad(nuevoValor)
            setDisponible(nuevoValor)
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo actualizar tu disponibilidad.')
        } finally {
            setCambiandoDisponibilidad(false)
        }
    }

    async function handleAceptar(pedidoId) {
        setProcesando(true)
        setError('')
        try {
            await aceptarPedidoRepartidor(pedidoId)
            navigate('/repartidor/pedidoactivo')
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo aceptar el pedido.')
            setProcesando(false)
        }
    }

    async function handleDevolver(pedidoId) {
        setProcesando(true)
        setError('')
        try {
            await devolverPedidoRepartidor(pedidoId)
            setPedidoPendiente(null)
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo devolver el pedido.')
        } finally {
            setProcesando(false)
        }
    }

    function abrirMapa(pedido) {
        const lat = Number(pedido.latitudEntrega)
        const lng = Number(pedido.longitudEntrega)
        setModalDestino([lat, lng])
    }

    function cerrarMapa() {
        setModalDestino(null)
    }

    function formatoPrecio(valor) {
        return '₡' + Number(valor || 0).toLocaleString('es-CR')
    }

    if (cargando) {
        return <p className="text-slate-300 px-4">Cargando dashboard...</p>
    }

    // Ubicación del restaurante, para dibujar la ruta en el modal del mapa
    let origenRestaurante = null
    let nombreRestauranteParaModal = ''
    if (pedidoPendiente && pedidoPendiente.restaurante) {
        origenRestaurante = [
            Number(pedidoPendiente.restaurante.latitud),
            Number(pedidoPendiente.restaurante.longitud),
        ]
        nombreRestauranteParaModal = pedidoPendiente.restaurante.nombreRestaurante
    }

    const modalAbierto = modalDestino !== null
    const estaRegresando = regreso && regreso.regresando
    const disponibilidadBloqueada =
        cambiandoDisponibilidad || tienePedidoActivo || !!pedidoPendiente || estaRegresando

    return (
        <section className="text-white px-4 sm:px-0">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-lime-400">Dashboard</h1>

                <div className="flex items-center gap-2">
                    <label className="text-slate-300 text-sm">Disponibilidad:</label>
                    <select
                        value={disponible}
                        onChange={handleCambiarDisponibilidad}
                        disabled={disponibilidadBloqueada}
                        className="rounded-full bg-white text-slate-800 px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                        <option value="true">Disponible</option>
                        <option value="false">No disponible</option>
                    </select>
                </div>
            </div>

            {error && (
                <p className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">{error}</p>
            )}

            {estaRegresando && (
                <p className="mb-4 rounded-lg bg-slate-700 border border-slate-600 px-4 py-3 text-sm text-slate-200">
                    Volviendo al restaurante después de tu última entrega. En cuanto llegues, quedarás disponible
                    automáticamente para un nuevo pedido.
                </p>
            )}

            {(tienePedidoActivo || !!pedidoPendiente) && (
                <p className="mb-4 text-slate-300 text-sm">
                    No podés cambiar tu disponibilidad mientras tengas un pedido asignado o en camino.
                </p>
            )}

            <h2 className="text-sm uppercase tracking-wide text-slate-300 mb-3">Resumen del día</h2>
            <div className="grid gap-6 mb-8 sm:grid-cols-2 max-w-2xl">
                <div className="rounded-2xl border border-white bg-slate-700 p-5 text-center">
                    <p className="text-xs text-slate-300 mb-1">Pedidos entregados hoy</p>
                    <p className="text-2xl font-bold text-lime-400">{estadisticasHoy.pedidosEntregados}</p>
                </div>
                <div className="rounded-2xl border border-white bg-slate-700 p-5 text-center">
                    <p className="text-xs text-slate-300 mb-1">Ganancias de hoy</p>
                    <p className="text-2xl font-bold text-lime-400">{formatoPrecio(estadisticasHoy.gananciasTotales)}</p>
                </div>
            </div>

            {pedidoPendiente && (
                <div className="overflow-x-auto rounded-2xl border border-slate-700">
                    <table className="w-full border-collapse min-w-[640px]">
                        <thead className="bg-slate-100 text-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Cliente</th>
                            <th className="px-4 py-3 text-center font-medium">Distancia</th>
                            <th className="px-4 py-3 text-center font-medium">Dirección</th>
                            <th className="px-4 py-3 text-center font-medium">Tiempo</th>
                            <th className="px-4 py-3 text-center font-medium">Acción</th>
                        </tr>
                        </thead>
                        <tbody className="bg-slate-700 text-white">
                        <tr className="border-t border-slate-600">
                            <td className="px-4 py-3">{pedidoPendiente.cliente}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                {Number(pedidoPendiente.distanciaKm).toFixed(1)}km
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button
                                    onClick={() => abrirMapa(pedidoPendiente)}
                                    className="rounded-full border border-slate-400 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white hover:bg-white hover:text-slate-800 whitespace-nowrap"
                                >
                                    Ver ubicación
                                </button>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">{pedidoPendiente.tiempoEstimadoMin} min</td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => handleAceptar(pedidoPendiente.pedidoId)}
                                        disabled={procesando}
                                        title="Aceptar"
                                        className="rounded-full bg-lime-400 w-8 h-8 flex items-center justify-center text-slate-900 disabled:opacity-50"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={() => handleDevolver(pedidoPendiente.pedidoId)}
                                        disabled={procesando}
                                        title="Devolver"
                                        className="rounded-full border border-slate-400 w-8 h-8 flex items-center justify-center text-slate-200 hover:border-red-400 hover:text-red-400 disabled:opacity-50"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {!pedidoPendiente && tienePedidoActivo && (
                <p className="text-slate-300 text-sm">
                    Ya tienes un pedido en camino.{' '}
                    <button onClick={() => navigate('/repartidor/pedidoactivo')} className="text-lime-400 hover:underline">
                        Ver pedido activo
                    </button>
                </p>
            )}

            {!pedidoPendiente && !tienePedidoActivo && !estaRegresando && (
                <p className="text-slate-300 text-sm">No tienes pedidos por atender en este momento.</p>
            )}

            <MapaUbicacionModal
                abierto={modalAbierto}
                onClose={cerrarMapa}
                origen={origenRestaurante}
                destino={modalDestino}
                nombreRestaurante={nombreRestauranteParaModal}
            />
        </section>
    )
}

export default Dashboard