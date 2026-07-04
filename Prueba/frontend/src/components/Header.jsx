import logo from '../assets/telefono-inteligente.png'

function Header() {
    return (
        <header className="bg-slate-700 py-4 flex justify-center">
            <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-blue-200">DeUna CR</span>
                <img src={logo} alt="" className="h-13" />
            </div>
        </header>
    )
}

export default Header