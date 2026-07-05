import FormularioProducto from "../../components//FormularioProducto";

function EditarProducto() {
    return (
        <section className="text-white">
            <h1 className="text-3xl font-bold text-lime-300">
                Editar Producto
            </h1>

            <p className="mt-2 text-sm uppercase tracking-wide text-slate-300">
                Modifica la información del producto seleccionado
            </p>

            <FormularioProducto modo="editar" />
        </section>
    );
}

export default EditarProducto;