import { useNavigate } from "react-router-dom";

function FormularioProducto({ modo = "crear" }) {
    const navigate = useNavigate();

    return (
        <form className="mt-6 rounded-2xl bg-slate-800 p-8 shadow-lg">
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
                                placeholder="Ej: Pollo frito"
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">Descripción</label>
                            <textarea
                                rows="4"
                                placeholder="Describe el producto"
                                className="w-full resize-none rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">Estado</label>
                            <select className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none focus:border-lime-400">
                                <option>Disponible</option>
                                <option>No disponible</option>
                                <option>Con descuento</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">Imagen</label>
                            <input
                                type="file"
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-slate-200 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-lime-400 file:px-4 file:py-2 file:font-semibold file:text-slate-900 hover:file:bg-lime-300"
                            />
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
                                placeholder="Ej: 5500"
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">
                                Precio con descuento
                            </label>
                            <input
                                type="number"
                                placeholder="Ej: 3500"
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">
                                Tiempo de preparación
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: 30 min"
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-slate-200">
                                URL de imagen
                            </label>
                            <input
                                type="text"
                                placeholder="https://..."
                                className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/restaurante/gestionproducto")}
                    className="rounded-xl border border-slate-500 px-6 py-2 text-white transition hover:bg-slate-700"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    className="rounded-xl bg-lime-400 px-6 py-2 font-semibold text-slate-900 transition hover:bg-lime-300"
                >
                    {modo === "editar" ? "Guardar cambios" : "Confirmar"}
                </button>
            </div>
        </form>
    );
}

export default FormularioProducto;