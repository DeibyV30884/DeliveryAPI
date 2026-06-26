import apiClient from './client'

export function login(credenciales) {
    return apiClient.post('/api/Usuarios/login', credenciales)
}

export function registrarCliente(datos) {
    return apiClient.post('/api/Usuarios/registro/cliente', datos)
}