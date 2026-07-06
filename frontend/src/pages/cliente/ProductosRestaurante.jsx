import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { obtenerProductosRestaurante } from '../../api/usuarios'

const IMAGEN_POR_DEFECTO = '/productos/default.jpg'

function TarjetaProducto({ producto, restauranteId, nombreRestaurante, navigate, formatoPrecio }) {
    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <img
                src={producto.imagenUrl || IMAGEN_POR_DEFECTO}
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
    )
}

function ProductosRestaurante() {
    const navigate = useNavigate()
    const { restauranteId } = useParams()

    const [restaurante, setRestaurante] = useState(null)
    const [productos, setProductos] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [filtro, setFiltro] = useState('Todos')
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        obtenerProductosRestaurante(restauranteId)
            .then((res) => {
                setRestaurante(res.data)
                setProductos(res.data.productos ?? [])
                setError('')
            })
            .catch(() => setError('No se pudieron cargar los productos.'))
            .finally(() => setCargando(false))
    }, [restauranteId])

    const nombreRestaurante = restaurante?.nombreRestaurante ?? 'Restaurante'

    const productosFiltrados = productos.filter((producto) => {
        const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())

        let coincideFiltro = true
        if (filtro === 'Con descuento') coincideFiltro = producto.tieneDescuento
        if (filtro === 'Sin descuento') coincideFiltro = !producto.tieneDescuento

        return coincideBusqueda && coincideFiltro
    })

    const productosConOferta = productosFiltrados.filter((p) => p.tieneDescuento)

    const formatoPrecio = (valor) =>
        `₡${Number(valor).toLocaleString('es-CR')}`

    if (cargando) {
        return <p className="text-slate-300">Cargando productos...</p>
    }

    return (
        <section>
            <button
                onClick={() => navigate('/cliente/restaurantes')}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-lime-400 hover:text-lime-400"
            >
                <ArrowLeft size={16} />
                Volver a Restaurantes
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">{nombreRestaurante}</h1>
                    {restaurante?.direccion && (
                        <p className="text-slate-400 text-sm mt-1">{restaurante.direccion}</p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full sm:w-64 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-600 outline-none focus:border-lime-400"
                    />

                    <div className="relative">
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="appearance-none w-full sm:w-44 rounded-lg bg-slate-800 pl-4 pr-10 py-3 text-sm text-white border border-slate-600 outline-none focus:border-lime-400"
                        >
                            <option>Todos</option>
                            <option>Con descuento</option>
                            <option>Sin descuento</option>
                        </select>
                        <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {!error && filtro === 'Todos' && productosConOferta.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-lime-400 text-lg font-semibold mb-4">Ofertas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {productosConOferta.map((producto) => (
                            <TarjetaProducto
                                key={producto.productoId}
                                producto={producto}
                                restauranteId={restauranteId}
                                nombreRestaurante={nombreRestaurante}
                                navigate={navigate}
                                formatoPrecio={formatoPrecio}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-white text-lg font-semibold mb-4">
                    {filtro === 'Todos' ? 'Todos los productos' : filtro}
                </h2>

                {!error && productosFiltrados.length === 0 ? (
                    <p className="text-slate-300">No hay productos disponibles.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {productosFiltrados.map((producto) => (
                            <TarjetaProducto
                                key={producto.productoId}
                                producto={producto}
                                restauranteId={restauranteId}
                                nombreRestaurante={nombreRestaurante}
                                navigate={navigate}
                                formatoPrecio={formatoPrecio}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default ProductosRestaurante