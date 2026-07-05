function PaginacionProductos() {
    return (
        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-slate-300">
            <p>Mostrando 1-10 de 25 productos</p>

            <div className="flex items-center gap-2">
                <button className="hover:text-lime-400">{"<"}</button>
                <button className="hover:text-lime-400">1</button>
                <button className="hover:text-lime-400">2</button>
                <button className="hover:text-lime-400">3</button>
                <button className="hover:text-lime-400">{">"}</button>
            </div>
        </div>
    );
}

export default PaginacionProductos;