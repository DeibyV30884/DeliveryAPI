import { useEffect, useState } from 'react'
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
    }, [busqueda, rol, pagina])

    const cambiarRol = (event) => {
        setRol(event.target.value)
        setPagina(1)
    }

    const cambiarBusqueda = (event) => {
        setBusqueda(event.target.value)
        setPagina(1)
    }

    const obtenerClaseRol = (rolUsuario) => {
        switch (rolUsuario) {
            case 'Administrador':
                return 'bg-purple-200 text-purple-800'

            case 'Cliente':
                return 'bg-blue-200 text-blue-800'

            case 'Restaurante':
                return 'bg-orange-200 text-orange-800'

            case 'Repartidor':
                return 'bg-cyan-200 text-cyan-800'

            default:
                return 'bg-slate-200 text-slate-800'
        }
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
                        <h1 className="text-3xl font-bold text-white">
                            Gestión de Usuarios
                        </h1>

                        <p className="mt-1 text-slate-400">
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
                        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Nuevo administrador
                    </button>
                </div>

                <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <TarjetaResumen
                        titulo="Clientes"
                        valor={resumen.clientes}
                    />

                    <TarjetaResumen
                        titulo="Restaurantes"
                        valor={resumen.restaurantes}
                    />

                    <TarjetaResumen
                        titulo="Repartidores"
                        valor={resumen.repartidores}
                    />

                    <TarjetaResumen
                        titulo="Administradores"
                        valor={resumen.administradores}
                    />
                </section>

                <section className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row">
                        <input
                            type="text"
                            value={busqueda}
                            onChange={cambiarBusqueda}
                            placeholder="Buscar por nombre, correo, teléfono o cédula"
                            className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                        />

                        <select
                            value={rol}
                            onChange={cambiarRol}
                            className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
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

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-900 px-4 py-3 text-red-200">
                            {error}
                        </div>
                    )}

                    {cargando ? (
                        <p className="py-10 text-center text-slate-300">
                            Cargando usuarios...
                        </p>
                    ) : usuarios.length === 0 ? (
                        <p className="py-10 text-center text-slate-300">
                            No se encontraron usuarios.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 bg-slate-900 text-left text-sm text-slate-300">
                                        <th className="px-4 py-4">
                                            Usuario
                                        </th>

                                        <th className="px-4 py-4">
                                            Cédula
                                        </th>

                                        <th className="px-4 py-4">
                                            Teléfono
                                        </th>

                                        <th className="px-4 py-4">
                                            Correo
                                        </th>

                                        <th className="px-4 py-4">
                                            Rol
                                        </th>

                                        <th className="px-4 py-4">
                                            Estado
                                        </th>

                                        <th className="px-4 py-4">
                                            Fecha de registro
                                        </th>

                                        <th className="px-4 py-4 text-right">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {usuarios.map((usuario) => (
                                        <tr
                                            key={usuario.usuarioId}
                                            className="border-b border-slate-700 text-sm transition hover:bg-slate-700"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-white">
                                                    {usuario.nombre}{' '}
                                                    {usuario.apellido || ''}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 text-slate-200">
                                                {usuario.cedula ||
                                                    'No registrada'}
                                            </td>

                                            <td className="px-4 py-4 text-slate-200">
                                                {usuario.telefono ||
                                                    'No registrado'}
                                            </td>

                                            <td className="px-4 py-4 text-slate-200">
                                                {usuario.email}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerClaseRol(
                                                        usuario.rol
                                                    )}`}
                                                >
                                                    {usuario.rol}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        usuario.activo
                                                            ? 'bg-green-200 text-green-800'
                                                            : 'bg-red-200 text-red-800'
                                                    }`}
                                                >
                                                    {usuario.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-slate-200">
                                                {new Date(
                                                    usuario.fechaRegistro
                                                ).toLocaleDateString(
                                                    'es-CR'
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        cambiarEstado(
                                                            usuario.usuarioId,
                                                            usuario.activo
                                                        )
                                                    }
                                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                                        usuario.activo
                                                            ? 'bg-red-200 text-red-800 hover:bg-red-300'
                                                            : 'bg-green-200 text-green-800 hover:bg-green-300'
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

                    <div className="mt-6 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={pagina <= 1}
                            onClick={() =>
                                setPagina((actual) => actual - 1)
                            }
                            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Anterior
                        </button>

                        <span className="text-sm text-slate-300">
                            Página {pagina} de {totalPaginas}
                        </span>

                        <button
                            type="button"
                            disabled={pagina >= totalPaginas}
                            onClick={() =>
                                setPagina((actual) => actual + 1)
                            }
                            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Siguiente
                        </button>
                    </div>
                </section>
            </div>
                {mostrarModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Nuevo administrador
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Complete los datos del nuevo administrador.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={cerrarModalAdministrador}
                                    className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-700 hover:text-white"
                                >
                                    ×
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 rounded-lg bg-red-900/60 px-4 py-3 text-red-200">
                                    {error}
                                </div>
                            )}

                            {mensajeExito && (
                                <div className="mb-4 rounded-lg bg-green-900/60 px-4 py-3 text-green-200">
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
                                        className="rounded-lg border border-slate-600 bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-600 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={guardando}
                                        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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

function TarjetaResumen({ titulo, valor }) {
    return (
        <article className="rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-lg">
            <p className="text-sm font-medium text-slate-400">
                {titulo}
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
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
                className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
        </label>
    )
}

export default GestionUsuarios