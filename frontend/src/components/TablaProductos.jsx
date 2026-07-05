import { useNavigate } from "react-router-dom";

function TablaProductos() {
    const navigate = useNavigate();

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
                        <th className="px-4 py-3 text-center font-medium">Acciones</th>
                    </tr>
                    </thead>

                    <tbody className="bg-slate-700 text-white">
                    <tr className="border-t border-slate-600">
                        <td className="px-4 py-2">Pollo Frito</td>
                        <td className="px-4 py-2">Cubo de 6 porciones</td>
                        <td className="px-4 py-2 text-center">₡5500</td>
                        <td className="px-4 py-2 text-center">₡3500</td>
                        <td className="px-4 py-2 text-center">30 min</td>
                        <td className="px-4 py-2">
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => navigate("/restaurante/editarproducto/1")}
                                    className="rounded-full border border-white px-2 py-1 hover:bg-slate-600"
                                >
                                    ✏️
                                </button>

                                <button className="rounded-full border border-white px-2 py-1 hover:bg-red-700">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>

                    <tr className="border-t border-slate-600">
                        <td className="px-4 py-2">Papas</td>
                        <td className="px-4 py-2">Papas con salsa</td>
                        <td className="px-4 py-2 text-center">₡5500</td>
                        <td className="px-4 py-2 text-center">₡3500</td>
                        <td className="px-4 py-2 text-center">30 min</td>
                        <td className="px-4 py-2">
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => navigate("/restaurante/editarproducto/2")}
                                    className="rounded-full border border-white px-2 py-1 hover:bg-slate-600"
                                >
                                    ✏️
                                </button>

                                <button className="rounded-full border border-white px-2 py-1 hover:bg-red-700">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>

                    <tr className="border-t border-slate-600">
                        <td className="px-4 py-2">Coca Cola</td>
                        <td className="px-4 py-2">600 ml</td>
                        <td className="px-4 py-2 text-center">₡5500</td>
                        <td className="px-4 py-2 text-center">₡3500</td>
                        <td className="px-4 py-2 text-center">1 min</td>
                        <td className="px-4 py-2">
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => navigate("/restaurante/editarproducto/3")}
                                    className="rounded-full border border-white px-2 py-1 hover:bg-slate-600"
                                >
                                    ✏️
                                </button>

                                <button className="rounded-full border border-white px-2 py-1 hover:bg-red-700">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TablaProductos;