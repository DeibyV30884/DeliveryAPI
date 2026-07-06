import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import {
    crearProducto,
    editarProducto,
    obtenerProductosGestion,
    subirImagenProducto,
} from '../api/productos'

function FormularioProducto({ modo = 'crear' }) {
    const navigate = useNavigate()
    const { id } = useParams()

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        precioDescuento: '',
        tiempoPreparacionMin: '',
        imagenUrl: '',
        activo: true,
    })


    const [previewUrl, setPreviewUrl] = useState('')
    const [subiendoImagen, setSubiendoImagen] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(modo === 'editar')

    useEffect(() => {
        if (modo !== 'editar' || !id) return

        obtenerProductosGestion()
            .then((res) => {
                const productos = res.data.datos || res.data
                const producto = productos.find((p) => p.productoId === Number(id))

                if (!producto) {
                    setError('Producto no encontrado')
                    return
                }

                setFormData({
                    nombre: producto.nombre || '',
                    descripcion: producto.descripcion || '',
                    precio: producto.precio ?? '',
                    precioDescuento: producto.precioDescuento ?? '',
                    tiempoPreparacionMin: producto.tiempoPreparacionMin ?? '',
                    imagenUrl: producto.imagenUrl || '',
                    activo: producto.activo,
                })
                setPreviewUrl(producto.imagenUrl || '')
            })
            .catch(() => setError('No se pudo cargar el producto'))
            .finally(() => setCargando(false))
    }, [modo, id])

    function handleChange(e) {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    function handleEstadoChange(e) {
        setFormData((prev) => ({ ...prev, activo: e.target.value === 'Disponible' }))
    }

    async function handleArchivoChange(e) {
        const archivo = e.target.files[0]
        if (!archivo) return

        setPreviewUrl(URL.createObjectURL(archivo))
        setError('')
        setSubiendoImagen(true)

        try {
            const res = await subirImagenProducto(archivo)
            setFormData((prev) => ({ ...prev, imagenUrl: res.data.url }))
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo subir la imagen')
        } finally {
            setSubiendoImagen(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (subiendoImagen) {
            setError('Espera a que termine de subir la imagen')
            return
        }

        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            precio: Number(formData.precio),
            precioDescuento: formData.precioDescuento ? Number(formData.precioDescuento) : null,
            tiempoPreparacionMin: Number(formData.tiempoPreparacionMin),
            imagenUrl: formData.imagenUrl || null,
            activo: formData.activo,
        }

        setGuardando(true)

        try {
            if (modo === 'editar') {
                await editarProducto(id, payload)
            } else {
                await crearProducto(payload)
            }
            navigate('/restaurante/gestionproducto')
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al guardar el producto')
        } finally {
            setGuardando(false)
        }
    }

    if (cargando) {
        return <p className="mt-6 text-white">Cargando producto...</p>
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl bg-slate-800 p-8 shadow-lg">
            {error && (
                <p className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">{error}</p>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div>
                    <h3 className="mb-4 text-lg font-semibold text-lime-400">
                        Información del alimento
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm text-slate-200">Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Pollo frito"
                                required
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">Descripción</label>
                            <textarea
                                name="descripcion"
                                rows="4"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Describe el producto"
                                className="w-full resize-none rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">Estado</label>
                            <div className="relative">
                                <select
                                    value={formData.activo ? 'Disponible' : 'No disponible'}
                                    onChange={handleEstadoChange}
                                    className="w-full appearance-none rounded-xl border border-slate-600 bg-slate-700 pl-4 pr-10 py-3 text-sm text-white outline-none focus:border-lime-400"
                                >
                                    <option>Disponible</option>
                                    <option>No disponible</option>
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">Imagen</label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleArchivoChange}
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-slate-200 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-lime-400 file:px-4 file:py-2 file:font-semibold file:text-slate-900 hover:file:bg-lime-300"
                            />
                            {subiendoImagen && (
                                <p className="mt-2 text-xs text-lime-300">Subiendo imagen...</p>
                            )}
                            {previewUrl && !subiendoImagen && (
                                <img
                                    src={previewUrl}
                                    alt="Vista previa"
                                    className="mt-3 h-32 w-32 rounded-xl object-cover"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 text-lg font-semibold text-lime-400">
                        Disponibilidad
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm text-slate-200">Precio</label>
                            <input
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                placeholder="Ej: 5500"
                                required
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">
                                Precio con descuento
                            </label>
                            <input
                                type="number"
                                name="precioDescuento"
                                value={formData.precioDescuento}
                                onChange={handleChange}
                                placeholder="Ej: 3500"
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">
                                Tiempo de preparacion (min)
                            </label>
                            <input
                                type="number"
                                name="tiempoPreparacionMin"
                                value={formData.tiempoPreparacionMin}
                                onChange= {handleChange}
                                placeholder="Ej: 30"
                                required
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/restaurante/gestionproducto')}
                    className="rounded-xl border border-slate-500 px-6 py-2 text-white transition hover:bg-slate-700"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={guardando || subiendoImagen}
                    className="rounded-xl bg-lime-400 px-6 py-2 font-semibold text-slate-900 transition hover:bg-lime-300 disabled:opacity-50"
                >
                    {guardando ? 'Guardando...' : modo === 'editar' ? 'Guardar cambios' : 'Confirmar'}
                </button>
            </div>
        </form>
    )
}

export default FormularioProducto