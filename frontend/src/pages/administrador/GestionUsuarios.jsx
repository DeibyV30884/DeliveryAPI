import { useEffect, useState } from 'react'
import { Users, UtensilsCrossed, Bike, ShieldCheck } from 'lucide-react'
import apiClient from '../../api/client'

function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [resumen, setResumen] = useState({
        clientes: 0,
        restaurantes: 0,
        repartidores: 0,
        administradores: 0,
        activos: 0,
        inactivos: 0,
        total: 0,
    })

    const [busqueda, setBusqueda] = useState('')
    const [rol, setRol] = useState('Todos')
    const [pagina, setPagina] = useState(1)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [mostrarModal, setMostrarModal] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [mensajeExito, setMensajeExito] = useState('')

    const [nuevoAdministrador, setNuevoAdministrador] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmarPassword: '',
        telefono: '',
        cedula: '',
    })
    const tamanoPagina = 10

    const obtenerUsuarios = async () => {
        try {
            setCargando(true)
            setError('')

            const respuesta = await apiClient.get(
                '/api/Administrador/usuarios',
                {
                    params: {
                        busqueda: busqueda || undefined,
                        rol: rol === 'Todos' ? undefined : rol,
                        pagina,
                        tamanoPagina,
                    },
                }
            )

            setUsuarios(respuesta.data.usuarios)
            setTotalPaginas(respuesta.data.totalPaginas || 1)
        } catch (error) {
            console.error(error)
            setError('No fue posible cargar los usuarios')
        } finally {
            setCargando(false)
        }
    }

    const obtenerResumen = async () => {
        try {
            const respuesta = await apiClient.get(
                '/api/Administrador/usuarios/resumen'
            )

            setResumen(respuesta.data)
        } catch (error) {
            console.error(error)
            setError('No fue posible cargar el resumen')
        }
    }

    const cambiarEstado = async (usuarioId, activo) => {
        const accion = activo ? 'desactivar' : 'activar'

        const confirmado = window.confirm(
            `¿Desea ${accion} este usuario?`
        )

        if (!confirmado) return

        try {
            setError('')

            const respuesta = await apiClient.put(
                `/api/Administrador/usuarios/${usuarioId}/estado`
            )

            await Promise.all([
                obtenerUsuarios(),
                obtenerResumen(),
            ])

            alert(
                respuesta.data.mensaje ||
                'Estado del usuario actualizado correctamente'
            )
        } catch (error) {
            console.error(error)
            setError('No fue posible cambiar el estado del usuario')
        }
    }

    useEffect(() => {
        obtenerResumen()
    }, [])

    useEffect(() => {
        const temporizador = setTimeout(() => {
            obtenerUsuarios()
        }, 300)

        return () => clearTimeout(temporizador)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busqueda, rol, pagina])

    const cambiarRol = (event) => {
        setRol(event.target.value)
        setPagina(1)
    }

    const cambiarBusqueda = (event) => {
        setBusqueda(event.target.value)
        setPagina(1)
    }

    const cambiarCampoAdministrador = (event) => {
        const { name, value } = event.target

        setNuevoAdministrador((actual) => ({
            ...actual,
            [name]: value,
        }))
    }

    const cerrarModalAdministrador = () => {
        setMostrarModal(false)
        setError('')
        setMensajeExito('')

        setNuevoAdministrador({
            nombre: '',
            apellido: '',
            email: '',
            password: '',
            confirmarPassword: '',
            telefono: '',
            cedula: '',
        })
    }

    const registrarAdministrador = async (event) => {
        event.preventDefault()

        try {
            setGuardando(true)
            setError('')
            setMensajeExito('')
            if (
                nuevoAdministrador.password !==
                nuevoAdministrador.confirmarPassword
            ) {
                setError('Las contraseñas no coinciden')
                return
            }
            const respuesta = await apiClient.post(
                '/api/Administrador/registro',
                nuevoAdministrador
            )

            setMensajeExito(
                respuesta.data.mensaje ||
                'Administrador registrado correctamente'
            )

            await Promise.all([
                obtenerUsuarios(),
                obtenerResumen(),
            ])
            setTimeout(() => {
                cerrarModalAdministrador()
            }, 1000)
        } catch (error) {
            console.error(error)

            setError(
                error.response?.data?.mensaje ||
                'No fue posible registrar el administrador'
            )
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="bg-slate-900 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold text-lime-400 md:text-5xl">
                            Gestión de Usuarios
                        </h1>

                        <p className="mt-2 text-slate-300">
                            Consulta y administra los usuarios registrados.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setError('')
                            setMensajeExito('')
                            setMostrarModal(true)
                        }}
                        className="rounded-full border border-white px-6 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-900"
                    >
                        Nuevo administrador
                    </button>
                </div>

                <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <TarjetaResumen
                        icono={Users}
                        titulo="Clientes"
                        valor={resumen.clientes}
                    />

                    <TarjetaResumen
                        icono={UtensilsCrossed}
                        titulo="Restaurantes"
                        valor={resumen.restaurantes}
                    />

                    <TarjetaResumen
                        icono={Bike}
                        titulo="Repartidores"
                        valor={resumen.repartidores}
                    />

                    <TarjetaResumen
                        icono={ShieldCheck}
                        titulo="Administradores"
                        valor={resumen.administradores}
                    />
                </section>

                <section className="rounded-2xl bg-slate-800 p-5 shadow-xl md:p-8">
                    <h2 className="mb-5 text-xl font-bold uppercase text-white">
                        Usuarios registrados
                    </h2>

                    <div className="mb-7 grid gap-4 rounded-2xl border border-slate-700 bg-slate-700 p-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="buscar-usuario"
                                className="mb-2 block text-sm font-semibold text-slate-200"
                            >
                                Buscar
                            </label>

                            <input
                                id="buscar-usuario"
                                type="text"
                                value={busqueda}
                                onChange={cambiarBusqueda}
                                placeholder="Nombre, correo, teléfono o cédula"
                                className="w-full rounded-xl border border-slate-500 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-lime-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="filtro-rol"
                                className="mb-2 block text-sm font-semibold text-slate-200"
                            >
                                Rol
                            </label>

                            <select
                                id="filtro-rol"
                                value={rol}
                                onChange={cambiarRol}
                                className="w-full rounded-xl border border-slate-500 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-lime-400"
                            >
                                <option value="Todos">
                                    Todos los roles
                                </option>

                                <option value="Cliente">
                                    Cliente
                                </option>

                                <option value="Restaurante">
                                    Restaurante
                                </option>

                                <option value="Repartidor">
                                    Repartidor
                                </option>

                                <option value="Administrador">
                                    Administrador
                                </option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-400 bg-red-500/20 p-4 text-red-100">
                            {error}
                        </div>
                    )}

                    {cargando && (
                        <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-10 text-center text-slate-200">
                            Cargando usuarios...
                        </div>
                    )}

                    {!cargando && usuarios.length === 0 && (
                        <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-10 text-center text-slate-200">
                            No se encontraron usuarios.
                        </div>
                    )}

                    {!cargando && usuarios.length > 0 && (
                        <div className="overflow-x-auto rounded-2xl border border-slate-700">
                            <table className="w-full min-w-[900px] border-collapse">
                                <thead className="bg-slate-100 text-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Usuario
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium">
                                        Cédula
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium">
                                        Teléfono
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium">
                                        Correo
                                    </th>

                                    <th className="px-4 py-3 text-center font-medium">
                                        Rol
                                    </th>

                                    <th className="px-4 py-3 text-center font-medium">
                                        Estado
                                    </th>

                                    <th className="px-4 py-3 text-center font-medium">
                                        Fecha de registro
                                    </th>

                                    <th className="px-4 py-3 text-right font-medium">
                                        Acción
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="bg-slate-700 text-white">
                                {usuarios.map((usuario) => (
                                    <tr
                                        key={usuario.usuarioId}
                                        className="border-t border-slate-600"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {usuario.nombre}{' '}
                                            {usuario.apellido || ''}
                                        </td>

                                        <td className="px-4 py-3 text-slate-200">
                                            {usuario.cedula ||
                                                'No registrada'}
                                        </td>

                                        <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                                            {usuario.telefono ||
                                                'No registrado'}
                                        </td>

                                        <td className="px-4 py-3 text-slate-200">
                                            {usuario.email}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                                <span className="inline-flex rounded-full border border-white px-3 py-1 text-xs font-semibold text-white">
                                                    {usuario.rol}
                                                </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                                <span className="inline-flex rounded-full border border-white px-3 py-1 text-xs font-semibold text-white">
                                                    {usuario.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                        </td>

                                        <td className="px-4 py-3 text-center text-slate-200 whitespace-nowrap">
                                            {new Date(
                                                usuario.fechaRegistro
                                            ).toLocaleDateString(
                                                'es-CR'
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    cambiarEstado(
                                                        usuario.usuarioId,
                                                        usuario.activo
                                                    )
                                                }
                                                className={`rounded-full border border-white px-4 py-1.5 text-xs font-semibold text-white transition whitespace-nowrap ${
                                                    usuario.activo
                                                        ? 'hover:border-red-600 hover:bg-red-600'
                                                        : 'hover:bg-white hover:text-slate-700'
                                                }`}
                                            >
                                                {usuario.activo
                                                    ? 'Desactivar'
                                                    : 'Activar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <PaginacionUsuarios
                        pagina={pagina}
                        totalPaginas={totalPaginas}
                        onCambiarPagina={setPagina}
                    />
                </section>
            </div>

            {mostrarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Nuevo administrador
                                </h2>

                                <p className="mt-1 text-sm text-slate-300">
                                    Complete los datos del nuevo administrador.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cerrarModalAdministrador}
                                className="rounded-lg px-3 py-2 text-xl text-slate-400 transition hover:bg-slate-700 hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl border border-red-400 bg-red-500/20 px-4 py-3 text-red-100">
                                {error}
                            </div>
                        )}

                        {mensajeExito && (
                            <div className="mb-4 rounded-xl border border-emerald-400 bg-emerald-500/20 px-4 py-3 text-emerald-100">
                                {mensajeExito}
                            </div>
                        )}

                        <form
                            onSubmit={registrarAdministrador}
                            className="grid gap-5 md:grid-cols-2"
                        >
                            <CampoFormulario
                                etiqueta="Nombre"
                                name="nombre"
                                value={nuevoAdministrador.nombre}
                                onChange={cambiarCampoAdministrador}
                                required
                            />

                            <CampoFormulario
                                etiqueta="Apellido"
                                name="apellido"
                                value={nuevoAdministrador.apellido}
                                onChange={cambiarCampoAdministrador}
                                required
                            />

                            <CampoFormulario
                                etiqueta="Correo electrónico"
                                name="email"
                                type="email"
                                value={nuevoAdministrador.email}
                                onChange={cambiarCampoAdministrador}
                                required
                            />

                            <CampoFormulario
                                etiqueta="Contraseña"
                                name="password"
                                type="password"
                                value={nuevoAdministrador.password}
                                onChange={cambiarCampoAdministrador}
                                required
                                minLength={6}
                            />

                            <CampoFormulario
                                etiqueta="Confirmar contraseña"
                                name="confirmarPassword"
                                type="password"
                                value={nuevoAdministrador.confirmarPassword}
                                onChange={cambiarCampoAdministrador}
                                required
                                minLength={6}
                            />
                            <CampoFormulario
                                etiqueta="Teléfono"
                                name="telefono"
                                value={nuevoAdministrador.telefono}
                                onChange={cambiarCampoAdministrador}
                                required
                            />

                            <CampoFormulario
                                etiqueta="Cédula"
                                name="cedula"
                                value={nuevoAdministrador.cedula}
                                onChange={cambiarCampoAdministrador}
                                required
                            />

                            <div className="flex justify-end gap-3 md:col-span-2">
                                <button
                                    type="button"
                                    onClick={cerrarModalAdministrador}
                                    disabled={guardando}
                                    className="rounded-full border border-white px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="rounded-full border border-white px-6 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
                                >
                                    {guardando
                                        ? 'Registrando...'
                                        : 'Registrar administrador'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function TarjetaResumen({ icono: Icono, titulo, valor }) {
    return (
        <article className="rounded-2xl border-2 border-white bg-slate-900/40 p-6 text-center text-white">
            <Icono size={32} className="mx-auto mb-3 text-lime-400" />

            <p className="text-lg font-semibold">
                {titulo}
            </p>

            <p className="mt-3 text-3xl font-extrabold">
                {valor}
            </p>
        </article>
    )
}

function CampoFormulario({
                             etiqueta,
                             name,
                             type = 'text',
                             value,
                             onChange,
                             required = false,
                             minLength,
                         }) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-300">
                {etiqueta}
            </span>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                minLength={minLength}
                className="rounded-xl border border-slate-500 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-lime-400"
            />
        </label>
    )
}

// Paginación numerada con el mismo look que PaginacionProductos.
// No mostramos "Mostrando X-Y de Z" porque el endpoint solo devuelve totalPaginas, no el total exacto de usuarios filtrados.
function PaginacionUsuarios({ pagina, totalPaginas, onCambiarPagina }) {
    const paginas = []
    for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i)
    }

    function irPaginaAnterior() {
        if (pagina > 1) {
            onCambiarPagina(pagina - 1)
        }
    }

    function irPaginaSiguiente() {
        if (pagina < totalPaginas) {
            onCambiarPagina(pagina + 1)
        }
    }

    return (
        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-300">
            <p>
                Página {pagina} de {totalPaginas}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    onClick={irPaginaAnterior}
                    disabled={pagina === 1}
                    className="hover:text-lime-400 disabled:opacity-30"
                >
                    {'<'}
                </button>

                {paginas.map((numeroPagina) => {
                    let claseBoton = 'hover:text-lime-400'
                    if (numeroPagina === pagina) {
                        claseBoton = 'text-lime-400 font-bold'
                    }

                    return (
                        <button
                            key={numeroPagina}
                            onClick={() => onCambiarPagina(numeroPagina)}
                            className={claseBoton}
                        >
                            {numeroPagina}
                        </button>
                    )
                })}

                <button
                    onClick={irPaginaSiguiente}
                    disabled={pagina === totalPaginas}
                    className="hover:text-lime-400 disabled:opacity-30"
                >
                    {'>'}
                </button>
            </div>
        </div>
    )
}

export default GestionUsuarios