import { sectionIntros, speakers } from "../../data/content"
import FadeIn from "../ui/FadeIn"

const Speakers = () => {
    return (
        <section id="expositores" className="relative bg-cover bg-center bg-no-repeat bg-fixed py-24"
            style={{ backgroundImage: "url('/images/spseaker_bg.webp')" }}>
            <div className="absolute inset-0 bg-brand-700/80" />
            <div className="relative z-10 mx-auto max-w-7xl px-6">
                {/* Encabezado de la sección */}
                <FadeIn direction="down">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <h2 className="mb-4 text-4xl font-bold text-white">{sectionIntros.speakers.title}</h2>
                        <div className="mx-auto mb-6 h-1 w-16 bg-linear-to-r from-brand-300 to-brand-50" />
                        <p className="text-brand-100">{sectionIntros.speakers.description}</p>
                    </div>
                </FadeIn>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-12">
                    {speakers.map((speaker, index) => (
                        <FadeIn
                            key={speaker.name}
                            delay={index * 0.1}
                            direction="up"
                            fullWidth
                            className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.333rem)] lg:w-[calc(20%-1.6rem)]"
                        >
                            <div className="group relative aspect-9/10 w-full overflow-hidden">
                                <img src={speaker.image} alt={speaker.name} className="h-full w-full object-cover" />
                                {/* <div className="absolute inset-0 flex items-center justify-center gap-3 bg-linear-to-br from-brand-600 to-brand-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <div className="grid grid-cols-2 place-items-center gap-3">
                                        {socialIcons.map(({ icon: Icon, href }, i) => (
                                            <a key={i} href={href} className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white hover:text-brand-600">
                                                <Icon className="h-4 w-4" />
                                            </a>
                                        ))}
                                    </div>
                                </div> */}
                            </div>

                            <div className="mt-4 border-1-2 border-brand-400 pl-4">
                                <h3 className="font-bold text-white">{speaker.name}</h3>
                                <p className="text-sm italic text-slate-200">{speaker.role}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Speakers