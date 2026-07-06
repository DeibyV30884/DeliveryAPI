import { useState, useEffect } from "react";
import TarjetasProductos from "../../components/TarjetasProductos";
import BarraBusquedaProductos from "../../components/BarraBusquedaProductos";
import TablaProductos from "../../components/TablaProductos";
import PaginacionProductos from "../../components/PaginacionProductos";
import { useNavigate } from "react-router-dom";
import { obtenerProductosGestion, eliminarProducto } from "../../api/productos";

const PRODUCTOS_POR_PAGINA = 10;

function GestionProductos() {
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("Filtrar");
    const [pagina, setPagina] = useState(1);

    useEffect(() => {
        cargarProductos();
    }, []);

    function cargarProductos() {
        setCargando(true);
        obtenerProductosGestion()
            .then((res) => {
                const datos = res.data.datos || res.data;
                setProductos(datos);
            })
            .catch(() => setError("No se pudieron cargar los productos"))
            .finally(() => setCargando(false));
    }

    async function handleEliminar(productoId) {
        const confirmar = confirm("¿Seguro que quiere desactivar este producto?");
        if (!confirmar) return;

        try {
            await eliminarProducto(productoId);

            const productosActualizados = [];

            for (let i = 0; i < productos.length; i++) {
                const producto = productos[i];

                if (producto.productoId === productoId) {
                    const productoModificado = { ...producto, activo: false };
                    productosActualizados.push(productoModificado);
                } else {
                    productosActualizados.push(producto);
                }
            }

            setProductos(productosActualizados);
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al eliminar el producto");
        }
    }

    const productosFiltrados = [];

    for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];

        const nombreEnMinusculas = producto.nombre.toLowerCase();
        const busquedaEnMinusculas = busqueda.toLowerCase();
        const coincideBusqueda = nombreEnMinusculas.includes(busquedaEnMinusculas);

        let coincideFiltro = true;

        if (filtro === "Disponibles") {
            coincideFiltro = producto.activo;
        }

        if (filtro === "No disponibles") {
            coincideFiltro = !producto.activo;
        }

        if (filtro === "Con descuento") {
            coincideFiltro = producto.activo && producto.tieneDescuento;
        }

        if (coincideBusqueda && coincideFiltro) {
            productosFiltrados.push(producto);
        }
    }

    const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA));
    const inicio = (pagina - 1) * PRODUCTOS_POR_PAGINA;
    const productosPagina = productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

    const totalDisponibles = productos.filter((p) => p.activo).length;
    const totalConDescuento = productos.filter((p) => p.tieneDescuento).length;

    return (
        <section className="text-white">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-lime-300">
                            Gestión de Productos
                        </h1>

                        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                            Administra tus publicaciones
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/restaurante/agregarproducto")}
                        className="rounded-xl bg-lime-400 px-5 py-3 font-semibold text-slate-900 transition hover:bg-lime-300"
                    >
                        Añadir Producto
                    </button>
                </div>

                {error && (
                    <p className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">{error}</p>
                )}

                <TarjetasProductos disponibles={totalDisponibles} conDescuento={totalConDescuento} />

                <BarraBusquedaProductos
                    busqueda={busqueda}
                    onBusquedaChange={(valor) => { setBusqueda(valor); setPagina(1); }}
                    filtro={filtro}
                    onFiltroChange={(valor) => { setFiltro(valor); setPagina(1); }}
                />

                {cargando ? (
                    <p className="mt-6 text-slate-300">Cargando productos...</p>
                ) : (
                    <>
                        <TablaProductos productos={productosPagina} onEliminar={handleEliminar} />
                        <PaginacionProductos
                            pagina={pagina}
                            totalPaginas={totalPaginas}
                            total={productosFiltrados.length}
                            onCambiarPagina={setPagina}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

export default GestionProductos;