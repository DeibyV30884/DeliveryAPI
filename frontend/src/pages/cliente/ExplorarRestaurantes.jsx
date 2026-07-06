import { useEffect, useState } from 'react'
import { obtenerRestaurantes } from '../../api/usuarios'
import { useNavigate } from 'react-router-dom'

const IMAGEN_POR_DEFECTO = '/restaurantes/default.jpg'

function ExplorarRestaurantes() {
    const navigate = useNavigate()
    const [restaurantes, setRestaurantes] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        obtenerRestaurantes()
            .then((res) => setRestaurantes(res.data))
            .catch(() => setError('No se pudieron cargar los restaurantes.'))
            .finally(() => setCargando(false))
    }, [])

    const restaurantesFiltrados = restaurantes.filter((r) =>
        r.nombreRestaurante.toLowerCase().includes(busqueda.toLowerCase())
    )

    if (cargando) {
        return <p className="text-slate-300">Cargando restaurantes...</p>
    }

    return (
        <section>
            <h1 className="text-2xl font-bold text-lime-400 mb-6">
                Explorar Restaurantes
            </h1>

            <input
                type="text"
                placeholder="Buscar restaurante..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full max-w-md mb-6 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-600 outline-none focus:border-lime-400"
            />

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {!error && restaurantesFiltrados.length === 0 ? (
                <p className="text-slate-300">No hay restaurantes disponibles.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {restaurantesFiltrados.map((restaurante) => (
                        <div
                            key={restaurante.restauranteId}
                            className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700"
                        >
                            <img
                                src={restaurante.imagenUrl || IMAGEN_POR_DEFECTO}
                                alt={restaurante.nombreRestaurante}
                                className="w-full h-36 object-cover bg-slate-700"
                            />

                            <div className="p-4">
                                <h2 className="text-white text-lg font-semibold">
                                    {restaurante.nombreRestaurante}
                                </h2>
                                <button
                                    onClick={() =>
                                        navigate(`/cliente/restaurantes/${restaurante.restauranteId}`, {
                                            state: { nombreRestaurante: restaurante.nombreRestaurante },
                                        })
                                    }
                                    className="mt-4 w-full bg-lime-500 hover:bg-lime-400 text-slate-900 font-semibold py-2 rounded-lg"
                                >
                                    Ver productos
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default ExplorarRestaurantes