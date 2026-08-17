import apiClient from './client'

// Login y registro

export function login(credenciales) {
    return apiClient.post('/api/Usuarios/login', credenciales)
}

export function registrarCliente(datos) {
    return apiClient.post('/api/Usuarios/registro/cliente', datos)
}

export function registrarRestaurante(datos) {
    return apiClient.post('/api/Usuarios/registro/restaurante', datos)
}

export function obtenerRestaurantes() {
    return apiClient.get('/api/Restaurante')
}

export function obtenerProductosRestaurante(restauranteId) {
    return apiClient.get(`/api/Productos/restaurante/${restauranteId}`)
}

export function obtenerProductoPorId(productoId) {
    return apiClient.get(`/api/Productos/${productoId}`)
}


export function registrarRepartidor(datos) {
    return apiClient.post('/api/Usuarios/registro/repartidor', datos)
}

// Cliente

export function obtenerPerfilCliente() {
    return apiClient.get('/api/Clientes/perfil')
}

export function editarPerfilCliente(datos) {
    return apiClient.put('/api/Clientes/perfil', datos)
}

export function desactivarPerfilCliente() {
    return apiClient.put('/api/Clientes/perfil/desactivar')
}

export function obtenerSaldoCliente() {
    return apiClient.get('/api/Clientes/saldo')
}

export function extraerCoordenadas(link) {
    return apiClient.post('/api/Clientes/extraer-coordenadas', JSON.stringify(link), {
        headers: { 'Content-Type': 'application/json' }
    })
}

// Ciente Pedidos

export function previsualizarPedido(datos) {
    return apiClient.post('/api/Pedidos/preview', datos)
}

export function crearPedido(datos) {
    return apiClient.post('/api/Pedidos', datos)
}

export function obtenerSeguimientoPedido(pedidoId) {
    return apiClient.get(`/api/Pedidos/${pedidoId}/seguimiento`)
}

export function obtenerHistorialPedidos() {
    return apiClient.get('/api/Pedidos/historial')
}


// Restaurante
export function obtenerPerfilRestaurante() {
    return apiClient.get('/api/Restaurante/perfil')
}

export function editarPerfilRestaurante(datos) {
    return apiClient.put('/api/Restaurante/perfil', datos)
}

export function desactivarPerfilRestaurante() {
    return apiClient.put('/api/Restaurante/perfil/desactivar')
}

export function extraerCoordenadasRestaurante(link) {
    return apiClient.post('/api/Restaurante/extraer-coordenadas', JSON.stringify(link), {
        headers: { 'Content-Type': 'application/json' }
    })
}

export function subirImagenRestaurante(archivo) {
    const formData = new FormData()
    formData.append('archivo', archivo)

    return apiClient.post('/api/Restaurante/imagenes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

export function obtenerRepartidoresUbicacion() {
    return apiClient.get('/api/Restaurante/repartidores/ubicaciones')
}

// Restaurante - Pedidos

export function obtenerPedidosPendientesRestaurante() {
    return apiClient.get('/api/Pedidos/restaurante/pendientes')
}

export function obtenerPedidosActivosRestaurante() {
    return apiClient.get('/api/Pedidos/restaurante/activos')
}

export function obtenerRepartidoresDisponibles() {
    return apiClient.get('/api/Pedidos/restaurante/repartidores-disponibles')
}

export function asignarRepartidorPedido(pedidoId, repartidorId) {
    return apiClient.post(`/api/Pedidos/restaurante/${pedidoId}/asignar/${repartidorId}`)
}

export function obtenerPedidosAceptadosRestaurante() {
    return apiClient.get('/api/Pedidos/restaurante/aceptados')
}

export function aceptarPedidoRestaurante(pedidoId) {
    return apiClient.post(`/api/Pedidos/restaurante/${pedidoId}/aceptar`)
}

// Repartidor - Perfil y disponibilidad

export function obtenerPerfilRepartidor() {
    return apiClient.get('/api/Repartidores/perfil')
}

export function editarPerfilRepartidor(datos) {
    return apiClient.put('/api/Repartidores/perfil', datos)
}

export function cambiarDisponibilidad(disponible) {
    return apiClient.put('/api/Repartidores/disponibilidad', disponible, {
        headers: { 'Content-Type': 'application/json' }
    })
}

export function desactivarPerfilRepartidor() {
    return apiClient.put('/api/Repartidores/perfil/desactivar')
}

export function obtenerHistorialEstadisticasRepartidor(estado, periodo) {
    return apiClient.get('/api/Repartidores/historial-estadisticas', {
        params: { estado, periodo }
    })
}

// Repartidor - Pedidos

export function obtenerAsignadoPendiente() {
    return apiClient.get('/api/Pedidos/repartidor/asignado-pendiente')
}

export function obtenerPedidoActivoRepartidor() {
    return apiClient.get('/api/Pedidos/repartidor/activo')
}

export function aceptarPedidoRepartidor(pedidoId) {
    return apiClient.post(`/api/Pedidos/repartidor/${pedidoId}/aceptar`)
}

export function devolverPedidoRepartidor(pedidoId) {
    return apiClient.post(`/api/Pedidos/repartidor/${pedidoId}/devolver`)
}

export function confirmarEntregaRepartidor(pedidoId, codigoConfirmacion) {
    return apiClient.post(`/api/Pedidos/repartidor/${pedidoId}/confirmar-entrega`, JSON.stringify(codigoConfirmacion), {
        headers: { 'Content-Type': 'application/json' }
    })
}

export function obtenerEstadoRegreso() {
    return apiClient.get('/api/Pedidos/repartidor/estado-regreso')
}

// Administrador

export function obtenerPerfilAdministrador() {
    return apiClient.get('/api/Administrador/perfil')
}

export function editarPerfilAdministrador(datos) {
    return apiClient.put('/api/Administrador/perfil', datos)
}

export function desactivarPerfilAdministrador() {
    return apiClient.put('/api/Administrador/perfil/desactivar')
}

export function registrarAdministrador(datos) {
    return apiClient.post('/api/Administrador/registro', datos)
}

///Administrador//recargasaldos
export function buscarClientesRecarga(termino) {
    return apiClient.get('/api/RecargasSaldo/buscar-clientes', {
        params: { termino }
    })
}

export function obtenerHistorialRecargas() {
    return apiClient.get('/api/RecargasSaldo/historial')
}

export function crearRecargaSaldo(datos) {
    return apiClient.post('/api/RecargasSaldo', datos)
}

export function obtenerResumenUsuarios() {
    return apiClient.get('/api/Administrador/usuarios/resumen')
}

export function obtenerEstadisticasDashboard(periodo = 'hoy') {
    return apiClient.get('/api/Administrador/dashboard', {
        params: { periodo }
    })
}

export function solicitarRecuperacionContrasena(email) {
    return apiClient.post('/api/Usuarios/recuperar-contrasena', { email })
}

export function restablecerContrasena(token, nuevaContrasena) {
    return apiClient.post('/api/Usuarios/restablecer-contrasena', {
        token,
        nuevaContrasena
    })
}
