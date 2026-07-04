import axios from 'axios'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use((config) => {

    const usuario = localStorage.getItem('usuario')
    if (usuario) {
        const { token } = JSON.parse(usuario)
         config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default apiClient