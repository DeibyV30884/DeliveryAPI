import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/auth/Login'
import RutaProtegida from './components/RutaProtegida'
import RegistroCliente from './pages/auth/RegistroCliente'
import RegistroRestaurante from './pages/auth/RegistroRestaurante'
import RegistroRepartidor from './pages/auth/RegistroRepartidor'
import PanelCliente from './pages/cliente/PanelCliente'
import PerfilCliente from './pages/cliente/PerfilCliente'
import PerfilRestaurante from './pages/restaurante/PerfilRestaurante'
import PanelRestaurante from './pages/restaurante/PanelRestaurante'
import PanelRepartidor from './pages/repartidor/PanelRepartidor'
import PerfilRepartidor from './pages/repartidor/PerfilRepartidor'
import PanelAdministrador from './pages/administrador/PanelAdministrador'
import PerfilAdministrador from './pages/administrador/PerfilAdministrador'
import ExplorarRestaurantes from './pages/cliente/ExplorarRestaurantes'
import ProductosRestaurante from './pages/cliente/ProductosRestaurante'
import DetalleProducto from './pages/cliente/DetalleProducto'
import GestionProductos from './pages/restaurante/GestionProductos'
import AgregarProducto from './pages/restaurante/AgregarProducto'
import EditarProducto from './pages/restaurante/EditarProducto'
import Landing from './pages/Landing'
import RecargarSaldo from './pages/administrador/RecargarSaldo'
import HistorialCliente from './pages/cliente/HistorialCliente'
import HistorialEstadisticas from './pages/repartidor/HistorialEstadisticas'
import GestionUsuarios from './pages/administrador/GestionUsuarios'
import ConfirmarPedido from './pages/cliente/ConfirmarPedido'
import SeguimientoPedido from './pages/cliente/SeguimientoPedido'
import PedidosEntrantes from "./pages/restaurante/PedidosEntrantes";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
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
                        <Route index element={<Navigate to="restaurantes" replace />} />
                        <Route path="perfil" element={<PerfilCliente />} />
                        <Route path="restaurantes" element={<ExplorarRestaurantes />} />
                        <Route path="restaurantes/:restauranteId" element={<ProductosRestaurante />} />
                        <Route path="restaurantes/:restauranteId/productos/:productoId" element={<DetalleProducto />} />
                        <Route path="confirmar-pedido" element={<ConfirmarPedido />} />
                        <Route path="seguimiento" element={<SeguimientoPedido />} />
                        <Route path="historial" element={<HistorialCliente />} />
                    </Route>

                    <Route
                        path="/restaurante"
                        element={
                            <RutaProtegida rolesPermitidos={['Restaurante']}>
                                <PanelRestaurante />
                            </RutaProtegida>
                        }
                    >
                        <Route index element={<Navigate to="pedidos" replace />} />
                        <Route path="perfil" element={<PerfilRestaurante />} />
                        <Route path="gestionproducto" element={<GestionProductos />} />
                        <Route path="agregarproducto" element={<AgregarProducto />} />
                        <Route path="editarproducto/:id" element={<EditarProducto />} />
                        <Route path="repartidores" element={<h1 className="text-white">Seguimiento pendiente</h1>} />
                        <Route path="pedidos" element={<PedidosEntrantes />} />
                    </Route>

                    <Route
                        path="/repartidor"
                        element={
                            <RutaProtegida rolesPermitidos={['Repartidor']}>
                                <PanelRepartidor />
                            </RutaProtegida>
                        }
                    >
                        <Route
                            path="panelprincipal"
                            element={
                                <h1 className="text-white">
                                    Panel Principal pendiente
                                </h1>
                            }
                        />
                        <Route
                            path="pedidoactivo"
                            element={
                                <h1 className="text-white">
                                    Pedido activo pendiente
                                </h1>
                            }
                        />
                        <Route
                            path="historialyestadisticas"
                            element={<HistorialEstadisticas />}
                        />
                        <Route path="perfil" element={<PerfilRepartidor />} />
                    </Route>

                    <Route
                        path="/administrador"
                        element={
                            <RutaProtegida
                                rolesPermitidos={['Admin', 'Administrador']}
                            >
                                <PanelAdministrador />
                            </RutaProtegida>
                        }
                    >
                        <Route
                            path="panelprincipal"
                            element={
                                <h1 className="text-white">
                                    Panel Principal pendiente
                                </h1>
                            }
                        />
                        <Route
                            path="gestionusuarios"
                            element={<GestionUsuarios />}
                        />
                        <Route
                            path="recargarsaldo"
                            element={<RecargarSaldo />}
                        />
                        <Route
                            path="perfil"
                            element={<PerfilAdministrador />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App