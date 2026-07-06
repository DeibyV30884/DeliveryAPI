import apiClient from './client'

export function obtenerProductosGestion() {
    return apiClient.get('/api/Productos/gestion')
}

export function crearProducto(datos) {
    return apiClient.post('/api/Productos', datos)
}

export function editarProducto(productoId, datos) {
    return apiClient.put(`/api/Productos/${productoId}`, datos)
}

export function eliminarProducto(productoId) {
    return apiClient.delete(`/api/Productos/${productoId}`)
}

export function subirImagenProducto(archivo) {
    const formData = new FormData()
    formData.append('archivo', archivo)

    return apiClient.post('/api/Productos/imagenes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}