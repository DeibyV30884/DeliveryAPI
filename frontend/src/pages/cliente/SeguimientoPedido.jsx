import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { obtenerHistorialPedidos, obtenerSeguimientoPedido } from '../../api/usuarios'

import motoIcon from '../../assets/moto-de-reparto.png'
import restauranteIconImg from '../../assets/restaurante.png'
import ubicacionIcon from '../../assets/ubicacion.png'

const iconoRestaurante = new L.Icon({
    iconUrl: restauranteIconImg,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})
const iconoCasa = new L.Icon({
    iconUrl: ubicacionIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})
const iconoRepartidor = new L.Icon({
    iconUrl: motoIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})

// Cada cuanto refrescamos el pedido mientras está "EnCamino" (ms)
const INTERVALO_REFRESCO_MS = 5000

// Esta función revisa que las coordenadas que nos llegaron sean validas.
// Una coordenada válida es un arreglo de 2 números, tipo [lat, lng]
function coordsValidas(arr) {
    const esArreglo = Array.isArray(arr)
    if (esArreglo == false) {
        return false
    }

    const tieneDosElementos = arr.length == 2
    if (tieneDosElementos == false) {
        return false
    }

    const lat = arr[0]
    const lng = arr[1]

    const latEsNumero = Number.isFinite(lat)
    const lngEsNumero = Number.isFinite(lng)

    if (latEsNumero == false) {
        return false
    }
    if (lngEsNumero == false) {
        return false
    }

    return true
}

// Consulta OSRM para obtener la ruta real siguiendo las calles entre dos puntos.
// OSRM espera lng,lat al reves de Leaflet entonces lo devolvemos ya convertido a [lat, lng].
async function obtenerRutaCalles(origen, destino) {
    try {
        const origenTexto = origen[1] + ','+ origen[0]
        const destinoTexto = destino[1] + ',' + destino[0]
        const coords = origenTexto + ';'+ destinoTexto

        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`

        const respuesta = await fetch(url)
        if (!respuesta.ok) {
            return null
        }

        const data = await respuesta.json()

        if (data.routes && data.routes[0]) {
            const puntosDeLaRuta = data.routes[0].geometry.coordinates.map(function (punto) {
                const lng = punto[0]
                const lat = punto[1]
                return [lat, lng]
            })
            return puntosDeLaRuta
        }

        return null
    } catch (error) {
        return null
    }
}

// Calcula la distancia en línea recta entre dos puntos [lat, lng].
// No es la distancia real en km, solo un número para comparar entre si.
function distanciaEntrePuntos(puntoA, puntoB) {
    const difLat = puntoB[0] - puntoA[0]
    const difLng = puntoB[1] - puntoA[1]
    return Math.sqrt(difLat * difLat + difLng * difLng)
}

// Recibe la ruta de calles con el array de puntos [lat,lng] y una fracción de 0 a 1,
// y devuelve el punto de la ruta que le corresponde a esa fraccion del viaje.
// Así la moto se mueve siguiendo la calle en vez de una linea recta.
function obtenerPuntoEnRuta(ruta, fraccion) {
    if (!ruta || ruta.length === 0) {
        return null
    }

    if (ruta.length === 1) {
        return ruta[0]
    }

    // Primero sumamos la distancia total de la ruta
    let distanciaTotal = 0
    for (let i = 0; i < ruta.length - 1; i++) {
        distanciaTotal = distanciaTotal + distanciaEntrePuntos(ruta[i], ruta[i + 1])
    }

    const distanciaObjetivo = distanciaTotal * fraccion

    let distanciaAcumulada = 0
    for (let i = 0; i < ruta.length - 1; i++) {

        const puntoInicio = ruta[i]
        const puntoFin = ruta[i + 1]
        const distanciaTramo = distanciaEntrePuntos(puntoInicio, puntoFin)

        if (distanciaAcumulada + distanciaTramo >= distanciaObjetivo) {
            let fraccionDelTramo = 0
            if (distanciaTramo > 0) {
                fraccionDelTramo = (distanciaObjetivo - distanciaAcumulada) / distanciaTramo
            }

            const lat = puntoInicio[0] + fraccionDelTramo * (puntoFin[0] - puntoInicio[0])
            const lng = puntoInicio[1] + fraccionDelTramo * (puntoFin[1] - puntoInicio[1])
            return [lat, lng]
        }

        distanciaAcumulada = distanciaAcumulada + distanciaTramo
    }

    return ruta[ruta.length - 1]
}

// Esto no dibuja nada, solo mueve la camara del mapa
// para que se vean bien todos los puntos que le pasemos
function AjustarVista({ puntos }) {
    const map = useMap()
    useEffect(() => {
        if (puntos.length > 0) {
            map.fitBounds(puntos, { padding: [30, 30] })
        }
    }, [puntos, map])
    return null
}

function SeguimientoPedido() {
    const [pedidosActivos, setPedidosActivos] = useState([])
    const [pedidoIdSeleccionado, setPedidoIdSeleccionado] = useState(null)
    const [pedido, setPedido] = useState(null)
    const [cargandoLista, setCargandoLista] = useState(true)
    const [cargandoDetalle, setCargandoDetalle] = useState(false)
    const [rutaCalles, setRutaCalles] = useState(null)

    // Al entrar a la pantalla, pedimos el historial completo y de ahí
    // sacamos solo los pedidos que todavía están en curso
    useEffect(() => {
        obtenerHistorialPedidos()
            .then(function (res) {
                const todosLosPedidos = res.data

                const pedidosEnCurso = []
                for (let i = 0; i < todosLosPedidos.length; i++) {
                    const p = todosLosPedidos[i]
                    if (p.estado !== 'Entregado' && p.estado !== 'Cancelado') {
                        pedidosEnCurso.push(p)
                    }
                }

                setPedidosActivos(pedidosEnCurso)

                if (pedidosEnCurso.length > 0) {
                    setPedidoIdSeleccionado(pedidosEnCurso[0].pedidoId)
                }
            })
            .finally(function () {
                setCargandoLista(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!pedidoIdSeleccionado) {
            return
        }

        setCargandoDetalle(true)
        setRutaCalles(null)

        obtenerSeguimientoPedido(pedidoIdSeleccionado)
            .then(function (res) {
                setPedido(res.data)
            })
            .finally(function () {
                setCargandoDetalle(false)
            })
    }, [pedidoIdSeleccionado])

    useEffect(() => {
        if (!pedido) {
            return
        }
        if (pedido.estado !== 'Entregado' && pedido.estado !== 'Cancelado') {
            return
        }

        const pedidosSinEsteYaTerminado = []
        for (let i = 0; i < pedidosActivos.length; i++) {
            const p = pedidosActivos[i]

            if (p.pedidoId !== pedido.pedidoId) {
                pedidosSinEsteYaTerminado.push(p)
            }
        }

        setPedidosActivos(pedidosSinEsteYaTerminado)

        if (pedidoIdSeleccionado === pedido.pedidoId) {
            if (pedidosSinEsteYaTerminado.length > 0) {
                setPedidoIdSeleccionado(pedidosSinEsteYaTerminado[0].pedidoId)
            } else {
                setPedidoIdSeleccionado(null)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedido && pedido.estado])

    // Mientras el pedido este "EnCamino" Y el repartidor todavia no haya llegado,
    // refrescamos su detalle cada cierto tiempo para que la simulación
    // se vaya actualizando sola. Apenas yaLlego sea true, dejamos de refrescar

    const yaLlegoElRepartidor = pedido && pedido.repartidor && pedido.repartidor.yaLlego

    useEffect(() => {
        if (!pedidoIdSeleccionado) {
            return
        }
        if (!pedido || pedido.estado !== 'EnCamino') {
            return
        }
        if (yaLlegoElRepartidor) {
            return
        }

        const intervalo = setInterval(function () {
            obtenerSeguimientoPedido(pedidoIdSeleccionado).then(function (res) {
                setPedido(res.data)
            })
        }, INTERVALO_REFRESCO_MS)

        return function () {
            clearInterval(intervalo)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedidoIdSeleccionado, pedido && pedido.estado, yaLlegoElRepartidor])

    // Sacamos las coordenadas del restaurante
    let puntosRestaurante = null
    if (pedido && pedido.restaurante) {
        const lat = Number(pedido.restaurante.latitud)
        const lng = Number(pedido.restaurante.longitud)
        puntosRestaurante = [lat, lng]
    }

    // Sacamos las coordenadas de entrega
    let puntosEntrega = null
    if (pedido) {
        const lat = Number(pedido.latitudEntrega)
        const lng = Number(pedido.longitudEntrega)
        puntosEntrega = [lat, lng]
    }

    // Revisamos si hay que mostrar al repartidor en el mapa:
    // solo si el pedido está "EnCamino", tiene repartidor asignado,
    // y ese repartidor tiene coordenadas validas
    let mostrarRepartidor = false
    let puntosRepartidor = null

    if (pedido && pedido.estado === 'EnCamino' && pedido.repartidor) {

        const fraccionViaje = pedido.repartidor.fraccion

        let coordsDelRepartidor = null

        if (pedido.repartidor.yaLlego) {
            // Si ya llego lo ponemos exacto en el pin de entrega, para que no se
            // vea desviado por OSRM en la calle.
            coordsDelRepartidor = puntosEntrega
        } else if (rutaCalles && fraccionViaje != null) {

            coordsDelRepartidor = obtenerPuntoEnRuta(rutaCalles, fraccionViaje)
        } else {
            const latRepartidor = Number(pedido.repartidor.latitudActual)
            const lngRepartidor = Number(pedido.repartidor.longitudActual)
            coordsDelRepartidor = [latRepartidor, lngRepartidor]
        }

        if (coordsValidas(coordsDelRepartidor)) {
            mostrarRepartidor = true
            puntosRepartidor = coordsDelRepartidor
        }
    }

    const hayCoordsParaMapa =  coordsValidas(puntosRestaurante) && coordsValidas(puntosEntrega)

    useEffect(() => {
        if (!hayCoordsParaMapa) {
            setRutaCalles(null)
            return
        }

        let cancelado = false
        obtenerRutaCalles(puntosRestaurante, puntosEntrega).then(function (rutaEncontrada) {
            if (!cancelado) {
                setRutaCalles(rutaEncontrada)
            }
        })

        return function () {
            cancelado = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedido && pedido.pedidoId])

    if (cargandoLista) {
        return <p className="text-slate-300">Cargando seguimiento...</p>
    }

    if (pedidosActivos.length === 0)  {
        return (
            <div className="text-center mt-20">
                <p className="text-slate-300 mb-4">No tienes ningún pedido en curso </p>

                <Link to="/cliente/restaurantes" className="text-lime-400 hover:underline">
                    Explorar restaurantes
                </Link>
            </div>
        )
    }

    // Juntamos todos los puntos validos que tengamos, para que el mapa
    // ajuste el zoom y se vean todos a la vez
    const todosLosPuntosPosibles = [puntosRestaurante, puntosEntrega, puntosRepartidor]
    const todosLosPuntos = []
    for (let i = 0; i < todosLosPuntosPosibles.length; i++) {
        const punto = todosLosPuntosPosibles[i]
        if (coordsValidas(punto)) {
            todosLosPuntos.push(punto)
        }
    }

    // Si OSRM ya nos dio la ruta por calles, la usamos.
    // Si no responde o falló, caemos de vuelta a una linea recta como respaldo.
    let posicionesRuta = []
    if (rutaCalles) {
        posicionesRuta = rutaCalles
    } else if (mostrarRepartidor) {
        posicionesRuta = [puntosRestaurante, puntosRepartidor, puntosEntrega]
    } else {
        posicionesRuta = [puntosRestaurante, puntosEntrega]
    }
    // Estos textos solo los calculamos si ya tenemos el pedido cargado, mientras estan vacios
    let textoDistancia = ''
    let textoTiempoEstimado = '—'
    let textoTotal = ''
    let nombreRestaurante = '—'
    let mensajeSinRepartidor = ''

    if (pedido) {
        // Texto de distancia: "3.42 kilometros"
        let distanciaKm = 0
        if (pedido.distanciaKm) {
            distanciaKm = pedido.distanciaKm
        }
        textoDistancia = Number(distanciaKm).toFixed(2) + ' kilómetros'

        // Texto de tiempo estimado: si el pedido ya esta en camino y el backend
        // nos manda el tiempo restante calculado, lo usamos sino, el estimado original.
        if (pedido.estado === 'EnCamino' && pedido.repartidor && pedido.repartidor.tiempoRestanteMin != null) {
            textoTiempoEstimado = pedido.repartidor.tiempoRestanteMin + ' min restantes'
        } else if (pedido.tiempoEstimadoMin) {
            textoTiempoEstimado = pedido.tiempoEstimadoMin + ' min'
        }

        let total = 0
        if (pedido.total) {
            total = pedido.total
        }
        textoTotal = '₡' + Number(total).toLocaleString('es-CR')

        if (pedido.restaurante && pedido.restaurante.nombreRestaurante) {
            nombreRestaurante = pedido.restaurante.nombreRestaurante
        }

        if (pedido.estado === 'Pendiente') {
            mensajeSinRepartidor = 'Esperando que el restaurante asigne un repartidor.'
        } else if (pedido.estado === 'EnCamino' && pedido.repartidor && pedido.repartidor.yaLlego) {
            mensajeSinRepartidor = 'El repartidor ya llegó a tu ubicación.'
        } else if (pedido.estado === 'EnCamino') {
            mensajeSinRepartidor = 'El repartidor va en camino hacia tu ubicación.'
        } else if (pedido.estado === 'Entregado') {
            mensajeSinRepartidor = 'Este pedido ya fue entregado.'
        } else if (pedido.estado === 'Cancelado') {
            mensajeSinRepartidor = 'Este pedido fue cancelado.'
        } else {
            mensajeSinRepartidor = 'El repartidor aún no ha iniciado el viaje.'
        }
    }

    return (
        <section>
            <h1 className="text-4xl font-bold text-lime-400 mb-6">Seguimiento de Pedido</h1>

            {pedidosActivos.length > 1 && (
                <div className="flex gap-2 mb-6 overflow-x-auto flex-nowrap pb-2 -mx-1 px-1">
                    {pedidosActivos.map((p) => {
                        const estaSeleccionado = pedidoIdSeleccionado === p.pedidoId


                        let claseBoton = 'shrink-0 whitespace-nowrap px-4 py-2 rounded-full border text-xs sm:text-sm transition '
                        if (estaSeleccionado) {

                            claseBoton = claseBoton + 'bg-lime-400 text-slate-900 border-lime-400'
                        } else {
                            claseBoton = claseBoton + 'border-slate-500 text-slate-200 hover:border-lime-400'
                        }

                        return (
                            <button
                                key={p.pedidoId}
                                onClick={() => setPedidoIdSeleccionado(p.pedidoId)}
                                className={claseBoton}
                            >
                                #{p.pedidoId} ·{p.nombreRestaurante} · {p.estado}
                            </button>
                        )
                    })}
                </div>
            )}

            {cargandoDetalle || !pedido ? (
                <p className="text-slate-300">Cargando detalle...</p>
            ) : (
                <div className="bg-slate-700 rounded-2xl p-6 grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                        <Campo label="Hora y Fecha de pedido" valor={new Date(pedido.fechaPedido).toLocaleString('es-CR')} />
                        <Campo label="Distancia Km" valor={textoDistancia} />
                        <Campo label="Tiempo estimado" valor={textoTiempoEstimado} />
                        <Campo label="Estado" valor={pedido.estado} />
                        <Campo label="Código confirmación" valor={pedido.codigoConfirmacion} />
                        <Campo label="Total" valor={textoTotal} />
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-slate-300 text-sm">
                            Restaurante: <span className="text-white font-semibold">{nombreRestaurante}</span>
                        </p>

                        <div className="relative isolate rounded-xl overflow-hidden h-56 md:h-64 w-full border border-slate-700">
                            {hayCoordsParaMapa ? (
                                <MapContainer
                                    center={puntosEntrega}
                                    zoom={14}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                    <Marker position={puntosRestaurante} icon={iconoRestaurante} />
                                    <Marker position={puntosEntrega} icon={iconoCasa} />


                                    {mostrarRepartidor && <Marker position={puntosRepartidor} icon={iconoRepartidor} />}

                                    <Polyline positions={posicionesRuta} pathOptions={{ color: '#d60f0f', weight: 4 }} />

                                    <AjustarVista puntos={todosLosPuntos}  />
                                </MapContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm bg-slate-800 text-center px-4">
                                    No hay coordenadas disponibles para mostrar el mapa.
                                </div>
                            )}
                        </div>

                        {mensajeSinRepartidor && (
                            <p className="text-slate-400 text-sm">
                                {mensajeSinRepartidor}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}

function Campo({ label, valor }) {
    return (
        <div>
            <label className="text-slate-300 text-sm">{label}</label>
            <div className="bg-white rounded px-3 py-2">{valor}</div>
        </div>
    )
}

export default SeguimientoPedido