import { Hotels } from "../../data/content";
import FadeIn from "../ui/FadeIn";
import { FaMapMarkerAlt, FaPhoneAlt, FaMoneyBillWave, FaMap } from "react-icons/fa";

const HotelsSection = () => {
    return (
        <section id="hoteles" className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-6">
                <FadeIn className="mb-16 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-slate-900">Hoteles Cercanos</h2>
                    <div className="mx-auto mb-6 h-1 w-16 bg-linear-to-r from-brand-800 to-brand-400" />
                    <p className="mx-auto max-w-2xl text-lg text-slate-600">
                        Si nos visitas de otra ciudad, aquí te dejamos algunas opciones de hospedaje recomendadas cerca al lugar del evento.
                    </p>
                </FadeIn>

                {/* Contenedor: Scroll horizontal en móvil/tablet, Grid 4x3 en desktop */}
                <div className="flex overflow-x-auto gap-6 pb-8 snap-x lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:pb-0 lg:snap-none hide-scrollbar">
                    {Hotels.map((hotel, index) => (
                        <FadeIn
                            key={index}
                            delay={index * 0.1}
                            direction="up"
                            className="flex-none w-80 snap-start lg:w-auto flex flex-col [&>div]:flex [&>div]:flex-col [&>div]:grow"
                        >
                            <div className="flex flex-col grow rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="mb-3 text-xl font-bold text-brand-700">{hotel.name}</h3>

                                <div className="space-y-3 mb-6 grow text-sm text-slate-600">
                                    <div className="flex items-start gap-3">
                                        <FaMoneyBillWave className="mt-1 shrink-0 text-brand-500" />
                                        <span>{hotel.cost}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FaMapMarkerAlt className="mt-1 shrink-0 text-brand-500" />
                                        <span>{hotel.addres}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FaPhoneAlt className="mt-1 shrink-0 text-brand-500" />
                                        <span>{hotel.phone}</span>
                                    </div>
                                </div>

                                {hotel.googleMap ? (
                                    <a
                                        href={hotel.googleMap}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-auto flex items-center justify-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                                    >
                                        <FaMap />
                                        Ver en Google Maps
                                    </a>
                                ) : (
                                    <div
                                        className="mt-auto flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
                                    >
                                        <FaMapMarkerAlt />
                                        Sin ubicación
                                    </div>
                                )}
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default HotelsSection;
