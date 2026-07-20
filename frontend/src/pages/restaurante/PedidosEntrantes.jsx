import { useEffect, useState } from 'react'
import {
    obtenerPedidosPendientesRestaurante,
    obtenerPedidosAceptadosRestaurante,
    obtenerPedidosActivosRestaurante,
    obtenerRepartidoresDisponibles,
    aceptarPedidoRestaurante,
    asignarRepartidorPedido,
} from '../../api/usuarios'
import MapaUbicacionModal from '../../components/MapaUbicacionModal'

function PedidosEntrantes() {
    // se guarda cada lista de pedidos por separado
    const [pendientes, setPendientes] = useState([])
    const [aceptados, setAceptados] = useState([])
    const [activos, setActivos] = useState([])
    const [repartidores, setRepartidores] = useState([])
    const [restauranteInfo, setRestauranteInfo] = useState(null)

    // Estos dos son para cuando el restaurante este seleccioando un de un repartidor
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
    const [repartidorSeleccionado, setRepartidorSeleccionado] = useState('')

    const [cargando, setCargando] = useState(true)
    const [aceptando, setAceptando] = useState(null) // guarda el id del pedido que se está aceptando
    const [asignando, setAsignando] = useState(false)
    const [error, setError] = useState('')

    // Cuando esto tiene un valor [lat, lng], se abre el modal del mapa
    const [modalDestino, setModalDestino] = useState(null)

    // Esta función le pide al servidor las 3 listas de pedidos y los repartidores disponibles
    async function cargarDatos() {
        try {
            const resPendientes = await obtenerPedidosPendientesRestaurante()
            const resAceptados = await obtenerPedidosAceptadosRestaurante()
            const resActivos = await obtenerPedidosActivosRestaurante()
            const resRepartidores = await obtenerRepartidoresDisponibles()

            setPendientes(resPendientes.data.pedidos)
            setAceptados(resAceptados.data.pedidos)
            setActivos(resActivos.data.pedidos)
            setRepartidores(resRepartidores.data)

            // La info del restaurante puede venir en cualquiera de las 3 respuestas, entonces revisamos una por una hasta encontrar los datos
            if (resPendientes.data.restaurante) {
                setRestauranteInfo(resPendientes.data.restaurante)
            } else if (resAceptados.data.restaurante) {
                setRestauranteInfo(resAceptados.data.restaurante)
            } else if (resActivos.data.restaurante) {
                setRestauranteInfo(resActivos.data.restaurante)
            }
        } catch (error) {
            setError('No se pudieron cargar los pedidos.')
        } finally {
            setCargando(false)
        }
    }

    // Cargamos los datos apenas se monta el componente
    useEffect(() => {
        cargarDatos()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function handleAceptar(pedidoId) {
        setAceptando(pedidoId)
        setError('')
        try {
            await aceptarPedidoRestaurante(pedidoId)
            await cargarDatos()
        } catch (err) {
            // Si el servidor nos mando un mensaje de error especifico, se enseña
            // Si no, sale un generico.
            let mensajeError = 'No se pudo aceptar el pedido.'
            if (err.response && err.response.data && err.response.data.mensaje) {
                mensajeError = err.response.data.mensaje
            }
            setError(mensajeError)
        } finally {
            setAceptando(null)
        }
    }

    function handleSeleccionarPedido(pedidoId) {
        setPedidoSeleccionado(pedidoId)
        setRepartidorSeleccionado('')
        setError('')
    }

    async function handleAsignar() {
        // Si falta el pedido o el repartidor, no hacemos nada
        if (!pedidoSeleccionado) return
        if (!repartidorSeleccionado) return

        setAsignando(true)
        setError('')

        try {
            const idRepartidorNumero = Number(repartidorSeleccionado)
            await asignarRepartidorPedido(pedidoSeleccionado, idRepartidorNumero)
            setPedidoSeleccionado(null)
            setRepartidorSeleccionado('')
            await cargarDatos()

        } catch (err) {
            let mensajeError = 'No se pudo asignar el repartidor.'
            if (err.response && err.response.data && err.response.data.mensaje) {
                mensajeError = err.response.data.mensaje

            }
            setError(mensajeError)
        } finally {

            setAsignando(false)
        }
    }

    function abrirMapa (pedido) {
        const lat = Number(pedido.latitudEntrega)
        const lng = Number(pedido.longitudEntrega)
        setModalDestino([lat, lng])

    }

    function cerrarMapa() {
        setModalDestino(null)
    }

    // Convierte un numero a formato de colones
    function formatoPrecio(valor) {
        const numero = Number(valor)
        return '₡' + numero.toLocaleString('es-CR')
    }

    // Convierte una fecha a un texto legible: 18/07/26,  07:31 p.m.
    function formatoHora(fecha) {
        const fechaObjeto = new Date(fecha)
        return fechaObjeto.toLocaleString('es-CR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',

        })
    }

    // Sacamos la ubicacion del restaurante para poder dibujar la ruta en el mapa
    let origenRestaurante = null
    if (restauranteInfo) {
        const lat = Number(restauranteInfo.latitud)
        const lng = Number(restauranteInfo.longitud)
        origenRestaurante = [lat, lng]
    }

    // El nombre del restaurante para el título del modal
    let nombreRestauranteParaModal = ''

    if (restauranteInfo) {
        nombreRestauranteParaModal = restauranteInfo.nombreRestaurante
    }

    // El modal esta abierto cuando modalDestino tiene un valor
    const modalAbierto = modalDestino !== null

    if (cargando) {
        return <p className="text-slate-300 px-4">Cargando pedidos...</p>
    }

    return (
        <section className="text-white px-4 sm:px-0">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-lime-300 mb-6 sm:mb-8">Pedidos Entrantes</h1>

                {error && (
                    <p className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">{error}</p>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                    <div className="flex flex-col gap-8 min-w-0">

                        {/* PEDIDOS PENDIENTES — esperando que el restaurante los acepte */}
                        <div>
                            <h2 className="mb-4 text-base sm:text-lg font-semibold uppercase text-white">Pedidos pendientes</h2>

                            {pendientes.length === 0 ? (
                                <p className="text-slate-300 text-sm sm:text-base">No hay pedidos nuevos por aceptar. </p>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-700">
                                    <table className="w-full border-collapse min-w-[820px]">

                                        <thead className="bg-slate-100 text-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                            <th className="px-4 py-3 text-left font-medium">Producto y cantidad</th>
                                            <th className="px-4 py-3 text-center font-medium">Dirección</th>
                                            <th className="px-4 py-3 text-center font-medium">Total</th>
                                            <th className="px-4 py-3 text-center font-medium">Tiempo est.</th>
                                            <th className="px-4 py-3 text-center font-medium">Hora de pedido</th>
                                            <th className="px-4 py-3 text-center font-medium">Aceptar</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-slate-700 text-white">
                                        {pendientes.map((p) => {
                                            // Armamos el texto de productos: "Pizza x2, Soda x1"
                                            let textoProductos = ''
                                            for (let i = 0; i < p.productos.length; i++) {
                                                const producto = p.productos[i]
                                                if (i > 0) {
                                                    textoProductos = textoProductos + ', '
                                                }
                                                textoProductos = textoProductos + producto.nombre + ' x' + producto.cantidad
                                            }

                                            const estaAceptandoEstePedido = aceptando === p.pedidoId

                                            return (
                                                <tr key={p.pedidoId} className="border-t border-slate-600">
                                                    <td className="px-4 py-3">{p.cliente}</td>
                                                    <td className="px-4 py-3">{textoProductos}</td>
                                                    <td className="px-4 py-3 text-center">

                                                        <button
                                                            onClick={() => abrirMapa(p)}
                                                            className="rounded-full border border-slate-400 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-400 whitespace-nowrap"
                                                        >
                                                            Ver ubicación
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">{formatoPrecio(p.total)}</td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">{p.tiempoEstimadoMin} min</td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">{formatoHora(p.fechaPedido)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => handleAceptar(p.pedidoId)}
                                                                disabled={estaAceptandoEstePedido}
                                                                className="rounded-full bg-lime-400 px-4 py-1.5 text-xs font-semibold text-slate-900 whitespace-nowrap disabled:opacity-50"
                                                            >
                                                                {estaAceptandoEstePedido ? 'Aceptando...' : 'Aceptar'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* PEDIDOS ACEPTADOS — falta asignar repartidor */}
                        <div>
                            <h2 className="mb-4 text-base sm:text-lg font-semibold uppercase text-white">Pedidos aceptados</h2>

                            {aceptados.length === 0 ? (
                                <p className="text-slate-300 text-sm sm:text-base">No hay pedidos aceptados esperando repartidor.</p>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-700">
                                    <table className="w-full border-collapse min-w-[820px]">
                                        <thead className="bg-slate-100 text-slate-800">

                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                            <th className="px-4 py-3 text-left font-medium">Producto y cantidad</th>
                                            <th className="px-4 py-3 text-center font-medium">Dirección</th>
                                            <th className="px-4 py-3 text-center font-medium">Total</th>
                                            <th className="px-4 py-3 text-center font-medium">Tiempo est.</th>
                                            <th className="px-4 py-3 text-center font-medium">Asignar</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-slate-700 text-white">

                                        {aceptados.map((p) => {
                                            let textoProductos = ''
                                            for (let i = 0; i < p.productos.length; i++) {
                                                const producto = p.productos[i]
                                                if (i > 0) {
                                                    textoProductos = textoProductos + ', '
                                                }
                                                textoProductos = textoProductos + producto.nombre + ' x' + producto.cantidad
                                            }

                                            const estaSeleccionado = pedidoSeleccionado === p.pedidoId

                                            // Se elige la clase del boton y de la fila dependiendo si está seleccionado
                                            let claseBoton = ''
                                            let textoBoton = ''
                                            if (estaSeleccionado) {
                                                claseBoton = 'rounded-full bg-lime-400 px-4 py-1.5 text-xs font-semibold text-slate-900 whitespace-nowrap'
                                                textoBoton = 'Seleccionado'
                                            } else {
                                                claseBoton = 'rounded-full border border-slate-400 px-4 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-400 whitespace-nowrap'
                                                textoBoton = 'Seleccionar'
                                            }

                                            let claseFila = 'border-t border-slate-600'
                                            if (estaSeleccionado) {

                                                claseFila = claseFila + ' bg-slate-600'
                                            }

                                            return (
                                                <tr key={p.pedidoId} className={claseFila}>
                                                    <td className="px-4 py-3">{p.cliente}</td>
                                                    <td className="px-4 py-3">{textoProductos}</td>
                                                    <td className="px-4 py-3 text-center">

                                                        <button
                                                            onClick={() => abrirMapa(p)}

                                                            className="rounded-full border border-slate-400 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-400 whitespace-nowrap"
                                                        >
                                                            Ver ubicación
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">{formatoPrecio(p.total)}</td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">{p.tiempoEstimadoMin} min</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center">
                                                            <button onClick={() => handleSeleccionarPedido(p.pedidoId)} className={claseBoton}>
                                                                {textoBoton}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>
                                    </table>

                                </div>
                            )}

                        </div>

                        {/* PEDIDOS ACTIVOS — ya tienen repartidor asignado */}
                        <div>
                            <h2 className="mb-4 text-base sm:text-lg font-semibold uppercase text-white">Pedidos activos</h2>

                            {activos.length === 0 ? (
                                <p className="text-slate-300 text-sm sm:text-base">No hay pedidos activos en este momento.</p>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-700">
                                    <table className="w-full border-collapse min-w-[640px]">
                                        <thead className="bg-slate-100 text-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                            <th className="px-4 py-3 text-left font-medium">Repartidor</th>
                                            <th className="px-4 py-3 text-center font-medium">Dirección</th>
                                            <th className="px-4 py-3 text-center font-medium">Tiempo est.</th>
                                            <th className="px-4 py-3 text-center font-medium">Estado</th>
                                        </tr>
                                        </thead>

                                        <tbody className="bg-slate-700 text-white">
                                        {activos.map((p) => (
                                            <tr key={p.pedidoId} className="border-t border-slate-600">
                                                <td className="px-4 py-3">{p.cliente}</td>
                                                <td className="px-4 py-3">{p.repartidor}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => abrirMapa(p)}
                                                        className="rounded-full border border-slate-400 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-400 whitespace-nowrap"
                                                    >
                                                        Ver ubicación
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap">{p.tiempoEstimadoMin} min</td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap">{p.estadoVisible}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel de repartidores disponibles. En celular queda debajo de las tablas*/}
                    <div className="rounded-2xl border border-slate-700 bg-slate-700 p-5 flex flex-col gap-4">
                        <h2 className="text-base sm:text-lg font-semibold uppercase text-white">Repartidores Disponibles</h2>

                        {!pedidoSeleccionado && (
                            <p className="text-slate-300 text-sm">
                                Selecciona un pedido aceptado de la tabla para poder asignarle un repartidor.
                            </p>
                        )}

                        {repartidores.length === 0 ? (
                            <p className="text-slate-300 text-sm" >No tienes repartidores disponibles ahora mismo.</p>
                        ) : (
                            <select
                                value={repartidorSeleccionado}
                                onChange={(e) => setRepartidorSeleccionado(e.target.value)}
                                disabled={!pedidoSeleccionado}
                                className="rounded-lg bg-slate-100 px-3 py-2 text-slate-800 disabled:opacity-50 w-full"
                            >
                                <option value="">Selecciona un repartidor</option>

                                {repartidores.map((r) => (
                                    <option key={r.repartidorId} value={r.repartidorId}>
                                        {r.nombre}
                                    </option>
                                ))}
                            </select>
                        )}

                        <button
                            onClick={handleAsignar}
                            disabled={!pedidoSeleccionado || !repartidorSeleccionado || asignando}

                            className="rounded-xl bg-lime-400 px-5 py-3 font-semibold text-slate-900 transition hover:bg-lime-300 disabled:bg-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed"
                        >
                            {asignando ? 'Asignando...' : 'Asignar'}
                        </button>
                    </div>
                </div>
            </div>

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

export default PedidosEntrantes