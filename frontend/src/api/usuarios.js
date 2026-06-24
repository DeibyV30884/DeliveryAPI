import apiClient from './client'

export function login(credenciales) {
    return apiClient.post('/api/Usuarios/login', credenciales)
}