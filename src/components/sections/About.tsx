import { FaWpforms } from "react-icons/fa"
import { stats } from "../../data/content"
import FadeIn from "../ui/FadeIn"

const About = () => {
    return (
        <section id="conferencia" className="bg-brand-50 py-24">
            <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
                <FadeIn direction="right">
                    <h2 className="mb-4 text-4xl font-bold text-slate-900">
                        Congreso Esencia
                    </h2>
                    <div className="mb-6 h-1 w-16 bg-linear-to-r from-brand-500 to to-brand-400" />

                    <p className="mb-4 font-normal text-lg text-slate-700">
                        VIVE CON IDENTIDAD Y VISIÓN DEL REINO
                    </p>

                    <p className="mb-8 leading-relaxed text-slate-500">
                        Nos alegra que seas parte de este gran Congreso Esencia 2026, un tiempo para tu corazón, con enseñanzas que transformarán tu vida y harán que seas una mujer que inspira hacia un propósito que trasciende.
                    </p>

                    <a href="#registro" className="w-min flex gap-2 items-center rounded-full bg-linear-to-r from-brand-800 to-brand-500 px-8 py-3 text-sm font-semibold text-white hover:opacity-90">
                        <FaWpforms />
                        Registro
                    </a>
                </FadeIn>

                <FadeIn direction="left" delay={0.2}>
                    <div className="grid grid-cols-2 divide-x divide-y divide-dashed divide-brand-200 overflow-hidden border border-dashed border-brand-200 bg-white rounded-2xl">
                        {stats.map(({ icon: Icon, value, label }) => (
                            <div key={label} className="group flex flex-col items-center justify-center gap-2 px-6 py-10 text-center transition-colors duration-300 hover:bg-brand-500">
                                <Icon className="mb-2 h-8 w-8 text-brand-800 transition-colors duration-300 group-hover:text-white" />
                                <p className="text-xl font-bold text-slate-800 transition-colors duration-300 group-hover:text-white">{value}</p>
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 transition-colors duration-300 group-hover:text-white">{label}</p>
                            </div>
                        ))}
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}

export default About