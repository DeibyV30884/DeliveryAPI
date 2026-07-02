import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
    obtenerPerfilRestaurante,
    editarPerfilRestaurante,
    desactivarPerfilRestaurante,
    extraerCoordenadasRestaurante,
} from '../../api/usuarios'
import { useAuth } from '../../context/AuthContext'
import ubicacionIcon from '../../assets/ubicacion.png'

const iconoUbicacion = new L.Icon({
    iconUrl: ubicacionIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})

function ActualizarMapa(props) {
    const coords = props.coords
    const map = useMap()

    useEffect(() => {
        if (coords) {
            map.setView(coords, 15)
        }
    }, [coords, map])

    return null
}

function PerfilRestaurante() {
    const { cerrarSesion } = useAuth()

    const [perfil, setPerfil] = useState(null)

    const [formData, setFormData] = useState({
        telefono: '',
        email: '',
        password: '',
        nombreRestaurante: '',
        direccion: '',
        linkGoogleMaps: '',
    })

    const [coords, setCoords] = useState(null)

    const [error, setError] = useState('')
    const [exito, setExito] = useState('')
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        obtenerPerfilRestaurante()
            .then(function (res) {
                const d = res.data
                setPerfil(d)

                setFormData({
                    telefono: d.telefono || '',
                    email: d.email || '',
                    password: '',

                    nombreRestaurante: d.nombreRestaurante || '',
                    direccion: d.direccion || '',
                    linkGoogleMaps: d.linkGoogleMaps || '',
                })

                if (d.latitud && d.longitud) {
                    const lat = parseFloat(d.latitud)
                    const lng = parseFloat(d.longitud)
                    setCoords([lat, lng])
                }
            })
            .catch(function () {
                setError('No se pudo cargar el perfil')
            })
            .finally(function () {
                setCargando(false)
            })
    }, [])

    function handleChange(e) {
        const nombreCampo = e.target.name
        const valorCampo = e.target.value

        setFormData(function (prev) {
            const copia = { ...prev }
            copia[nombreCampo] = valorCampo
            return copia
        })
    }

    async function handleUbicar() {
        if (formData.linkGoogleMaps.trim() === '') {
            setError('Pega un link de Google Maps primero')
            return
        }

        setError('')

        try {
            const res = await extraerCoordenadasRestaurante(formData.linkGoogleMaps)
            const lat = res.data.lat
            const lng = res.data.lng
            setCoords([lat, lng])
            setExito('Ubicacion cargada. Guarda los cambios para confirmar.')
        } catch (e) {
            setError('No se pudieron extraer coordenadas del link. Verifique que sea un link válido de Google Maps.')
        }
    }

    async function handleGuardar() {
        setError('')
        setExito('')

        const payload = { ...formData }
        if (!payload.password || payload.password.trim() === '') {
            delete payload.password
        }

        try {
            await editarPerfilRestaurante(payload)
            setExito('Perfil actualizado correctamente')

            const res = await obtenerPerfilRestaurante()
            const d = res.data

            if (d.latitud && d.longitud) {
                const lat = parseFloat(d.latitud)
                const lng = parseFloat(d.longitud)
                setCoords([lat, lng])
            }
        } catch (err) {
            let mensaje = 'Error al guardar los cambios'
            if (err.response && err.response.data && err.response.data.mensaje) {
                mensaje = err.response.data.mensaje
            }
            setError(mensaje)
        }
    }

    async function handleEliminar() {
        const confirmar = confirm('¿Estás seguro que quiere eliminar su perfil? Esta acción no se puede deshacer.')
        if (!confirmar) {
            return
        }

        try {
            await desactivarPerfilRestaurante()
            cerrarSesion()
        } catch (err) {
            let mensaje = 'Error al eliminar el perfil'
            if (err.response && err.response.data && err.response.data.mensaje) {
                mensaje = err.response.data.mensaje
            }
            setError(mensaje)
        }
    }

    if (cargando) {
        return <p className="text-white">Cargando perfil...</p>
    }

    let centroMapa = [9.9281, -84.0907]
    if (coords) {
        centroMapa = coords
    }

    let zoomMapa = 8
    if (coords) {
        zoomMapa = 15
    }

    return (
        <div className="bg-slate-700 rounded-2xl p-6 w-full">
            <h1 className="text-4xl font-bold text-lime-400 mb-6">MI PERFIL</h1>

            {error && <p className="bg-red-100 text-red-800 rounded-lg px-4 py-2 text-sm mb-4">{error}</p>}
            {exito && <p className="bg-green-100 text-green-800 rounded-lg px-4 py-2 text-sm mb-4">{exito}</p>}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Columna izquierda */}

                <div className="flex flex-col gap-4">
                    <h2 className="text-white font-bold tracking-wide">INFORMACIÓN DEL NEGOCIO</h2>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Nombre del Restaurante</label>
                        <input name="nombreRestaurante" value={formData.nombreRestaurante} onChange={handleChange}
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Cédula Jurídica</label>
                        <input value={perfil ? perfil.cedulaJuridica : '' } disabled
                               className="w-full rounded-full px-4 py-2 outline-none bg-slate-500 text-slate-300 text-sm cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Teléfono</label>
                        <input name="telefono" value={formData.telefono} onChange={handleChange}
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>

                    <h2 className="text-white font-bold tracking-wide mt-2">DATOS DE ACCESO</h2>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Correo Electrónico</label>
                        <input name="email" value={formData.email} onChange={handleChange}
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Nueva Contraseña (opcional)</label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange}
                               placeholder="Dejar vacío para no cambiar"
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                </div>

                {/* Columna derecha — mapa  */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-white font-bold tracking-wide">UBICACIÓN</h2>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Dirección</label>
                        <input name="direccion" value={formData.direccion} onChange={handleChange}
                               placeholder="Ej: 200m norte de la iglesia"
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Link de Google Maps</label>
                        <input name="linkGoogleMaps" value={formData.linkGoogleMaps} onChange={handleChange}
                               placeholder="Pega aquí el link de Google Maps"
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                    <button onClick={handleUbicar}
                            className="self-start border border-white text-white rounded-full px-6 py-2 text-sm hover:bg-white hover:text-slate-700 transition">
                        Ubicar
                    </button>

                    <div className="rounded-xl overflow-hidden h-52 w-full">
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
                </div>

            </div>

            <div className="flex justify-between mt-6">
                <button onClick={handleEliminar}
                        className="border border-white text-white rounded-full px-6  py-2 text-sm hover:bg-red-600 hover:border-red-600 transition">
                    Eliminar Perfil
                </button>

                <button onClick={handleGuardar}
                        className="border border-white text-white rounded-full px-6 py-2 text-sm  hover:bg-white hover:text-slate-700 transition">
                    Guardar Cambios
                </button>

            </div>
        </div>
    )
}

export default PerfilRestaurante