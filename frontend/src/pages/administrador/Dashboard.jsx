import { useEffect, useState } from "react";
import { obtenerResumenUsuarios, obtenerEstadisticasDashboard } from "../../api/usuarios";

const PERIODOS = [
    { valor: "hoy", etiqueta: "Hoy" },
    { valor: "semana", etiqueta: "Semana" },
    { valor: "mes", etiqueta: "Mes" },
    { valor: "anio", etiqueta: "Año" },
];

function obtenerEtiquetaPeriodo(valor) {
    const encontrado = PERIODOS.find((p) => p.valor === valor);
    if (encontrado) {
        return encontrado.etiqueta;
    }
    return "Hoy";
}

function Dashboard() {
    const [resumen, setResumen] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [periodo, setPeriodo] = useState("hoy");
    const [cargando, setCargando] = useState(true);
    const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarResumen();
    }, []);

    useEffect(() => {
        cargarEstadisticas(periodo);
    }, [periodo]);

    function cargarResumen() {
        setCargando(true);
        setError("");

        obtenerResumenUsuarios()
            .then((respuesta) => setResumen(respuesta.data))
            .catch(() => setError("No se pudo cargar el dashboard"))
            .finally(() => setCargando(false));
    }

    function cargarEstadisticas(periodoSeleccionado) {
        setCargandoEstadisticas(true);

        obtenerEstadisticasDashboard(periodoSeleccionado)
            .then((respuesta) => setEstadisticas(respuesta.data))
            .catch(() => setError("No se pudieron cargar las estadísticas"))
            .finally(() => setCargandoEstadisticas(false));
    }

    if (cargando) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <p className="text-lg text-slate-300">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <section className="mx-auto w-full max-w-7xl text-white">
            <div className="mb-6">
                <h1 className="text-4xl font-extrabold text-lime-400 md:text-5xl">
                    Dashboard
                </h1>

                <p className="mt-2 text-sm uppercase tracking-wide text-slate-300">
                    Resumen general
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-400 bg-red-500/20 p-4 text-red-100">
                    {error}
                </div>
            )}

            {resumen && (
                <div className="mb-7 rounded-2xl bg-slate-800 p-6 shadow-xl md:p-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-sm font-semibold uppercase text-slate-200">
                            Usuarios y estadísticas
                        </h2>

                        <div className="flex flex-wrap gap-2">
                            {PERIODOS.map((p) => {
                                let clase =
                                    "rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-lime-400 hover:text-lime-400";

                                if (p.valor === periodo) {
                                    clase =
                                        "rounded-full border border-lime-400 bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900";
                                }

                                return (
                                    <button
                                        key={p.valor}
                                        type="button"
                                        onClick={() => setPeriodo(p.valor)}
                                        className={clase}
                                    >
                                        {p.etiqueta}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-700 bg-slate-700 p-5">
                            <h3 className="mb-4 text-sm font-semibold uppercase text-slate-200">
                                Usuarios
                            </h3>

                            <div className="flex gap-6">
                                <div className="flex-1 text-center">
                                    <p className="text-2xl font-bold">
                                        {resumen.restaurantes}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-300">
                                        Restaurantes
                                    </p>
                                </div>

                                <div className="flex-1 text-center">
                                    <p className="text-2xl font-bold">
                                        {resumen.clientes}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-300">
                                        Clientes
                                    </p>
                                </div>

                                <div className="flex-1 text-center">
                                    <p className="text-2xl font-bold">
                                        {resumen.repartidores}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-300">
                                        Repartidores
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-700 bg-slate-700 p-5">
                            <h3 className="mb-4 text-sm font-semibold uppercase text-slate-200">
                                Estadísticas · {obtenerEtiquetaPeriodo(periodo)}
                            </h3>

                            {!estadisticas || cargandoEstadisticas ? (
                                <p className="py-4 text-center text-sm text-slate-300">
                                    Cargando...
                                </p>
                            ) : (
                                <div className="flex gap-6">
                                    <div className="flex-1 text-center">
                                        <p className="text-2xl font-bold text-lime-400">
                                            ₡{estadisticas.ganancias.toLocaleString("es-CR")}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-300">
                                            Ganancias de la plataforma
                                        </p>
                                    </div>

                                    <div className="flex-1 text-center">
                                        <p className="text-2xl font-bold text-lime-400">
                                            {estadisticas.pedidosEntregados}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-300">
                                            Pedidos entregados
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {estadisticas && (
                <div className="rounded-2xl bg-slate-800 p-6 shadow-xl md:p-8">
                    <h2 className="mb-5 text-xl font-bold uppercase text-white">
                        Top 3 restaurantes · {obtenerEtiquetaPeriodo(periodo)}
                    </h2>

                    {estadisticas.topRestaurantes.length === 0 ? (
                        <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-10 text-center text-slate-200">
                            Todavía no hay pedidos entregados en este periodo.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-700">
                            <table className="w-full border-collapse min-w-[720px]">
                                <thead className="bg-slate-100 text-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Restaurante</th>
                                    <th className="px-4 py-3 text-left font-medium">Email</th>
                                    <th className="px-4 py-3 text-center font-medium">Pedidos</th>
                                    <th className="px-4 py-3 text-center font-medium">Ganancias</th>
                                </tr>
                                </thead>

                                <tbody className="bg-slate-700 text-white">
                                {estadisticas.topRestaurantes.map((r) => (
                                    <tr
                                        key={r.restauranteId}
                                        className="border-t border-slate-600"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {r.nombreRestaurante}
                                        </td>

                                        <td className="px-4 py-3">
                                            {r.email}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            {r.pedidos}
                                        </td>

                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            ₡{r.ganancias.toLocaleString("es-CR")}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default Dashboard;