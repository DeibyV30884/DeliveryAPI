import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import {
    obtenerPedidoActivoRepartidor,
    confirmarEntregaRepartidor,
    obtenerEstadoRegreso,
} from '../../api/usuarios'
import { obtenerRutaConPasos, obtenerPuntoEnRuta } from '../../utils/rutaOsrm'

import motoIcon from '../../assets/moto-de-reparto.png'
import restauranteIconImg from '../../assets/restaurante.png'
import ubicacionIcon from '../../assets/ubicacion.png'

// Iconos que se usan en el mapa
const iconoRestaurante = new L.Icon({ iconUrl: restauranteIconImg, iconSize: [40, 40], iconAnchor: [20, 40] })
const iconoCasa = new L.Icon({ iconUrl: ubicacionIcon, iconSize: [40, 40], iconAnchor: [20, 40] })
const iconoRepartidor = new L.Icon({ iconUrl: motoIcon, iconSize: [40, 40], iconAnchor: [20, 40] })

// Cada cuantos milisegundos se vuelve a pedir la info al servidor
const INTERVALO_REFRESCO_MS = 5000

// Componente chiquito solo para que el mapa se acomode a los puntos que le pasamos
function AjustarVista(props) {
    const puntos = props.puntos
    const map = useMap()

    useEffect(() => {
        if (puntos.length > 0) {
            map.fitBounds(puntos, { padding: [30, 30] })
        }
    }, [puntos, map])

    return null
}

function PedidoActivo() {
    const navigate = useNavigate()

    // Datos del pedido que va en camino
    const [pedido, setPedido] = useState(null)

    // Datos de cuando el repartidor ya entrego y esta regresando al restaurante
    const [regreso, setRegreso] = useState(null)

    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    // Codigo que el repartidor escribe para confirmar la entrega
    const [codigo, setCodigo] = useState('')
    const [confirmando, setConfirmando] = useState(false)

    // Rutas calculadas con OSRM
    const [ruta, setRuta] = useState(null)
    const [rutaRegreso, setRutaRegreso] = useState(null)
    const [mostrarPasos, setMostrarPasos] = useState(false)

    // Funcion que pregunta al backend si el repartidor esta regresando
    async function cargarEstadoRegreso() {
        try {
            const res = await obtenerEstadoRegreso()
            setRegreso(res.data)
        } catch (e) {
            setRegreso(null)
        }
    }

    // Cuando se carga la pagina por primera vez, revisamos si hay un pedido
    // en camino. Si no hay, revisamos si el repartidor esta regresando.
    useEffect(() => {
        async function cargarInicial() {
            try {
                const res = await obtenerPedidoActivoRepartidor()
                setPedido(res.data)
            } catch (e) {
                setPedido(null)
                await cargarEstadoRegreso()
            }
            setCargando(false)
        }

        cargarInicial()
    }, [])

    // Cuando ya tenemos un pedido, calculamos la ruta real desde el
    // restaurante hasta el punto de entrega
    useEffect(() => {
        if (!pedido) {
            return
        }
        if (!pedido.restaurante) {
            return
        }

        const origen = [Number(pedido.restaurante.latitud), Number(pedido.restaurante.longitud)]
        const destino = [Number(pedido.latitudEntrega), Number(pedido.longitudEntrega)]

        let cancelado = false

        obtenerRutaConPasos(origen, destino).then(function (r) {
            if (!cancelado) {
                setRuta(r)
            }
        })

        return function () {
            cancelado = true
        }
    }, [pedido])

    // Cada cierto tiempo volvemos a preguntar el estado del pedido
    // para actualizar la posicion del repartidor en el mapa
    useEffect(() => {
        if (!pedido) {
            return
        }
        if (pedido.yaLlego) {
            return
        }

        const intervalo = setInterval(function () {
            obtenerPedidoActivoRepartidor()
                .then(function (res) {
                    setPedido(res.data)
                })
                .catch(function () {})
        }, INTERVALO_REFRESCO_MS)

        return function () {
            clearInterval(intervalo)
        }
    }, [pedido])

    // Cuando el repartidor esta regresando, calculamos la ruta de vuelta
    useEffect(() => {
        if (!regreso) {
            return
        }
        if (!regreso.regresando) {
            return
        }
        if (rutaRegreso) {
            return
        }

        const origen = [Number(regreso.origen.latitud), Number(regreso.origen.longitud)]
        const destino = [Number(regreso.destino.latitud), Number(regreso.destino.longitud)]

        let cancelado = false

        obtenerRutaConPasos(origen, destino).then(function (r) {
            if (!cancelado) {
                setRutaRegreso(r)
            }
        })

        return function () {
            cancelado = true
        }
    }, [regreso, rutaRegreso])

    // Mientras el repartidor este regresando, seguimos preguntando su estado
    useEffect(() => {
        if (!regreso) {
            return
        }
        if (!regreso.regresando) {
            return
        }

        const intervalo = setInterval(cargarEstadoRegreso, INTERVALO_REFRESCO_MS)

        return function () {
            clearInterval(intervalo)
        }
    }, [regreso])

    // Se ejecuta cuando el repartidor da clic en "Confirmar"
    async function handleConfirmar() {
        if (!codigo.trim()) {
            return
        }
        if (!pedido) {
            return
        }

        setConfirmando(true)
        setError('')

        try {
            await confirmarEntregaRepartidor(pedido.pedidoId, codigo.trim())
            setPedido(null)
            await cargarEstadoRegreso()
        } catch (err) {
            let mensaje = 'El código de confirmación no coincide.'
            if (err.response && err.response.data && err.response.data.mensaje) {
                mensaje = err.response.data.mensaje
            }
            setError(mensaje)
        }

        setConfirmando(false)
    }

    if (cargando) {
        return <p className="text-slate-300 px-4">Cargando pedido activo...</p>
    }

    //Caso 1: el repartidor ya entrego y esta regresando al restaurante
    if (regreso && regreso.regresando) {
        const origen = [Number(regreso.origen.latitud), Number(regreso.origen.longitud)]
        const destino = [Number(regreso.destino.latitud), Number(regreso.destino.longitud)]

        let posicionMoto = [regreso.latitudActual, regreso.longitudActual]
        if (rutaRegreso && rutaRegreso.puntos) {
            const punto = obtenerPuntoEnRuta(rutaRegreso.puntos, regreso.fraccion)
            if (punto) {
                posicionMoto = punto
            }
        }

        let posicionesRuta = [origen, destino]
        if (rutaRegreso && rutaRegreso.puntos) {
            posicionesRuta = rutaRegreso.puntos
        }

        return (
            <section className="text-white px-4 sm:px-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-lime-400 mb-6">Regresando al restaurante</h1>
                <p className="text-slate-300 text-sm mb-4">
                    Entrega confirmada. Volviendo a {regreso.destino.nombre} para tu próximo pedido.
                </p>

                <div className="rounded-xl overflow-hidden h-140 w-full border border-slate-700 mb-4">
                    <MapContainer center={destino} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={origen} icon={iconoCasa} />
                        <Marker position={destino} icon={iconoRestaurante} />
                        <Marker position={posicionMoto} icon={iconoRepartidor} />
                        <Polyline positions={posicionesRuta} pathOptions={{ color: '#d60f0f', weight: 4 }} />
                        <AjustarVista puntos={[origen, destino, posicionMoto]} />
                    </MapContainer>
                </div>

                {rutaRegreso && rutaRegreso.pasos.length > 0 && (
                    <details className="mb-4">
                        <summary className="cursor-pointer text-lime-400 text-sm mb-2">Ver indicaciones de la ruta</summary>
                        <ol className="text-slate-300 text-sm flex flex-col gap-1 mt-2">
                            {rutaRegreso.pasos.map(function (paso, i) {
                                return (
                                    <li key={i} className="flex justify-between border-b border-slate-700 py-1">
                                        <span>{paso.instruccion}</span>
                                        <span className="text-slate-400">{paso.distancia}</span>
                                    </li>
                                )
                            })}
                        </ol>
                    </details>
                )}
            </section>
        )
    }

    // Caso 2: ya volvio al restaurante y esta disponible de nuevo
    if (regreso && !regreso.regresando && regreso.disponible) {
        return (
            <div className="text-center mt-20">
                <p className="text-slate-300 mb-4">Ya volvio al restaurante y estás disponible para un nuevo pedido.</p>
                <button onClick={function () { navigate('/repartidor/panelprincipal') }} className="text-lime-400 hover:underline">
                    Ir al dashboard
                </button>
            </div>
        )
    }

    // Caso 3: no hay ningun pedido activo
    if (!pedido) {
        let mensaje = 'No tiene ningún pedido activo en este momento.'
        if (error) {
            mensaje = error
        }

        return (
            <div className="text-center mt-20">
                <p className="text-slate-300 mb-4">{mensaje}</p>
                <button onClick={function () { navigate('/repartidor/panelprincipal') }} className="text-lime-400 hover:underline">
                    Ir al dashboard
                </button>
            </div>
        )
    }

    // Caso 4: el repartidor va en camino hacia el cliente
    const restauranteCoords = [Number(pedido.restaurante.latitud), Number(pedido.restaurante.longitud)]
    const entregaCoords = [Number(pedido.latitudEntrega), Number(pedido.longitudEntrega)]

    let posicionMoto = restauranteCoords
    if (ruta && ruta.puntos) {
        const punto = obtenerPuntoEnRuta(ruta.puntos, pedido.fraccion)
        if (punto) {
            posicionMoto = punto
        }
    }

    let posicionesRuta = [restauranteCoords, entregaCoords]
    if (ruta && ruta.puntos) {
        posicionesRuta = ruta.puntos
    }

    // Armamos el texto con los productos del pedido, ej: "Pizza x2, Soda x1"
    let textoProductos = ''
    for (let i = 0; i < pedido.productos.length; i++) {
        if (i > 0) {
            textoProductos += ', '
        }
        textoProductos += pedido.productos[i].nombre + ' x' + pedido.productos[i].cantidad
    }

    return (
        <section className="text-white px-4 sm:px-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-lime-400 mb-6">Pedido activo</h1>

            <div className="bg-slate-700 rounded-2xl p-6">
                <h2 className="text-slate-200 font-semibold uppercase text-sm mb-4">Información actual del pedido</h2>

                <div className="rounded-xl overflow-hidden h-72 w-full mb-4">
                    <MapContainer center={entregaCoords} zoom={14} style={{ height:'100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={restauranteCoords} icon={iconoRestaurante} />
                        <Marker position={entregaCoords} icon={iconoCasa} />
                        <Marker position={posicionMoto} icon={iconoRepartidor} />
                        <Polyline positions={posicionesRuta} pathOptions={{ color: '#d60f0f', weight: 4 }} />
                        <AjustarVista puntos={[restauranteCoords, entregaCoords, posicionMoto]} />
                    </MapContainer>
                </div>

                {ruta && ruta.pasos.length > 0 && (
                    <button
                        onClick={function () { setMostrarPasos(!mostrarPasos) }}
                        className="text-lime-400 text-sm mb-3 hover:underline"
                    >
                        {mostrarPasos ? 'Ocultar indicaciones' : 'Ver indicaciones de la ruta'}
                    </button>
                )}

                {mostrarPasos && ruta && (
                    <ol className="text-slate-300 text-sm flex flex-col gap-1 mb-4 max-h-40 overflow-y-auto">
                        {ruta.pasos.map(function (paso, i) {
                            return (
                                <li key={i} className="flex justify-between border-b border-slate-600 py-1">
                                    <span>{paso.instruccion}</span>
                                    <span className="text-slate-400">{paso.distancia}</span>
                                </li>
                            )
                        })}
                    </ol>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                    <p><span className="text-slate-300">Cliente: </span>{pedido.cliente}</p>
                    <p><span className="text-slate-300">Producto y cantidad: </span>{textoProductos}</p>
                    <p><span className="text-slate-300">Distancia: </span>{Number(pedido.distanciaKm).toFixed(1)} km</p>
                    <p><span className="text-slate-300">Duración estimada: </span>{pedido.tiempoRestanteMin} min</p>
                    <p><span className="text-slate-300">Total de ganancia: </span>₡{Number(pedido.costoEnvio).toLocaleString('es-CR')}</p>
                </div>

                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={codigo}
                        onChange={function (e) { setCodigo(e.target.value) }}
                        placeholder="Código de entrega"
                        className="flex-1 bg-white rounded px-3 py-2 text-slate-800 text-sm"
                    />
                    <button
                        onClick={handleConfirmar}
                        disabled={confirmando || !codigo.trim()}
                        className="bg-lime-400 hover:bg-lime-300 disabled:bg-slate-500 disabled:cursor-not-allowed text-slate-900 font-bold px-6 py-2 rounded-full text-sm whitespace-nowrap"
                    >
                        {confirmando ? 'Confirmando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </section>
    )
}

export default PedidoActivo