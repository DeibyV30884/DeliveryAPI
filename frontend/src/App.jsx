import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/auth/Login'
import RutaProtegida from './components/RutaProtegida'
import RegistroCliente from './pages/auth/RegistroCliente'

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
              <Route path="/registro/cliente" element={<RegistroCliente />} />
              <Route
                  path="/cliente"
                  element={
                      <RutaProtegida rolesPermitidos={['Cliente']}>
                          <h1>Panel Cliente (pendiente)</h1>
                      </RutaProtegida>
                  }
              />
              <Route
                  path="/restaurante"
                  element={
                      <RutaProtegida rolesPermitidos={['Restaurante']}>
                          <h1>Panel Restaurante (pendiente)</h1>
                      </RutaProtegida>
                  }
              />
              <Route
                  path="/repartidor"
                  element={
                      <RutaProtegida rolesPermitidos={['Repartidor']}>
                          <h1>Panel Repartidor (pendiente)</h1>
                      </RutaProtegida>
                  }
              />
              <Route
                  path="/admin"
                  element={
                      <RutaProtegida rolesPermitidos={['Admin']}>
                          <h1>Panel Admin (pendiente)</h1>
                      </RutaProtegida>
                  }
              />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  )
}

export default App