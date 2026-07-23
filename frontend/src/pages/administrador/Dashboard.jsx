import { useEffect, useState } from "react";
import { obtenerResumenUsuarios, obtenerEstadisticasDashboard } from "../../api/usuarios";

function Dashboard() {
    const [resumen, setResumen] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarDashboard();
    }, []);

    function cargarDashboard() {
        setCargando(true);
        setError("");
        Promise.all([obtenerResumenUsuarios(), obtenerEstadisticasDashboard()])
            .then(([resResumen, resEstadisticas]) => {
                setResumen(resResumen.data);
                setEstadisticas(resEstadisticas.data);
            })
            .catch(() => setError("No se pudo cargar el dashboard"))
            .finally(() => setCargando(false));
    }

    if (cargando) {
        return <p className="text-slate-300">Cargando dashboard...</p>;
    }

    if (error) {
        return (
            <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">{error}</p>
        );
    }

    return (
        <section className="text-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-lime-300">Dashboard</h1>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Resumen del día
                </p>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
                        <h2 className="mb-4 text-sm font-semibold uppercase text-slate-300">
                            Usuarios
                        </h2>
                        <div className="flex gap-6">
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-bold">{resumen.restaurantes}</p>
                                <p className="mt-1 text-xs text-slate-300">Restaurantes</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-bold">{resumen.clientes}</p>
                                <p className="mt-1 text-xs text-slate-300">Clientes</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-bold">{resumen.repartidores}</p>
                                <p className="mt-1 text-xs text-slate-300">Repartidores</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
                        <h2 className="mb-4 text-sm font-semibold uppercase text-slate-300">
                            Estadísticas
                        </h2>
                        <div className="flex gap-6">
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-bold text-lime-400">
                                    ₡{estadisticas.gananciasHoy.toLocaleString("es-CR")}
                                </p>
                                <p className="mt-1 text-xs text-slate-300">
                                    Ganancias de la plataforma HOY
                                </p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-bold text-lime-400">
                                    {estadisticas.pedidosEntregadosHoy}
                                </p>
                                <p className="mt-1 text-xs text-slate-300">Pedidos entregados HOY</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="mb-4 text-lg font-semibold uppercase text-white">
                        Top 3 restaurantes del mes
                    </h2>

                    {estadisticas.topRestaurantes.length === 0 ? (
                        <p className="text-slate-300">
                            Todavía no hay pedidos entregados este mes.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-700">
                            <table className="w-full border-collapse">
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
                                    <tr key={r.restauranteId} className="border-t border-slate-600">
                                        <td className="px-4 py-2">{r.nombreRestaurante}</td>
                                        <td className="px-4 py-2">{r.email}</td>
                                        <td className="px-4 py-2 text-center">{r.pedidos}</td>
                                        <td className="px-4 py-2 text-center">
                                            ₡{r.ganancias.toLocaleString("es-CR")}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Dashboard;