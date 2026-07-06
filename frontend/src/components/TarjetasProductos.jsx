function TarjetasProductos({ disponibles, conDescuento }) {
    return (
        <div className="mt-6 flex gap-6">
            <div className="w-44 rounded-2xl border border-white py-4 text-center transition hover:border-lime-400">
                <p className="text-sm text-white">Disponibles</p>
                <p className="mt-1 text-xl font-bold text-white">{disponibles}</p>
            </div>

            <div className="w-44 rounded-2xl border border-white py-4 text-center transition hover:border-lime-400">
                <p className="text-sm text-white">Con Descuento</p>
                <p className="mt-1 text-xl font-bold text-white">{conDescuento}</p>
            </div>
        </div>
    );
}

export default TarjetasProductos;