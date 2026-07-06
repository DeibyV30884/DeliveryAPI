import { ChevronDown } from "lucide-react";

function BarraBusquedaProductos({ busqueda, onBusquedaChange, filtro, onFiltroChange }) {
    return (
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => onBusquedaChange(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none border border-slate-700 placeholder:text-slate-400 focus:border-lime-400"
                />
            </div>

            <div className="relative">
                <select
                    value={filtro}
                    onChange={(e) => onFiltroChange(e.target.value)}
                    className="appearance-none rounded-xl bg-slate-800 pl-4 pr-10 py-3 text-sm text-slate-100 outline-none border border-slate-700 focus:border-lime-400"
                >
                    <option>Filtrar</option>
                    <option>Disponibles</option>
                    <option>Con descuento</option>
                    <option>No disponibles</option>
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>
        </div>
    );
}

export default BarraBusquedaProductos;