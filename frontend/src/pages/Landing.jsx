import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const accesos = [
    {
        titulo: 'Soy Cliente',
        texto: 'Pide en sus restaurantes favoritos y siga su pedido en tiempo real.',
        link: '/registro/cliente',
        boton: 'Regístrate',
    },
    {
        titulo: 'Tengo un Restaurante',
        texto: ' Publique su menú y reciba pedidos directo desde la plataforma.',
        link: '/registro/restaurante',
        boton: 'Asocie su restaurante',
    },
    {
        titulo: 'Quiero Repartir',
        texto: 'Trabaje con nosotros y gestione sus entregas desde su perfil.',
        link: '/registro/repartidor',
        boton: 'Trabaje con nosotros',
    },
]

function Landing() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />

            <section className="flex-1 flex flex-col items-center justify-center  text-center px-5 py-16">
                <h1 className="text-5xl sm:text-7xl font-bold text-lime-400 mb-4">
                    Pide. Cocina. Entrega.
                </h1>
                <p className="text-white text-lg max-w-xl mb-8">
                    La plataforma que conecta clientes, restaurantes y repartidores en un solo lugar.
                </p>
                <Link
                    to="/login"
                    className="border border-white text-white rounded-full px-8 py-2 hover:bg-white hover:text-slate-700 transition"
                >
                    Iniciar Sesión
                </Link>
            </section>

            {/* Registrarse por rol */}
            <section className="px-5 pb-20">
                <div className="grid gap-8 sm:grid-cols-3 max-w-6xl mx-auto">
                    {accesos.map((a) => (
                        <div
                            key={a.titulo}
                            className="bg-slate-700 rounded-2xl p-10 flex flex-col items-center text-center min-h-[320px] justify-center"
                        >
                            <h2 className="text-white font-bold text-3xl mb-4">{a.titulo}</h2>
                            <p className="text-slate-200 text-base mb-8">{a.texto}</p>
                            <Link
                                to={a.link}
                                className="text-yellow-400 font-semibold text-lg hover:underline"
                            >
                                {a.boton}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default Landing