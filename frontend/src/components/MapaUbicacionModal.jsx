import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X } from 'lucide-react'

import restauranteIconImg from '../assets/restaurante.png'
import ubicacionIcon from '../assets/ubicacion.png'

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

// Aqui se revisa que las coordenadas que nos llegaron sean validas
function coordsValidas(arr) {

    const esArreglo = Array.isArray(arr)
    if (esArreglo == false) {
        return false
    }

    const tieneDosElementos = arr.length == 2
    if (tieneDosElementos == false ) {
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

// Esta funcion le pregunta al servicio de OSRM cual es la ruta por calles entre el origen y el destino.
async function obtenerRutaCalles(origen, destino) {
    try {
        // OSRM necesita las coordenadas en formato "lng,lat", hay queu darle vuelva porque se esta guardando al revez
        const origenTexto = origen[1] + ',' + origen[0]
        const destinoTexto = destino[1] + ',' + destino[0]
        const coords = origenTexto + ';' + destinoTexto

        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`


        const respuesta = await fetch(url)

        if (!respuesta.ok) {
            return null
        }

        const data = await respuesta.json()

        // Si se devolvio al menos una ruta, se usa esa
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

function AjustarVista({ puntos }) {
    const map = useMap()

    useEffect(() => {
        if (puntos.length > 0) {
            map.fitBounds(puntos, { padding: [30, 30] })
        }
    }, [puntos, map])

    return null
}

// Modal que muestra el mapa con la ruta entre el restaurante de origen y la casa del cliente de destino
// origen y destino vienen como [lat, lng]
// nombreRestaurante es opcional, solo se usa para mostrarlo en el titulo
function MapaUbicacionModal({ abierto, onClose, origen, destino, nombreRestaurante }) {
    // Aquí guardamos los puntos de la ruta que nos devuelva OSRM
    const [ruta, setRuta] = useState(null)

    const hayCoords = coordsValidas(origen) && coordsValidas(destino)

    useEffect(() => {
        // Si el modal está cerrado o no tenemos coordenadas validas, no pedimos la ruta
        if (!abierto || !hayCoords) {
            setRuta(null)
            return
        }

        let cancelado = false

        obtenerRutaCalles(origen, destino).then(function (rutaEncontrada) {
            if (!cancelado) {
                setRuta(rutaEncontrada)
            }
        })

        return function () {
            cancelado = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [abierto, origen, destino])

    // Si el modal no está abierto, no mostramos nada
    if (!abierto) {
        return null
    }

    // Si ya tenemos la ruta calculada por calles, la usamos.
    // Si no, dibujamos una línea recta entre origen y destino, eso si hay coordenadas
    let posiciones = []
    if (ruta) {
        posiciones = ruta
    } else if (hayCoords) {
        posiciones = [origen, destino]
    }

    let tituloModal = 'Ubicación de entrega'
    if (nombreRestaurante) {
        tituloModal = 'Ruta desde ' + nombreRestaurante
    }

    // Usamos una ventana para que el modal se dibuje directamente en el <body>
    // y no quede atrapado dentro de otros contenedores con overflow o z-index raros
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

                {/* Encabezado del modal con el título y el boton de cerrar */ }
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold">
                        {tituloModal}

                    </h3>
                    <button onClick={onClose} className="text-slate-300 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Contenedor del mapa */}
                <div className="h-96 w-full">
                    {hayCoords ? (
                        <MapContainer center={destino} zoom={14} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {/* marcador del restaurante de origen */}
                            <Marker position={origen} icon={iconoRestaurante} />

                            {/*  marcador de la casa del cliente, el destino */}
                            <Marker position={destino} icon={iconoCasa} />

                            {/* Linea que dibuja la ruta entre los dos puntos  */}
                            <Polyline positions={posiciones} pathOptions={{ color: '#850202', weight: 4 }} />

                            {/* Este componente ajusta el zoom para que se vean ambos puntos */}
                            <AjustarVista puntos={[origen, destino]} />
                        </MapContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm px-4 text-center">
                            No hay coordenadas disponibles para mostrar el mapa.
                        </div>
                    )}
                </div>

            </div>
        </div>,

        document.body
    )
}

export default MapaUbicacionModal