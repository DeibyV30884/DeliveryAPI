import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/auth/Login'
import RutaProtegida from './components/RutaProtegida'
import RegistroCliente from './pages/auth/RegistroCliente'
import RegistroRestaurante from './pages/auth/RegistroRestaurante'
import RegistroRepartidor from './pages/auth/RegistroRepartidor'
import PanelCliente from './pages/cliente/PanelCliente'
import PerfilCliente from './pages/cliente/PerfilCliente'


function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
              <Route path="/registro/cliente" element={<RegistroCliente />} />
              <Route path="/registro/restaurante" element={<RegistroRestaurante />} />
              <Route path="/registro/repartidor" element={<RegistroRepartidor />} />
              <Route
                  path="/cliente"
                  element={
                      <RutaProtegida rolesPermitidos={['Cliente']}>
                          <PanelCliente />
                      </RutaProtegida>
                  }
              >
                  <Route path="perfil" element={<PerfilCliente />} />
                  <Route path="restaurantes" element={<h1 className="text-white">Explorar Restaurantes pendiente</h1>} />
                  <Route path="seguimiento" element={<h1 className="text-white">Seguimiento pendiente</h1>} />
                  <Route path="historial" element={<h1 className="text-white">Historial pendiente</h1>} />
              </Route>
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