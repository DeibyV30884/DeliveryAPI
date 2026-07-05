import TarjetasProductos from "../../components//TarjetasProductos";
import BarraBusquedaProductos from "../../components//BarraBusquedaProductos";
import TablaProductos from "../../components//TablaProductos";
import PaginacionProductos from "../../components//PaginacionProductos";
import { useNavigate } from "react-router-dom";

function GestionProductos() {
    const navigate = useNavigate();

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

                <TarjetasProductos />
                <BarraBusquedaProductos />
                <TablaProductos />
                <PaginacionProductos />
            </div>
        </section>
    );
}

export default GestionProductos;