import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-linear-to-r from-brand-600 to-brand-500 py-12 px-6 overflow-hidden">
            <div className="flex flex-col max-w-7xl mx-auto gap-8">
                <div className="flex flex-col lg:flex-row justify-around items-center gap-12 lg:gap-8">
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-auto">
                        <p className="text-brand-100 mb-6 font-medium">Evento organizado por:</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-8 items-center md:gap-28 lg:gap-64">
                            <img
                                src="images/min-damas.png"
                                alt="logo blanco"
                                className="h-auto max-h-28 sm:max-h-36 lg:max-h-40 w-auto max-w-[80vw] object-contain drop-shadow-xl filter-[drop-shadow(0_10px_15px_var(--color-brand-500))]"
                            />
                            <img
                                src="/logo-white.png"
                                alt="logo blanco"
                                className="h-auto max-h-32 sm:max-h-40 lg:max-h-48 w-auto max-w-[80vw] object-contain drop-shadow-xl filter-[drop-shadow(0_10px_15px_var(--color-brand-500))]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-center w-full lg:w-auto">
                        <img
                            src="/logo-cogop-transparent.png"
                            alt="logo cogop"
                            className="h-auto max-h-32 sm:max-h-40 lg:max-h-48 w-auto max-w-[80vw] object-contain drop-shadow-xl filter-[drop-shadow(0_10px_15px_var(--color-brand-400))]"
                        />
                    </div>
                </div>
                <div className="w-full h-px bg-brand-400/50" />
                <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-3 pt-4">
                    <p className="text-brand-100 text-sm">2026 - Derechos Reservados </p>
                    <span className="hidden sm:inline text-brand-300 text-xs">|</span>
                    <Link
                        to="/admin/login"
                        className="text-brand-100 text-sm font-medium transition-colors hover:text-white hover:underline underline-offset-4">
                        Panel de Administración
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer