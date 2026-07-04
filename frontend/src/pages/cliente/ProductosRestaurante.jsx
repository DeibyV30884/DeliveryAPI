import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { obtenerProductosRestaurante } from '../../api/usuarios'

const imagenesProductos = {
    'Pizza Pepperoni': '/productos/pizza-pepperoni.jpg',
    'Pizza Veggie': '/productos/pizza-veggie.jpg',
    'Burger Classic': '/productos/burger-classic.jpg',
    'Burger Cheese': '/productos/burger-cheese.jpg',
    'Papas Grandes': '/productos/papas-grandes.jpg',
    'Pizza Hawaiana': '/productos/pizza-hawaiana.jpg',
    'Refresco': '/productos/refresco.jpg',
    'Agua': '/productos/agua.jpg',
}

function ProductosRestaurante() {
    const navigate = useNavigate()
    const { restauranteId } = useParams()
    const location = useLocation()

    const nombreRestaurante = location.state?.nombreRestaurante ?? 'Restaurante'

    const [productos, setProductos] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        obtenerProductosRestaurante(restauranteId)
            .then((res) => {
                setProductos(res.data)
                setError('')
            })
            .catch(() => {
                setError('No se pudieron cargar los productos.')
            })
            .finally(() => {
                setCargando(false)
            })
    }, [restauranteId])

    const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    const formatoPrecio = (valor) =>
        `₡${Number(valor).toLocaleString('es-CR')}`

    if (cargando) {
        return <p className="text-slate-300">Cargando productos...</p>
    }

    return (
        <section>
            <div className="mb-6 text-sm">
                <Link
                    to="/cliente/restaurantes"
                    className="text-lime-400 hover:underline"
                >
                    Explorar
                </Link>
                <span className="text-slate-400"> / {nombreRestaurante}</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-6">
                Productos de {nombreRestaurante}
            </h1>

            <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full max-w-md mb-6 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-600 outline-none focus:border-lime-400"
            />

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {productosFiltrados.length === 0 && !error ? (
                <p className="text-slate-300">No hay productos disponibles.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {productosFiltrados.map((producto) => (
                        <div
                            key={producto.productoId}
                            className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700"
                        >
                            <img
                                src={
                                    producto.imagenUrl ||
                                    imagenesProductos[producto.nombre] ||
                                    '/productos/default.jpg'
                                }
                                alt={producto.nombre}
                                className="w-full h-36 object-cover bg-slate-700"
                            />

                            <div className="p-4">
                                <h2 className="text-white text-lg font-semibold mb-3">
                                    {producto.nombre}
                                </h2>

                                {producto.precioDescuento ? (
                                    <div className="mb-4">
                                        <p className="text-slate-400 line-through text-sm">
                                            {formatoPrecio(producto.precio)}
                                        </p>
                                        <p className="text-lime-400 font-bold text-lg">
                                            {formatoPrecio(producto.precioDescuento)}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-lime-400 font-bold text-lg mb-4">
                                        {formatoPrecio(producto.precio)}
                                    </p>
                                )}

                                <button
                                    onClick={() =>
                                        navigate(`/cliente/restaurantes/${restauranteId}/productos/${producto.productoId}`, {
                                            state: { nombreRestaurante },
                                        })
                                    }
                                    className="w-full bg-lime-500 hover:bg-lime-400 text-slate-900 font-semibold py-2 rounded-lg"
                                >
                                    Ver
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default ProductosRestaurante