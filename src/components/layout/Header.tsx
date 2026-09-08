import { useEffect, useState } from "react"
import { FaBars, FaTimes, FaWpforms } from 'react-icons/fa'
import { navLinks } from "../../data/content"

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        function handleScroll() {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="fixed top-0 left-0 z-50 w-full">
            <nav className={`w-full transition-all duration-300 ${isScrolled
                ? 'bg-brand-50/95 shadow-md backdrop-blur-sm py-4'
                : 'bg-brand-50 py-6'
                }`}>

                <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                    <a href="#inicio">
                        <img src="/logo-black.png"
                            alt="logo"
                            className="h-12 w-auto transition-all duration-300"
                        />
                    </a>
                    <div className="hidden items-center gap-8 text-sm font-semibold text-brand-950 lg:flex">
                        {navLinks.map((link) => (
                            <a key={link.href} href={link.href} className="transition-colors hover:text-brand-800">{link.label}</a>
                        ))}
                    </div>

                    <div className="hidden items-center gap-4 lg:flex">
                        <a href="#registro" className="flex gap-2 items-center rounded-full bg-brand-800 px-6 py-2.5 text-sm font-bold text-brand-50 shadow-sm transition-colors hover:bg-brand-600">
                            <FaWpforms /> Registro
                        </a>
                    </div>

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-[#5b3a4e] transition-colors hover:text-brand-800 lg:hidden"
                        aria-label="Abrir menú">
                        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>

                {menuOpen && (
                    <div className="absolute left-0 top-full flex w-full flex-col gap-4 bg-brand-950 px-6 py-6 shadow-lg lg:hidden">
                        {navLinks.map((link) => (
                            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-lg font-medium text-brand-50 hover:text-[#f3a6b8]">
                                {link.label}
                            </a>
                        ))}

                        <a href="#registro" onClick={() => setMenuOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-md bg-brand-800 px-6 py-3 text-center text-sm font-bold text-brand-50 hover:bg-[#f3a6b8]">
                            <FaWpforms /> Registro
                        </a>
                    </div>
                )}
            </nav>
        </header>
    )
}

export default Header