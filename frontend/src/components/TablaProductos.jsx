import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

function TablaProductos({ productos, onEliminar }) {
    const navigate = useNavigate();

    if (!productos || productos.length === 0) {
        return (
            <div className="mt-8">
                < h2 className="mb-4 text-lg font-semibold uppercase text-white">
                    Tabla de Productos
                </h2>
                <p className="text-slate-300">No hay productos para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold uppercase text-white">
                Tabla de Productos

            </h2>

            <div className="overflow-hidden rounded-2xl border border-slate-700">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-100 text-slate-800">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">Producto</th>
                        <th className="px-4 py-3 text-left font-medium">Descripción</th>
                        <th className="px-4 py-3 text-center font-medium">Precio</th>
                        <th className="px-4 py-3 text-center font-medium">Precio con descuento</th>
                        <th className="px-4 py-3 text-center font-medium">Tiempo preparación</th>
                        <th className="px-4 py-3 text-center font-medium">Estado</th>
                        <th className="px-4 py-3 text-center font-medium">Acciones</th>

                    </tr>
                    </thead>

                    <tbody className="bg-slate-700 text-white">
                    {productos.map((p) => {
                        let claseFila = "border-t border-slate-600";
                        if (!p.activo) {
                            claseFila = "border-t border-slate-600 opacity-50";
                        }

                        return (
                            <tr key={p.productoId} className={claseFila}>
                                <td className="px-4 py-2">{p.nombre}</td>
                                <td className="px-4 py-2">{p.descripcion}</td>
                                <td className="px-4 py-2 text-center">₡{p.precio}</td>
                                <td className="px-4 py-2 text-center">
                                    {p.precioDescuento ? `₡${p.precioDescuento}` : "—"}
                                </td>
                                <td className="px-4 py-2 text-center">{p.tiempoPreparacionMin} min</td>
                                <td className="px-4 py-2 text-center">
                                    {p.activo ? (
                                        <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-slate-900">
                                            Disponible
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-slate-500 px-3 py-1 text-xs font-semibold text-slate-100">
                                            Inactivo
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => navigate(`/restaurante/editarproducto/${p.productoId}`)}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-400 text-slate-200 transition hover:border-lime-400 hover:text-lime-400"
                                            title="Editar producto"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        {p.activo && (
                                            <button
                                                onClick={() => onEliminar(p.productoId)}
                                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-400 text-slate-200 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
                                                title="Desactivar producto"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>

                </table>
            </div>
        </div>
    );
}

export default TablaProductos;