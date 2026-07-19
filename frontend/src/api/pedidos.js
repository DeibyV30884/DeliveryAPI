import apiClient from './client'

export function obtenerHistorialCliente() {
    return apiClient.get('/api/Clientes/historial')
}