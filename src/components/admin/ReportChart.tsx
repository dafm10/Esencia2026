import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import type { Ticket } from '../../types/tycketTypes'
import { workshops } from '../../data/workshops'

interface Props {
    tickets: Ticket[]
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const limitText = data.Límite;
        
        const renderDay = (dayKey: string, dayName: string, hide: boolean, customName?: string) => {
            if (hide) return null;
            const val = data[dayKey];
            const avail = limitText === 'Ilimitado' ? '∞' : (Number(limitText) - Number(val));
            const color = dayKey === 'Día 1' ? '#0ea5e9' : '#db2777';
            
            return (
                <div style={{ color }} className="mt-1">
                    {customName && <div className="text-[11px] font-semibold text-slate-600 mb-0.5 leading-tight">{customName}</div>}
                    <div>{dayName} : {val} inscritos (Disponibles: {avail})</div>
                </div>
            )
        };

        return (
            <div className="bg-white p-3 rounded-lg shadow-md border border-slate-100 text-[13px] max-w-[280px]">
                <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{data.fullName}</p>
                <div className="flex flex-col gap-2">
                    {renderDay('Día 1', 'Día 1', data.hideOnDay1, data.nameDay1)}
                    {renderDay('Día 2', 'Día 2', data.hideOnDay2, data.nameDay2)}
                </div>
            </div>
        );
    }
    return null;
};

const ReportChart = ({ tickets }: Props) => {
    // Workshops data
    const workshopStats = workshops.map(w => {
        const w1 = w.nameDay1 || w.name;
        const w2 = w.nameDay2 || w.name;
        
        // Alias to catch the specific typo from the user's Excel upload for Saida's Day 2
        const w2_alias = w.id === 'taller-1' ? "2.- ¿Quién soy yo cuando nadie me ve? / Lic. en Psic. Saida Segovia" : null;
        
        const d1Count = tickets.filter(t => t.workshop_day1 === w1 && t.status === 'approved').length;
        const d2Count = tickets.filter(t => (t.workshop_day2 === w2 || (w2_alias && t.workshop_day2 === w2_alias)) && t.status === 'approved').length;
        
        // Extract a short label like "T1", "T2" to fit on the X axis
        const numMatch = w.name.match(/^(\d+)\.-/);
        const label = numMatch ? `T${numMatch[1]}` : w.name.substring(0, 10);
        
        return {
            name: label,
            fullName: w.name,
            nameDay1: w.nameDay1,
            nameDay2: w.nameDay2,
            hideOnDay1: w.hideOnDay1,
            hideOnDay2: w.hideOnDay2,
            'Día 1': d1Count,
            'Día 2': d2Count,
            Límite: w.limit === null ? 'Ilimitado' : w.limit
        }
    });

    return (
        <div className="mb-8">
            <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Cupos por Taller</h3>
                <p className="text-xs text-slate-500 mb-4">T1 = Taller 1, T2 = Taller 2, etc.</p>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workshopStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 12 }} 
                                allowDecimals={false}
                                domain={[0, (dataMax: number) => Math.max(dataMax, 5)]}
                            />
                            <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar dataKey="Día 1" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} minPointSize={2} background={{ fill: '#f8fafc' }} />
                            <Bar dataKey="Día 2" fill="#db2777" radius={[4, 4, 0, 0]} maxBarSize={40} minPointSize={2} background={{ fill: '#f8fafc' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default ReportChart
