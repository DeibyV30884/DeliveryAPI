function BarraBusquedaProductos() {
    return (
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none border border-slate-700 placeholder:text-slate-400 focus:border-lime-400"
                />
            </div>

            <select className="rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none border border-slate-700 focus:border-lime-400">
                <option>Filtrar</option>
                <option>Disponibles</option>
                <option>Con descuento</option>
                <option>No disponibles</option>
            </select>
        </div>
    );
}

export default BarraBusquedaProductos;