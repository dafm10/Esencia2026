import { useState } from "react"
import { scheduleDays, sectionIntros } from "../../data/content"
import { FaDownload, FaMapMarkerAlt, FaRegClock, FaUser, FaMicrophoneAlt, FaUsers, FaBookOpen, FaStar, FaCommentDots } from "react-icons/fa"
const Schedule = () => {
    const [activeDay, setActiveDay] = useState<typeof scheduleDays[number]['id']>(scheduleDays[0].id)
    const currentDay = scheduleDays.find((day) => day.id === activeDay)!

    const getSessionIcon = (type?: string) => {
        if (!type) return <FaStar className="h-8 w-8" />;
        const lowerType = type.toLowerCase();
        if (lowerType.includes('plenaria')) return <FaMicrophoneAlt className="h-8 w-8" />;
        if (lowerType.includes('mesa redonda') || lowerType.includes('conversatorio')) return <FaUsers className="h-8 w-8" />;
        if (lowerType.includes('taller')) return <FaBookOpen className="h-8 w-8" />;
        if (lowerType.includes('testimonio')) return <FaCommentDots className="h-8 w-8" />;
        return <FaStar className="h-8 w-8" />;
    }

    return (
        <section id="programa" className="bg-brand-50 py-24">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="mb-4 text-4xl font-bold text-slate-900">{sectionIntros.schedule.title}</h2>

                    <div className="mx-auto mb-6 h-1 w-16 bg-linear-to-r from-brand-500 to-brand-400" />
                    <p className="text-slate-500">{sectionIntros.schedule.description}</p>

                </div>

                {/* Tabs de días */}
                <div className="mb-12 flex justify-center gap-4">
                    {scheduleDays.map((day) => {
                        const isActive = day.id === activeDay
                        return (
                            <button key={day.id}
                                onClick={() => setActiveDay(day.id)}
                                className={`relative rounded-xl px-8 py-4 text-center transition-colors ${isActive
                                    ? 'bg-linear-to-r from-brand-800 to-brand-500 text-white'
                                    : 'border border-dashed border-brand-300 bg-white text-slate-700 hover:border-brand-400'
                                    }`}>
                                <p className="font-semibold">{day.label}</p>
                                <p className="text-sm">{day.subLabel}</p>
                                {isActive && (
                                    <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-brand-800"></span>
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="rounded-2xl border border-dashed border-brand-300 bg-white p-6">
                    {currentDay.sessions.map((session, i) => (
                        <div key={session.title} className={`flex flex-col gap-6 py-6 sm:flex-row sm:items-center ${i !== currentDay.sessions.length - 1 ? 'border-b border-dashed border-brand-200' : ''
                            }`}>
                            {session.image.includes('speaker-') ? (
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-brand-800 bg-brand-50 text-brand-800 shadow-sm" title={session.type}>
                                    {getSessionIcon(session.type)}
                                </div>
                            ) : (
                                <img src={session.image} alt={session.title} className="h-24 w-24 shrink-0 rounded-full border-2 border-dashed border-brand-200 object-cover" />
                            )}

                            <div className="flex-1 border-r-0 sm:border-r sm:border-dashed sm:border-brand-200 sm:pr-6">
                                <h3 className="mb-2 text-lg font-bold text-slate-900">{session.title}</h3>
                                <p className="mb-4 text-sm text-slate-500">{session.description}</p>

                                <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <FaUser className="text-brand-800" /> {session.speaker}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <FaRegClock className="text-brand-800" />{session.time}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-brand-800" />{session.location}
                                    </span>
                                </div>
                            </div>

                            <button className="shrink-0 w-full sm:w-44 rounded-full border-2 border-brand-800 px-2 py-2.5 text-center text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-800 hover:text-white">
                                {('type' in session && session.type) ? session.type as string : 'Detalles'}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-12 flex justify-center">
                    <a href={"#"}
                        download
                        className="flex items-center gap-3 rounded-full border-2 border-brand-800 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-brand-800 transition-colors hover:bg-brand-800 hover:text-white">
                        <FaDownload /> Descargar Programa
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Schedule