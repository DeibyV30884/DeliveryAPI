import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { obtenerRepartidoresUbicacion } from '../../api/usuarios'
import { obtenerRutaConPasos, obtenerPuntoEnRuta } from '../../utils/rutaOsrm'

import motoIcon from '../../assets/moto-de-reparto.png'
import restauranteIconImg from '../../assets/restaurante.png'

const iconoRestaurante = new L.Icon({ iconUrl: restauranteIconImg, iconSize: [42, 42], iconAnchor: [21, 42] })
const iconoRepartidor = new L.Icon({ iconUrl: motoIcon, iconSize: [38, 38], iconAnchor: [19, 38] })

// Cada cuanto se refresca la posición de todos los repartidores
const INTERVALO_REFRESCO_MS = 5000

// Este componente solo sirve para acomodar el zoom del mapa la primera vez
// que se cargan los puntos. Usamos un "ref" para acordarnos de si ya lo
// hicimos, porque si ajustamos el mapa en cada refresco, se pondría a saltar
// solo y el restaurante no podría hacer zoom ni mover el mapa tranquilo.
function AjustarVistaInicial(props) {
    const puntos = props.puntos
    const map = useMap()
    const yaAjustado = useRef(false)

    useEffect(() => {
        if (yaAjustado.current === false && puntos.length > 0) {
            map.fitBounds(puntos, { padding: [50, 50] })
            yaAjustado.current = true
        }
    }, [puntos, map])

    return null
}

// Devuelve las clases de color segun el estado del repartidor
function obtenerClaseEstado(estado) {
    if (estado === 'En camino') {
        return 'border-blue-400 bg-blue-400 text-slate-900'
    }
    if (estado === 'Regresando') {
        return 'border-amber-400 bg-amber-400 text-slate-900'
    }
    return 'border-white bg-white text-slate-800'
}

function MapaRepartidores() {
    const [restaurante, setRestaurante] = useState(null)
    const [repartidores, setRepartidores] = useState([])
    const [rutas, setRutas] = useState({}) // repartidorId -> arreglo de puntos [lat, lng]

    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    // Guarda que ruta ya se pidio para cada repartidor, para no volver a
    // pedirla en cada refresco si sigue siendo el mismo viaje
    const clavesRutaRef = useRef({})

    async function cargarUbicaciones() {
        try {
            setError('')
            const res = await obtenerRepartidoresUbicacion()
            setRestaurante(res.data.restaurante)

            let listaRepartidores = res.data.repartidores
            if (!listaRepartidores) {
                listaRepartidores = []
            }
            setRepartidores(listaRepartidores)
        } catch (err) {
            let mensaje = 'No se pudieron cargar las ubicaciones de los repartidores.'
            if (err.response && err.response.data && err.response.data.mensaje) {
                mensaje = err.response.data.mensaje
            }
            setError(mensaje)
        }
        setCargando(false)
    }

    useEffect(() => {
        cargarUbicaciones()
        const intervalo = setInterval(cargarUbicaciones, INTERVALO_REFRESCO_MS)
        return function () {
            clearInterval(intervalo)
        }
    }, [])

    // Cada vez que llega una nueva lista de repartidores, revisamos si alguno
    // tiene un viaje nuevo (o cambio de estado) y le pedimos la ruta real a OSRM
    useEffect(() => {
        repartidores.forEach(function (r) {
            if (r.estado === 'En local') {
                return
            }
            if (!r.origen || !r.destino) {
                return
            }

            let idPedido = 'regreso'
            if (r.pedidoId) {
                idPedido = r.pedidoId
            }
            const clave = r.repartidorId + '-' + r.estado + '-' + idPedido

            if (clavesRutaRef.current[r.repartidorId] === clave) {
                return
            }
            clavesRutaRef.current[r.repartidorId] = clave

            const origen = [Number(r.origen.latitud), Number(r.origen.longitud)]
            const destino = [Number(r.destino.latitud), Number(r.destino.longitud)]

            obtenerRutaConPasos(origen, destino).then(function (resultado) {
                setRutas(function (prev) {
                    const nuevo = { ...prev }
                    nuevo[r.repartidorId] = resultado.puntos
                    return nuevo
                })
            })
        })

        // Limpiamos las rutas de repartidores que ya volvieron al local,
        // para que la proxima vez que salgan se calcule una ruta fresca
        setRutas(function (prev) {
            const idsEnViaje = []
            repartidores.forEach(function (r) {
                if (r.estado !== 'En local') {
                    idsEnViaje.push(r.repartidorId)
                }
            })

            const limpio = {}
            for (const id in prev) {
                if (idsEnViaje.indexOf(Number(id)) !== -1) {
                    limpio[id] = prev[id]
                }
            }
            return limpio
        })
    }, [repartidores])

    // Calcula donde dibujar el marcador de cada repartidor ahora mismo
    function posicionActual(r) {
        if (r.estado === 'En local' && restaurante) {
            return [Number(restaurante.latitud), Number(restaurante.longitud)]
        }

        const puntosRuta = rutas[r.repartidorId]
        if (puntosRuta) {
            const punto = obtenerPuntoEnRuta(puntosRuta, r.fraccion)
            if (punto) {
                return punto
            }
        }

        // Mientras no tengamos la ruta real todavia, interpolamos en linea
        // recta como respaldo
        if (r.origen && r.destino) {
            const origen = [Number(r.origen.latitud), Number(r.origen.longitud)]
            const destino = [Number(r.destino.latitud), Number(r.destino.longitud)]
            const lat = origen[0] + r.fraccion * (destino[0] - origen[0])
            const lng = origen[1] + r.fraccion * (destino[1] - origen[1])
            return [lat, lng]
        }

        return null
    }

    if (cargando) {
        return <p className="text-slate-300 px-4">Cargando mapa de repartidores...</p>
    }

    let centroRestaurante = [9.9333, -84.0833]
    if (restaurante) {
        centroRestaurante = [Number(restaurante.latitud), Number(restaurante.longitud)]
    }

    // Juntamos todos los puntos que vamos a mostrar, solo para el ajuste
    // inicial del zoom
    const puntosParaAjustar = [centroRestaurante]
    repartidores.forEach(function (r) {
        const posicion = posicionActual(r)
        if (posicion) {
            puntosParaAjustar.push(posicion)
        }
    })

    let nombreRestaurante = 'Tu restaurante'
    if (restaurante && restaurante.nombreRestaurante) {
        nombreRestaurante = restaurante.nombreRestaurante
    }

    return (
        <section className="text-white px-4 sm:px-0">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-lime-300 mb-6 sm:mb-8">Mapa de Repartidores</h1>

                {error && (
                    <p className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">{error}</p>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
                    <div className="rounded-2xl overflow-hidden border border-slate-700 h-[70vh] min-h-[420px]">
                        <MapContainer center={centroRestaurante} zoom={14} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            <Marker position={centroRestaurante} icon={iconoRestaurante}>
                                <Popup>{nombreRestaurante}</Popup>
                            </Marker>

                            {repartidores.map(function (r) {
                                const posicion = posicionActual(r)
                                if (!posicion) {
                                    return null
                                }

                                const puntosRuta = rutas[r.repartidorId]

                                return (
                                    <div key={r.repartidorId}>
                                        {puntosRuta && (
                                            <Polyline
                                                positions={puntosRuta}
                                                pathOptions={{ color: '#d60f0f', weight: 4 }}
                                            />
                                        )}
                                        <Marker position={posicion} icon={iconoRepartidor}>
                                            <Popup>
                                                <span className="font-semibold">{r.nombre}</span>
                                                <br />
                                                {r.estado}
                                                {r.tiempoRestanteMin !== null && r.tiempoRestanteMin !== undefined && (
                                                    <>
                                                        <br />
                                                        Llega en {r.tiempoRestanteMin} min
                                                    </>
                                                )}
                                            </Popup>
                                        </Marker>
                                    </div>
                                )
                            })}

                            <AjustarVistaInicial puntos={puntosParaAjustar} />
                        </MapContainer>
                    </div>

                    <div className="rounded-2xl border border-slate-700 bg-slate-700 p-5 flex flex-col gap-4">
                        <h2 className="text-base sm:text-lg font-semibold uppercase text-white">Repartidores</h2>

                        {repartidores.length === 0 ? (
                            <p className="text-slate-300 text-sm">No tienes repartidores activos en este momento.</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {repartidores.map(function (r) {
                                    return (
                                        <li
                                            key={r.repartidorId}
                                            className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium text-sm">{r.nombre}</span>
                                                <span
                                                    className={
                                                        'rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ' +
                                                        obtenerClaseEstado(r.estado)
                                                    }
                                                >
                                                    {r.estado}
                                                </span>
                                            </div>

                                            {r.tiempoRestanteMin !== null && r.tiempoRestanteMin !== undefined && (
                                                <p className="mt-2 text-xs text-slate-300">
                                                    Llega en {r.tiempoRestanteMin} min
                                                </p>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default MapaRepartidores