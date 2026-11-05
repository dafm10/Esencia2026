import { scheduleDays } from "../../data/content"
import { FaDownload, FaUser, FaMicrophoneAlt, FaBookOpen, FaStar, FaClock } from "react-icons/fa"

/**
 * Archivos descargables, guardados en `public/materiales/`.
 * La clave es el título exacto de la plenaria/taller en `scheduleDays`.
 * Si un título no está aquí, se muestra el botón deshabilitado ("Próximamente").
 */
const MATERIALS_PATH = "/materiales"
const materialFiles: Record<string, string> = {
    "Lo que tu hijo calla, pero su corazón y su celular revelan": "Lo_que_tu_hijo_calla-Saida.pdf",
    "¿Quién soy yo cuando nadie me ve?": "Quien_soy_cuando_nadie_me_ve-Saida.pdf",
    "Ilusión que parece amor": "Ilusion_que_parece_amor-Dayci.pdf",
    "Original y no copia": "Original_y_no_copia-Jhaneey.pdf",
    "Cerca y a la vez lejos": "Cerca-y-a-la-vez-lejos_Ruth.html",
    "Heridas que aún hablan": "Heridas_que_aun_hablan-Mariamne.pdf",
    "Deja que Dios te incomode": "Deja_que_Dios_te_incomode-Sarita.pdf",
    "Ve por más": "Ve_por_mas-Betty.pdf",
    "De Tumbas a Jardines": "De-tumbas-a-jardines_Gladis.pdf",
    "Cuando la pasión se disfraza de amor": "Cuando-la-pasion-se-disfraza-de-amor_Gladis.pdf",
    "Volviendo al Diseño Original": "Volviendo-al-diseno-original_Scarlet.pdf",
    "En que momento dejé de ser yo": "En-que-momento-deje-de-ser-yo_Edith.pdf",
    "Pensamientos cautivos, Corazones libres": "Pensamientos-cautivos-corazones-libres_Edith.pdf",
    "Fuiste llamada, no improvisada": "Fuiste-llamada-no-improvisada_Marlon.pdf",
    "Deja el cántaro": "Deja-el-cantaro_Marlon.pdf",
    "Hijos de cristal, Padres de algodón": "Hijos-de-cristal-padres-de-algodon_Rafael.pdf",
    "De la Esencia al Legado": "De-la-esencia-al-legado_Rafael.pdf",
    "Liderazgo, legado y multiplicación": "Liderazgo-legado-multiplicacion_Scarlet.pdf"
}

/**
 * PDF y HTML los abre el navegador directamente. Los PowerPoint no se pueden
 * renderizar nativamente, así que se abren con el visor de Office Online
 * (requiere URL pública, solo funciona en producción y con archivos < 10 MB).
 */
const getViewUrl = (file: string) => {
    const path = `${MATERIALS_PATH}/${encodeURIComponent(file)}`
    if (/\.pptx?$/i.test(file)) {
        const absolute = `${window.location.origin}${path}`
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absolute)}`
    }
    return path
}

interface SessionItem {
    title: string
    speaker: string
    image: string
    type?: string
}

// Aplana los 3 días y elimina plenarias/talleres repetidos por título
const resources: SessionItem[] = (() => {
    const seen = new Set<string>()
    const sessions = scheduleDays.flatMap((day) => [...day.sessions] as SessionItem[])
    return sessions.filter((s) => {
        if (seen.has(s.title)) return false
        seen.add(s.title)
        return true
    })
})()

const getSessionIcon = (type?: string) => {
    const lower = type?.toLowerCase() ?? ""
    if (lower.includes("plenaria")) return <FaMicrophoneAlt className="h-8 w-8" />
    if (lower.includes("taller")) return <FaBookOpen className="h-8 w-8" />
    return <FaStar className="h-8 w-8" />
}

const Resources = () => {
    return (
        <section id="materiales" className="bg-brand-50 py-24">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="mb-4 text-4xl font-bold text-slate-900">MATERIALES</h2>

                    <div className="mx-auto mb-6 h-1 w-16 bg-linear-to-r from-brand-500 to-brand-400" />
                    <p className="text-slate-500">Descarga los recursos de cada ponencia y taller. <br></br> Si no ves tu tema preferido, no te preocupes, estamos subiendo el material en las proximas horas</p>
                </div>

                <div className="rounded-2xl border border-dashed border-brand-300 bg-white p-6">
                    {resources.map((item, i) => {
                        const file = materialFiles[item.title]
                        return (
                            <div key={item.title} className={`flex flex-col gap-6 py-6 sm:flex-row sm:items-center ${i !== resources.length - 1 ? 'border-b border-dashed border-brand-200' : ''}`}>
                                {item.image.includes('speaker-') ? (
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-brand-800 bg-brand-50 text-brand-800 shadow-sm" title={item.type}>
                                        {getSessionIcon(item.type)}
                                    </div>
                                ) : (
                                    <img src={item.image} alt={item.speaker} loading="lazy" className="h-24 w-24 shrink-0 rounded-full border-2 border-dashed border-brand-200 object-cover" />
                                )}

                                <div className="flex-1 border-r-0 sm:border-r sm:border-dashed sm:border-brand-200 sm:pr-6">
                                    <h3 className="mb-3 text-lg font-bold text-slate-900">{item.title}</h3>
                                    <span className="flex items-center gap-2 text-sm text-slate-600">
                                        <FaUser className="text-brand-800" /> {item.speaker}
                                    </span>
                                </div>

                                {file ? (
                                    <a href={getViewUrl(file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full shrink-0 items-center justify-center gap-2 rounded-full border-2 border-brand-800 px-2 py-2.5 text-center text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-800 hover:text-white sm:w-44">
                                        <FaDownload /> Descargar
                                    </a>
                                ) : (
                                    <span aria-disabled="true"
                                        className="flex w-full shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-full border-2 border-dashed border-brand-200 px-2 py-2.5 text-center text-sm font-semibold text-slate-400 sm:w-44">
                                        <FaClock /> Próximamente
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default Resources