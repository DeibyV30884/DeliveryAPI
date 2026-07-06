function PaginacionProductos({ pagina, totalPaginas, total, onCambiarPagina }) {
    const paginas = [];
    for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
    }

    let primerProducto = (pagina - 1) * 10 + 1;
    let ultimoProducto = pagina * 10;

    if (total === 0) {
        primerProducto = 0;
    }

    if (ultimoProducto > total) {
        ultimoProducto = total;
    }

    function irPaginaAnterior() {
        if (pagina > 1) {
            onCambiarPagina(pagina - 1);
        }
    }

    function irPaginaSiguiente() {
        if (pagina < totalPaginas) {
            onCambiarPagina(pagina + 1);
        }
    }

    return (
        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-slate-300">
            <p>
                Mostrando {primerProducto}-{ultimoProducto} de {total} productos
            </p>

            <div className="flex items-center gap-2">
                <button
                    onClick={irPaginaAnterior}
                    disabled={pagina === 1}
                    className="hover:text-lime-400 disabled:opacity-30"
                >
                    {"<"}
                </button>

                {paginas.map((numeroPagina) => {
                    let claseBoton = "hover:text-lime-400";
                    if (numeroPagina === pagina) {
                        claseBoton = "text-lime-400 font-bold";
                    }

                    return (
                        <button
                            key={numeroPagina}
                            onClick={() => onCambiarPagina(numeroPagina)}
                            className={claseBoton}
                        >
                            {numeroPagina}
                        </button>
                    );
                })}

                <button
                    onClick={irPaginaSiguiente}
                    disabled={pagina === totalPaginas}
                    className="hover:text-lime-400 disabled:opacity-30"
                >
                    {">"}
                </button>
            </div>
        </div>
    );
}

export default PaginacionProductos;