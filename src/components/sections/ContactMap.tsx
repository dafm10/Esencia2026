import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaExternalLinkAlt } from "react-icons/fa"
import { contactInfo } from "../../data/content"

const ContactMap = () => {
    return (
        <section id="contacto" className="relative h-175 w-full overflow-hidden">

            <iframe title="Ubicación del evento"
                src={`https://www.google.com/maps?q=${encodeURIComponent(contactInfo.mapQuery)}&z=16&output=embed`}
                className="absolute inset-y-0 right-0 h-full w-full md:w-[150%] lg:w-[150%] grayscale invert-[0.9] contrast-[0.9]"
                loading="lazy" allowFullScreen
            />

            <a
                href={contactInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold tracking-wider text-white shadow-lg backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 border border-white/20"
            >
                <FaExternalLinkAlt className="text-xs" />
                ABRIR EN MAPAS
            </a>

            <div className="absolute inset-y-0 right-0 flex w-full items-center bg-linear-to-r from-transparent via-slate-950/70 to-slate-950/95 px-6 md:w-2/3 lg:w-1/2">
                <div className="ml-auto max-w-md">
                    <h2 className="mb-4 text-4xl font-bold text-white">Contacto</h2>
                    <div className="mb-6 h-1 w-16 bg-linear-to-r from-brand-300 to-brand-400" />

                    <p className="mb-10 text-slate-300">
                        Aqui tienes más información para cualquier duda o problemas con tu registro
                    </p>

                    <div className="mb-6 flex items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-dashed border-brand-400/50">
                            <FaMapMarkerAlt className="h-5 w-5 text-brand-400" />
                        </span>
                        <div className="text-white">
                            <p className="font-semibold">{contactInfo.address.line1}</p>
                            <p className="font-semibold">{contactInfo.address.line2}</p>
                        </div>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-dashed border-brand-400/50">
                            <FaPhone className="h-5 w-5 text-brand-400" />
                        </span>
                        <div className="text-white">
                            {contactInfo.phones.map((phone) => (
                                <p key={phone} className="font-semibold">{phone}</p>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-dashed border-brand-400/50">
                            <FaEnvelope className="h-5 w-5 text-brand-400" />
                        </span>
                        <div className="text-white">
                            {contactInfo.emails.map((email) => (
                                <p key={email} className="font-semibold">{email}</p>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6 border-t border-dashed border-slate-600" />

                    <div className="flex gap-3">
                        {contactInfo.social.map(({ icon: Icon, href }, i) => (
                            <a key={i} href={href} className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white hover:text-brand-600">
                                <Icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

        </section>
    )
}

export default ContactMap