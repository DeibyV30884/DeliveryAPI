import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { obtenerProductoPorId } from '../../api/usuarios'

const IMAGEN_POR_DEFECTO = '/productos/default.jpg'

function DetalleProducto() {
    const { productoId, restauranteId } = useParams()
    const location = useLocation()

    const nombreRestaurante = location.state?.nombreRestaurante ?? 'Restaurante'

    const [producto, setProducto] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        obtenerProductoPorId(productoId)
            .then((res) => setProducto(res.data))
            .catch(() => setError('No se pudo cargar el producto.'))
            .finally(() => setCargando(false))
    }, [productoId])

    const formatoPrecio = (valor) =>
        `₡${Number(valor).toLocaleString('es-CR')}`

    if (cargando) {
        return <p className="text-slate-300">Cargando producto...</p>
    }

    if (error || !producto) {
        return <p className="text-red-400">{error || 'Producto no encontrado.'}</p>
    }

    return (
        <section>
            <div className="mb-6 text-sm">
                <Link to="/cliente/restaurantes" className="text-lime-400 hover:underline">
                    Explorar
                </Link>
                <span className="text-slate-400"> / </span>
                <Link
                    to={`/cliente/restaurantes/${restauranteId}`}
                    state={{ nombreRestaurante }}
                    className="text-lime-400 hover:underline"
                >
                    {nombreRestaurante}
                </Link>
                <span className="text-slate-400"> / {producto.nombre}</span>
            </div>

            <h1 className="text-4xl font-bold text-lime-400 mb-8">Producto</h1>

            <div className="bg-slate-700 rounded-2xl p-6 flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2">
                    <img
                        src={producto.imagenUrl || IMAGEN_POR_DEFECTO}
                        alt={producto.nombre}
                        className="w-full h-[350px] object-cover rounded-xl"
                    />
                </div>

                <div className="lg:w-1/2 flex flex-col gap-4">
                    <div>
                        <label className="text-slate-300 text-sm">Nombre</label>
                        <div className="bg-white rounded px-3 py-2">{producto.nombre}</div>
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm">Descripción</label>
                        <div className="bg-white rounded px-3 py-2 min-h-[80px]">
                            {producto.descripcion || 'Sin descripción'}
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm">Tiempo de preparación</label>
                        <div className="bg-white rounded px-3 py-2">
                            {producto.tiempoPreparacionMin} min
                        </div>
                    </div>

                    {producto.precioDescuento ? (
                        <div>
                            <label className="text-slate-300 text-sm">Precio</label>
                            <div className="bg-white rounded px-3 py-2">
                                <span className="line-through text-red-500 mr-3">
                                    {formatoPrecio(producto.precio)}
                                </span>
                                <span className="text-green-600 font-bold text-xl">
                                    {formatoPrecio(producto.precioDescuento)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-slate-300 text-sm">Precio</label>
                            <div className="bg-white rounded px-3 py-2 font-bold">
                                {formatoPrecio(producto.precio)}
                            </div>
                        </div>
                    )}

                    <button
                        disabled
                        title="Próximamente"
                        className="mt-4 self-end bg-slate-500 text-slate-300 font-bold px-8 py-3 rounded-full cursor-not-allowed"
                    >
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </section>
    )
}

export default DetalleProducto