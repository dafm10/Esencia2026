import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTicketAlt, FaTimes } from "react-icons/fa"

const FloatingBanner = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Retrasamos la aparición para no bloquear el LCP inicial de la página
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 150, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 90, damping: 20 }}
                    className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl sm:bottom-8"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-slate-900/85 px-5 py-4 text-white shadow-2xl backdrop-blur-md sm:px-6">
                        <div className="flex items-center gap-3">
                            <span 
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300" 
                                aria-hidden="true"
                            >
                                <FaTicketAlt className="h-5 w-5" />
                            </span>
                            <p className="text-sm font-medium sm:text-base">
                                <strong className="font-bold text-brand-300">¡Últimos cupos!</strong> Asegura tu lugar en Esencia 2026 antes de que se agoten.
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                            <a
                                href="#registro"
                                className="hidden rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-900 sm:block"
                                onClick={() => setIsVisible(false)}
                            >
                                Registrarme
                            </a>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                                aria-label="Cerrar advertencia de cupos"
                            >
                                <FaTimes className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default FloatingBanner
