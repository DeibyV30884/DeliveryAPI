import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/auth/Login'
import RutaProtegida from './components/RutaProtegida'
import RegistroCliente from './pages/auth/RegistroCliente'
import RegistroRestaurante from './pages/auth/RegistroRestaurante'
import RegistroRepartidor from './pages/auth/RegistroRepartidor'
import PanelCliente from './pages/cliente/PanelCliente'
import PerfilCliente from './pages/cliente/PerfilCliente'
import PerfilRestaurante from './pages/restaurante/PerfilRestaurante'
import PanelRestaurante from './pages/restaurante/PanelRestaurante';
import PanelRepartidor from './pages/repartidor/PanelRepartidor'
import PerfilRepartidor from './pages/repartidor/PerfilRepartidor'


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
                          <PanelRestaurante />
                      </RutaProtegida>
                  }
              >
                <Route path="perfil" element={<PerfilRestaurante />} />
                <Route path="gestionporducto" element={<h1 className="text-white">Explorar Restaurantes pendiente</h1>} />
                <Route path="repartidores" element={<h1 className="text-white">Seguimiento pendiente</h1>} />
                <Route path="pedidos" element={<h1 className="text-white">Historial pendiente</h1>} />
                </Route>
              <Route
                  path="/repartidor"
                  element={
                      <RutaProtegida rolesPermitidos={['Repartidor']}>
                          <PanelRepartidor />
                      </RutaProtegida>
                  }
              >
                  <Route path="panelprincipal" element={<h1 className="text-white">Panel Principal pendiente</h1>} />
                  <Route path="pedidoactivo" element={<h1 className="text-white">Pedido activo pendiente</h1>} />
                  <Route path="historialyestadisticas" element={<h1 className="text-white">Historial y estadísticas pendiente</h1>} />
                  <Route path="perfil" element={<PerfilRepartidor />} />
              </Route>
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