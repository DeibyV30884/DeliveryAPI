import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import {
    previsualizarPedido,
    crearPedido,
    extraerCoordenadas,
    obtenerPerfilCliente,
} from '../../api/usuarios'

import ubicacionIcon from '../../assets/ubicacion.png'
import { useSaldo } from '../../context/SaldoContext'



const iconoUbicacion = new L.Icon({
    iconUrl: ubicacionIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})

function ActualizarMapa({ coords }) {
    const map = useMap()
    useEffect(() => {
        if (coords) map.setView(coords, 15)
    }, [coords, map])
    return null
}

function ConfirmarPedido() {
    const { refrescarSaldo } = useSaldo()
    const location = useLocation()
    const navigate = useNavigate()

    const { producto, cantidad, restauranteId, nombreRestaurante } = location.state ?? {}

    const [perfilCliente, setPerfilCliente] = useState(null)
    const [modoDireccion, setModoDireccion] = useState('predeterminada') // 'predeterminada' | 'nueva'

    const [linkMaps, setLinkMaps] = useState('')
    const [coords, setCoords] = useState(null)
    const [direccionTexto, setDireccionTexto] = useState('')
    const [notaCliente, setNotaCliente] = useState('')

    const [resumen, setResumen] = useState(null)
    const [cargandoResumen, setCargandoResumen] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!producto) {
            navigate('/cliente/restaurantes', { replace: true })
        }
    }, [producto, navigate])

    // Carga la dirección predeterminada del cliente al entrar
    useEffect(() => {
        obtenerPerfilCliente()
            .then((res) => {
                const d = res.data
                setPerfilCliente(d)

                if (d.latitudPredeterminada && d.longitudPredeterminada) {
                    setCoords([Number(d.latitudPredeterminada), Number(d.longitudPredeterminada)])
                    setDireccionTexto(d.direccionPredeterminada || '')
                }
            })
            .catch(() => {
                // Si no tiene dirección predeterminada, simplemente lo mandamos a poner una nueva
                setModoDireccion('nueva')
            })
    }, [])

    // Cada vez que cambien las coordenadas de entrega, se recalcula el preview
    useEffect(() => {
        if (!coords) return

        setCargandoResumen(true)
        setError('')

        previsualizarPedido({
            restauranteId: Number(restauranteId),
            latitudEntrega: coords[0],
            longitudEntrega: coords[1],
            productos: [{ productoId: producto.productoId, cantidad }],
        })

            .then((res) => setResumen(res.data))
            .catch((err) =>
                setError(err.response?.data?.mensaje || 'No se pudo calcular el pedido.')
            )
            .finally(() => setCargandoResumen(false))
    }, [coords, restauranteId, producto, cantidad])

    function handleSeleccionarPredeterminada() {
        setModoDireccion('predeterminada')
        if (perfilCliente?.latitudPredeterminada && perfilCliente?.longitudPredeterminada) {
            setCoords([Number(perfilCliente.latitudPredeterminada), Number(perfilCliente.longitudPredeterminada)])
            setDireccionTexto(perfilCliente.direccionPredeterminada || '')
        }
    }

    async function handleUbicar() {
        if (!linkMaps.trim()) return
        setError('')
        try {
            const res = await extraerCoordenadas(linkMaps)
            // OJO: el endpoint devuelve lat/lng, igual que extraerCoordenadasRestaurante
            setCoords([res.data.lat, res.data.lng])
            setDireccionTexto(linkMaps)
        } catch {
            setError('No se pudo obtener la ubicación de ese link. Verifique que sea un link valido de Google Maps.')
        }
    }

    async function handleFinalizarCompra() {
        if (!coords) {
            setError('Primero define una dirección de entrega.')
            return
        }

        setEnviando(true)
        setError('')

        try {
            await crearPedido({
                restauranteId: Number(restauranteId),
                direccionEntrega: direccionTexto,
                latitudEntrega: coords[0],
                longitudEntrega: coords[1],
                notaCliente,
                productos: [{ productoId: producto.productoId, cantidad }],
            })

            await refrescarSaldo()
            navigate('/cliente/seguimiento')

        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo completar la compra.')
            setEnviando(false)
        }
    }

    const formatoPrecio = (valor) => `₡${Number(valor).toLocaleString('es-CR')}`

    if (!producto) return null

    let centroMapa = [9.9281, -84.0907]
    let zoomMapa = 8
    if (coords) {
        centroMapa = coords
        zoomMapa = 15
    }

    return (
        <section>
            <button
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-lime-400 hover:text-lime-400"
            >
                <ArrowLeft size={16} />
                Volver
            </button>

            <h1 className="text-4xl font-bold text-lime-400 mb-8">Confirmar pedido</h1>

            <div className="bg-slate-700 rounded-2xl p-6 grid md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-slate-300 text-sm">Nombre</label>
                        <div className="bg-white rounded px-3 py-2">{producto.nombre}</div>
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm">Descripción</label>
                        <div className="bg-white rounded px-3 py-2 min-h-[70px]">
                            {producto.descripcion || 'Sin descripción'}
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm">Cantidad</label>
                        <div className="bg-white rounded px-3 py-2">{cantidad}</div>
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm">Nota para restaurante</label>
                        <input
                            type="text"
                            value={notaCliente}
                            onChange={(e) => setNotaCliente(e.target.value)}
                            placeholder="Ej: sin salsa de tomate por favor"
                            className="w-full bg-white rounded px-3 py-2"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-slate-300 text-sm">Dirección de entrega</label>

                    <div className="flex gap-2 text-sm">
                        <button
                            type="button"
                            onClick={handleSeleccionarPredeterminada}
                            disabled={!perfilCliente?.latitudPredeterminada}
                            className={`px-4 py-2 rounded-full border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                modoDireccion === 'predeterminada'
                                    ? 'bg-lime-400 text-slate-900 border-lime-400'
                                    : 'border-slate-500 text-slate-200'
                            }`}
                        >
                            Usar mi dirección predeterminada
                        </button>
                        <button
                            type="button"
                            onClick={() => setModoDireccion('nueva')}
                            className={`px-4 py-2 rounded-full border transition ${
                                modoDireccion === 'nueva'
                                    ? 'bg-lime-400 text-slate-900 border-lime-400'
                                    : 'border-slate-500 text-slate-200'
                            }`}
                        >
                            Usar otra dirección
                        </button>
                    </div>

                    {modoDireccion === 'predeterminada' && perfilCliente?.direccionPredeterminada && (
                        <p className="text-slate-300 text-sm">{perfilCliente.direccionPredeterminada}</p>
                    )}

                    {modoDireccion === 'nueva' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={linkMaps}
                                onChange={(e) => setLinkMaps(e.target.value)}
                                placeholder="Pega aquí el link de Google Maps"
                                className="flex-1 bg-white rounded px-3 py-2 text-sm"
                            />
                            <button
                                onClick={handleUbicar}
                                className="bg-slate-500 hover:bg-slate-400 text-white px-4 rounded-lg text-sm"
                            >
                                Ubicar
                            </button>
                        </div>
                    )}

                    <div className="rounded-xl overflow-hidden h-44 w-full">
                        <MapContainer
                            center={centroMapa}
                            zoom={zoomMapa}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}

                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {coords && (

                                <>
                                    <Marker position={coords} icon={iconoUbicacion} />
                                    <ActualizarMapa coords={coords} />
                                </>
                            )}
                        </MapContainer>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4 flex flex-col gap-2 mt-1">
                        {cargandoResumen && <p className="text-slate-300 text-sm">Calculando...</p>}

                        {resumen && !cargandoResumen && (
                            <>
                                <div className="flex justify-between text-slate-200 text-sm">
                                    <span>Tiempo estimado de entrega</span>
                                    <span>{resumen.tiempoEstimadoMin} min</span>
                                </div>
                                <div className="flex justify-between text-slate-200 text-sm">
                                    <span>Sub Total</span>
                                    <span>{formatoPrecio(resumen.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-200 text-sm">
                                    <span>Costo de envío</span>
                                    <span>{formatoPrecio(resumen.costoEnvio)}</span>

                                </div>
                                <div className="flex justify-between text-lime-400 font-bold text-lg border-t border-slate-600 pt-2 mt-1">
                                    <span>Total</span>
                                    <span>{formatoPrecio(resumen.total)}</span>
                                </div>

                                {!resumen.saldoSuficiente && (
                                    <p className="text-red-400 text-sm mt-1">Saldo insuficiente para este pedido.</p>
                                )}
                            </>
                        )}
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        onClick={handleFinalizarCompra}
                        disabled={enviando || !resumen || !resumen.saldoSuficiente}
                        className="self-end bg-lime-500 hover:bg-lime-400 disabled:bg-slate-500 disabled:cursor-not-allowed text-slate-900 font-bold px-8 py-3 rounded-full"
                    >
                        {enviando ? 'Procesando...' : 'Finalizar Compra'}
                    </button>
                </div>
            </div>
        </section>
    )
}

export default ConfirmarPedido