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
    return apiClient.get('/api/Restaurantes')
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

// Repartidor

export function obtenerPerfilRepartidor() {
    return apiClient.get('/api/Repartidores/perfil')
}

export function editarPerfilRepartidor(datos) {
    return apiClient.put('/api/Repartidores/perfil', datos)
}

export function desactivarPerfilRepartidor() {
    return apiClient.put('/api/Repartidores/desactivar')
}
