import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
    obtenerPerfilRestaurante,
    editarPerfilRestaurante,
    desactivarPerfilRestaurante,
    extraerCoordenadasRestaurante,
    subirImagenRestaurante,
} from '../../api/usuarios'
import { useAuth } from '../../context/AuthContext'
import ubicacionIcon from '../../assets/ubicacion.png'

const iconoUbicacion = new L.Icon({
    iconUrl: ubicacionIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

function Toggle({ checked, onChange }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-400 rounded-full peer-checked:bg-lime-400 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
        </label>
    )
}


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
        imagenUrl: '',
    })

    const [previewUrl, setPreviewUrl] = useState('')
    const [subiendoImagen, setSubiendoImagen] = useState(false)

    const [horarios, setHorarios] = useState(
        DIAS_SEMANA.map((dia) => ({ dia, abierto: false, horaApertura: '', horaCierre: '' }))
    )

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
                    imagenUrl: d.imagenUrl || '',
                })

                setPreviewUrl(d.imagenUrl || '')

                if (d.horarios) {
                    setHorarios(
                        d.horarios.map((h) => ({
                            dia: h.dia,
                            abierto: h.abierto,
                            horaApertura: h.horaApertura ? h.horaApertura.slice(0, 5) : '',
                            horaCierre: h.horaCierre ? h.horaCierre.slice(0, 5) : '',
                        }))
                    )
                }

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

    function handleToggleDia(dia) {
        setHorarios((prev) =>
            prev.map((h) => (h.dia === dia ? { ...h, abierto: !h.abierto } : h))
        )
    }


    function handleHorarioChange(dia, campo, valor) {
        setHorarios((prev) =>
            prev.map((h) => (h.dia === dia ? { ...h, [campo]: valor } : h))
        )
    }

    async function handleArchivoChange(e) {
        const archivo = e.target.files[0]
        if (!archivo) return

        setPreviewUrl(URL.createObjectURL(archivo))
        setError('')
        setSubiendoImagen(true)

        try {
            const res = await subirImagenRestaurante(archivo)
            setFormData((prev) => ({ ...prev, imagenUrl: res.data.url }))
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo subir la imagen')
        } finally {
            setSubiendoImagen(false)
        }
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

        if (subiendoImagen) {
            setError('Espera a que termine de subir la imagen')
            return
        }

        const payload = { ...formData, horarios: horarios.map((h) => ({
                dia: h.dia,
                abierto: h.abierto,
                horaApertura: h.abierto && h.horaApertura ? `${h.horaApertura}:00` : null,
                horaCierre: h.abierto && h.horaCierre ? `${h.horaCierre}:00` : null,
            })),
        }
        if (!payload.password || payload.password.trim() === '') {
            delete payload.password
        }

        try {
            await editarPerfilRestaurante(payload)
            setExito('Perfil actualizado correctamente')

            const res = await obtenerPerfilRestaurante()
            const d = res.data

            setFormData((prev) => ({ ...prev, imagenUrl: d.imagenUrl || '' }))
            setPreviewUrl(d.imagenUrl || '')

            if (d.horarios) {
                setHorarios(
                    d.horarios.map((h) => ({
                        dia: h.dia,
                        abierto: h.abierto,
                        horaApertura: h.horaApertura ? h.horaApertura.slice(0, 5) : '',
                        horaCierre: h.horaCierre ? h.horaCierre.slice(0, 5) : '',
                    }))
                )
            }

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
                        <label className="text-slate-300 text-xs mb-1 block">Imagen del restaurante</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleArchivoChange}
                            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-lime-400 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-slate-900 hover:file:bg-lime-300"
                        />
                        {subiendoImagen && (
                            <p className="mt-2 text-xs text-lime-300">Subiendo imagen...</p>
                        )}
                        {previewUrl && !subiendoImagen && (
                            <img
                                src={previewUrl}
                                alt="Vista previa"
                                className="mt-3 h-24 w-24 rounded-xl object-cover"
                            />
                        )}
                    </div>

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

                    <h2 className="text-white font-bold tracking-wide mt-2">HORARIO DE OPERACIÓN</h2>
                    <div className="flex flex-col gap-2">
                        {horarios.map((h) => (
                            <div key={h.dia} className="flex items-center gap-3 text-white text-sm">
                                <span className="w-20 shrink-0">{h.dia}:</span>
                                <Toggle checked={h.abierto} onChange={() => handleToggleDia(h.dia)} />
                                <span className="w-14 shrink-0">{h.abierto ? 'Abierto' : 'Cerrado'}</span>
                                <input
                                    type="time"
                                    disabled={!h.abierto}
                                    value={h.horaApertura}
                                    onChange={(e) => handleHorarioChange(h.dia, 'horaApertura', e.target.value)}
                                    className="rounded-full px-2 py-1 outline-none bg-white text-slate-900 text-xs disabled:opacity-40"
                                />
                                <span>a</span>
                                <input
                                    type="time"
                                    disabled={!h.abierto}
                                    value={h.horaCierre}
                                    onChange={(e) => handleHorarioChange(h.dia, 'horaCierre', e.target.value)}
                                    className="rounded-full px-2 py-1 outline-none bg-white text-slate-900 text-xs disabled:opacity-40"
                                />
                            </div>
                        ))}
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

                <button onClick={handleGuardar} disabled={subiendoImagen}
                        className="border border-white text-white rounded-full px-6 py-2 text-sm  hover:bg-white hover:text-slate-700 transition disabled:opacity-50">
                    Guardar Cambios
                </button>

            </div>
        </div>
    )
}

export default PerfilRestaurante