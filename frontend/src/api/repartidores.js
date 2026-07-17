
import apiClient from './client'

export function obtenerHistorialEstadisticasRepartidor({
     estado = 'Entregado',
     fecha = '',
} = {}) {
    return apiClient.get('/api/Repartidores/historial-estadisticas', {
        params: {
            estado: estado || undefined,
            fecha: fecha || undefined,
        },
    })
}










