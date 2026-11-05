import FadeIn from "../ui/FadeIn";
import { teamMembers } from "../../data/content";

const Team = () => {
    return (
        <section id="equipo" className="bg-linear-to-b from-white to-brand-200 py-24 border-b border-brand-600/40">
            <div className="mx-auto max-w-7xl px-6">
                <FadeIn className="mb-16 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-slate-900">Nuestro Equipo</h2>
                    <div className="mx-auto mb-6 h-1 w-16 bg-linear-to-r from-brand-800 to-brand-400" />
                    <p className="mx-auto max-w-2xl text-lg text-slate-600">
                        Conoce a las personas que hacen de Esencia 2026 un congreso diferente cada año.
                    </p>
                </FadeIn>

                <div className="flex flex-wrap justify-center gap-10 lg:gap-14">
                    {teamMembers.map((member, index) => (
                        <FadeIn
                            key={member.name}
                            delay={index * 0.1}
                            className="flex flex-col items-center w-48"
                        >
                            <div className="mb-5 h-48 w-48 overflow-hidden bg-slate-200 rounded-[50%_0_50%_50%] shadow-lg hover:scale-105 transition-transform duration-300">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 text-center">{member.name}</h3>
                            <p className="text-sm font-medium text-slate-500 text-center">{member.role}</p>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
