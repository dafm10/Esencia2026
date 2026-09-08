import { Link } from "react-router-dom"
import { FaExclamationTriangle } from "react-icons/fa"

const NotFoundPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-24 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 mb-8">
                <FaExclamationTriangle className="text-5xl text-brand-600" />
            </div>
            
            <h1 className="mb-4 text-6xl font-black tracking-tight text-slate-900 md:text-8xl">
                404
            </h1>
            
            <h2 className="mb-6 text-2xl font-bold text-slate-800 md:text-3xl">
                ¡Página no encontrada!
            </h2>
            
            <p className="mb-10 max-w-md text-lg text-slate-600">
                Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
            
            <Link
                to="/"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-brand-600 px-8 text-sm font-bold tracking-wide text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30"
            >
                VOLVER AL INICIO
            </Link>
        </div>
    )
}

export default NotFoundPage
