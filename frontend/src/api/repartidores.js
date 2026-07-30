
import apiClient from './client'

export function obtenerHistorialEstadisticasRepartidor({
     estado = 'Entregado',
     periodo = 'hoy',
} = {}) {
    return apiClient.get('/api/Repartidores/historial-estadisticas', {
        params: {
            estado: estado || undefined,
            periodo: periodo || undefined,
        },
    })
}










