import apiClient from './client'

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