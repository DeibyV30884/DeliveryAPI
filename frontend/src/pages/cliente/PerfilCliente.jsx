import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { obtenerPerfilCliente, editarPerfilCliente, desactivarPerfilCliente, extraerCoordenadas } from '../../api/usuarios'
import { useAuth } from '../../context/AuthContext'
import ubicacionIcon from '../../assets/ubicacion.png'

// icono para el marcador del mapa
// le digo el tamaño y donde es el "punto" exacto que marca la ubicacion (la puntita de abajo)
const iconoUbicacion = new L.Icon({
    iconUrl: ubicacionIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})

// este componente lo tuve que crear porque el mapa no se mueve solo
// cuando cambio las coordenadas, entonces toca moverlo a mano con esto
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

function PerfilCliente() {
    const { cerrarSesion } = useAuth()

    const [perfil, setPerfil] = useState(null)

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        password: '' ,
        direccionPredeterminada: '',
        linkGoogleMaps: '',
    })

    // aqui guardo la latitud y longitud para el mapa
    const [coords, setCoords] = useState(null)

    const [error, setError] = useState('')
    const [exito, setExito] = useState('')
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        obtenerPerfilCliente()
            .then(function (res) {
                const d = res.data
                setPerfil(d)

                let nombreValor = ''
                if (d.nombre) {
                    nombreValor = d.nombre
                }

                let apellidoValor = ''
                if (d.apellido) {
                    apellidoValor = d.apellido
                }

                let telefonoValor = ''
                if (d.telefono) {
                    telefonoValor = d.telefono
                }

                let emailValor = ''
                if (d.email) {
                    emailValor = d.email
                }

                let direccionValor = ''
                if (d.direccionPredeterminada) {
                    direccionValor = d.direccionPredeterminada
                }

                let linkValor = ''
                if (d.linkGoogleMaps) {
                    linkValor = d.linkGoogleMaps
                }

                setFormData({
                    nombre: nombreValor,
                    apellido: apellidoValor,
                    telefono: telefonoValor,
                    email: emailValor,
                    password: '',
                    direccionPredeterminada: direccionValor,
                    linkGoogleMaps: linkValor,
                })

                // si el cliente ya tenia una direccion guardada, cargo el mapa ahi
                if (d.latitudPredeterminada && d.longitudPredeterminada) {
                    const lat = parseFloat(d.latitudPredeterminada)
                    const lng = parseFloat(d.longitudPredeterminada)
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

    // esta funcion se ejecuta cuando el usuario le da click al boton "Ubicar"
    // lo que hace es mandar el link de google maps al backend para que me regrese
    // la latitud y longitud, y con eso muevo el mapa
    async function handleUbicar() {
        if (formData.linkGoogleMaps.trim() === '') {
            setError('Pega un link de Google Maps primero')
            return
        }

        setError('')

        try {
            const res = await extraerCoordenadas(formData.linkGoogleMaps)
            const lat = res.data.lat
            const lng = res.data.lng
            setCoords ([lat, lng])
            setExito('Ubicacion cargada. Guarda los cambios para confirmar.')
        } catch (e){
            setError('No se pudieron extraer coordenadas del link. Verifique que sea un link válido de Google Maps.')
        }
    }

    async function handleGuardar() {
        setError('')
        setExito('')


        try {
            await editarPerfilCliente(formData)
            setExito('Perfil actualizado correctamente')

            // vuelvo a pedir el perfil para traer las coordenadas actualizadas
            const res = await obtenerPerfilCliente()
            const d = res.data


            if  (d.latitudPredeterminada && d.longitudPredeterminada) {
                const lat = parseFloat(d.latitudPredeterminada)
                const lng = parseFloat(d.longitudPredeterminada)
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
            await desactivarPerfilCliente()
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

    // calculo donde va a empezar centrado el mapa
    // si ya hay coordenadas, lo centro ahí, si no, en un punto de San Jose por defecto
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
                {/*Columna izquierda */}

                <div className="flex flex-col gap-4">
                    <h2 className="text-white font-bold tracking-wide">INFORMACIÓN PERSONAL</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-300 text-xs mb-1 block">Nombre</label>
                            <input name="nombre" value={formData.nombre} onChange={handleChange}
                                   className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-xs mb-1 block">Apellidos</label>
                            <input name="apellido" value={formData.apellido} onChange={handleChange}
                                   className="w-full rounded-full px-4 py-2 outline-none bg-white  text-slate-900 text-sm"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Cédula de Identidad</label>
                        <input value={perfil ? perfil.cedula : '' } disabled
                               className="w-full rounded-full px-4 py-2 outline-none  bg-slate-500 text-slate-300 text-sm cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Teléfono</label>
                        <input name="telefono" value={formData.telefono} onChange={handleChange}
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>

                    <h2 className="text-white font-bold tracking-wide mt-2">DATOS DE ACCESO</h2>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Correo Electrónico</label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Nueva Contraseña (opcional)</label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange}
                               placeholder="Dejar vacío para no cambiar"
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                </div>

                {/* Columna derecha — mapa*/}
                <div className="flex flex-col gap-3">
                    <h2 className="text-white font-bold tracking-wide">DIRECCIÓN PREDETERMINADA</h2>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Descripción</label>
                        <input name="direccionPredeterminada" value={formData.direccionPredeterminada}
                               onChange={handleChange} placeholder="Ej: Primera casa, portón morado"
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                    <div>
                        <label className="text-slate-300 text-xs mb-1 block">Link de Google Maps</label>
                        <input name="linkGoogleMaps" value={formData.linkGoogleMaps}
                               onChange={handleChange} placeholder="Pega aquí el link de Google Maps"
                               className="w-full rounded-full px-4 py-2 outline-none bg-white text-slate-900 text-sm" />
                    </div>
                    <button onClick={handleUbicar}
                            className="self-start border border-white text-white rounded-full px-6 py-2 text-sm hover:bg-white hover:text-slate-700 transition">
                        Ubicar
                    </button>

                    {/* aqui va el mapa, le pongo una altura fija porque si no, no se ve */}
                    <div className="rounded-xl overflow-hidden h-52 w-full">
                        <MapContainer
                            center={centroMapa}
                            zoom={zoomMapa}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                        >
                            {/* esto es lo que dibuja el mapa de verdad, usando openstreetmap */}
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {coords && (
                                <>

                                    {/* el marcador con el icono de la ubicacion */}
                                    <Marker position={coords} icon={iconoUbicacion} />
                                    {/* este es el que mueve el mapa cuando cambian las coords */}
                                    <ActualizarMapa coords={coords} />
                                </>
                            )}
                        </MapContainer >

                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-6">
                <button onClick={handleEliminar}
                        className="border border-white text-white rounded-full px-6 py-2 text-sm hover:bg-red-600 hover:border-red-600 transition">
                    Eliminar Perfil
                </button>
                <button onClick={handleGuardar}
                        className="border border-white text-white rounded-full px-6 py-2 text-sm hover:bg-white hover:text-slate-700 transition">
                    Guardar Cambios
                </button>
            </div>
        </div>
    )
}

export default PerfilCliente