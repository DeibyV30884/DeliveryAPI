import FormularioProducto from "../../components//FormularioProducto";

function AgregarProducto() {
    return (
        <section className="text-white">

            <h1 className="text-3xl font-bold text-lime-300">
                Añadir Producto
            </h1>

            <p className="mt-2 text-sm uppercase tracking-wide text-slate-300">
                Completa la información para agregar un nuevo producto
            </p>

            <FormularioProducto modo="crear" />

        </section>
    );
}

export default AgregarProducto;