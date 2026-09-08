import { useState, useRef } from 'react'
import { FaDownload, FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { supabase } from '../../lib/supabaseClient'
import { workshops } from '../../data/workshops'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

interface BulkRecord {
    row: number
    fullName: string
    email: string
    phone: string
    dni: string
    edad: string
    profesion: string
    church: string
    churchRole: string
    area: string
    district: string
    voucherCode: string
    workshopDay1: string
    workshopDay2: string
    status: 'pending' | 'processing' | 'success' | 'error'
    message?: string
}

const BulkRegisterPage = () => {
    const [records, setRecords] = useState<BulkRecord[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const downloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Registros');

        sheet.columns = [
            { header: 'Nombre Completo', key: 'fullName', width: 30 },
            { header: 'Correo', key: 'email', width: 25 },
            { header: 'Celular', key: 'phone', width: 15 },
            { header: 'DNI', key: 'dni', width: 12 },
            { header: 'Edad', key: 'edad', width: 10 },
            { header: 'Profesión', key: 'profesion', width: 25 },
            { header: 'Iglesia', key: 'church', width: 20 },
            { header: 'Cargo en Iglesia', key: 'churchRole', width: 15 },
            { header: 'Área', key: 'area', width: 15 },
            { header: 'Distrito', key: 'district', width: 15 },
            { header: 'Nro Operación', key: 'voucherCode', width: 20 },
            { header: 'Taller Día 1', key: 'workshopDay1', width: 40 },
            { header: 'Taller Día 2', key: 'workshopDay2', width: 40 },
        ];

        const dataSheet = workbook.addWorksheet('DataLists', { state: 'hidden' });
        
        const workshopNamesD1 = workshops.map(w => w.nameDay1 || w.name);
        const workshopNamesD2 = workshops.map(w => w.nameDay2 || w.name);
        
        workshopNamesD1.forEach((val, idx) => { dataSheet.getCell(`A${idx + 1}`).value = val; });
        workshopNamesD2.forEach((val, idx) => { dataSheet.getCell(`B${idx + 1}`).value = val; });

        // Nombres definidos (Named Ranges) para evitar error de referencias entre hojas en Excel
        workbook.definedNames.add(`DataLists!$A$1:$A$${workshopNamesD1.length}`, 'List_Workshops_D1');
        workbook.definedNames.add(`DataLists!$B$1:$B$${workshopNamesD2.length}`, 'List_Workshops_D2');

        // Añadir filas con validación
        for (let i = 2; i <= 500; i++) {
            // Dropdown Talleres
            sheet.getCell(`L${i}`).dataValidation = {
                type: 'list', allowBlank: true, formulae: ['List_Workshops_D1']
            };
            sheet.getCell(`M${i}`).dataValidation = {
                type: 'list', allowBlank: true, formulae: ['List_Workshops_D2']
            };
        }

        // Estilo cabecera
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1D5DB' } };

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'Plantilla_Registro_Masivo.xlsx');
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());

        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) return;

        const parsedRecords: BulkRecord[] = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const getVal = (col: number) => {
                const val = row.getCell(col).value;
                return val ? val.toString().trim() : '';
            };

            const fullName = getVal(1);
            if (!fullName) return; // Skip empty rows

            parsedRecords.push({
                row: rowNumber,
                fullName,
                email: getVal(2),
                phone: getVal(3),
                dni: getVal(4),
                edad: getVal(5),
                profesion: getVal(6),
                church: getVal(7),
                churchRole: getVal(8),
                area: getVal(9),
                district: getVal(10),
                voucherCode: getVal(11),
                workshopDay1: getVal(12),
                workshopDay2: getVal(13),
                status: 'pending'
            });
        });

        setRecords(parsedRecords);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const processRecords = async () => {
        if (records.length === 0) return;

        setIsProcessing(true);
        setProgress(0);

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            // Skip already success
            if (record.status === 'success') continue;

            // Mark processing
            setRecords(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'processing' } : r));

            try {
                const submitData = new FormData();
                submitData.append('fullName', record.fullName);
                submitData.append('email', record.email);
                submitData.append('phone', record.phone);
                submitData.append('dni', record.dni);
                submitData.append('edad', record.edad);
                submitData.append('profesion', record.profesion);
                submitData.append('church', record.church);
                submitData.append('churchRole', record.churchRole);
                submitData.append('area', record.area);
                submitData.append('district', record.district);
                submitData.append('voucherCode', record.voucherCode || 'PAGO_MASIVO');
                submitData.append('workshopDay1', record.workshopDay1);
                submitData.append('workshopDay2', record.workshopDay2);

                const { data, error } = await supabase.functions.invoke('create-order', {
                    body: submitData
                });

                if (error) {
                    let serverMessage = error.message;
                    try {
                        const errObj = error as { context?: { json?: () => Promise<{ error?: string }> } };
                        if (typeof errObj.context?.json === 'function') {
                            const errData = await errObj.context.json();
                            serverMessage = errData.error || serverMessage;
                        }
                    } catch {
                        // ignore parsing error
                    }
                    throw new Error(serverMessage);
                }

                if (data?.error) throw new Error(data.error);

                setRecords(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'success' } : r));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                setRecords(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', message: errorMessage } : r));
            }

            setProgress(Math.round(((i + 1) / records.length) * 100));
        }

        setIsProcessing(false);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Registro Masivo</h1>
                <p className="text-slate-500">Importa asistentes que ya pagaron y auto-genera sus tickets y envíos de correo.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
                    <div className="flex items-center gap-4 mb-4 text-brand-600">
                        <div className="p-3 bg-brand-50 rounded-lg">
                            <FaDownload className="text-xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">1. Descargar Plantilla</h3>
                            <p className="text-sm text-slate-500">Usa este archivo Excel para llenar los datos.</p>
                        </div>
                    </div>
                    <button
                        onClick={downloadTemplate}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                        Descargar Excel
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
                    <div className="flex items-center gap-4 mb-4 text-emerald-600">
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <FaUpload className="text-xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">2. Subir Archivo</h3>
                            <p className="text-sm text-slate-500">Sube la plantilla llena para procesar.</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        accept=".xlsx"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium transition-colors"
                    >
                        Seleccionar Archivo
                    </button>
                </div>
            </div>

            {records.length > 0 && (
                <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Vista Previa ({records.length} registros)</h3>
                            {isProcessing && (
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">{progress}%</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={processRecords}
                            disabled={isProcessing}
                            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isProcessing ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                            Procesar Registros
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Fila</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Asistente</th>
                                    <th className="px-6 py-4">Ubicación</th>
                                    <th className="px-6 py-4">Talleres</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-400">{r.row}</td>
                                        <td className="px-6 py-4">
                                            {r.status === 'pending' && <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">Pendiente</span>}
                                            {r.status === 'processing' && <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium flex items-center gap-1 w-max"><FaSpinner className="animate-spin" /> Proc...</span>}
                                            {r.status === 'success' && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Completado</span>}
                                            {r.status === 'error' && (
                                                <div className="flex flex-col gap-1 w-max">
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1"><FaExclamationTriangle /> Error</span>
                                                    <span className="text-[10px] text-red-500 max-w-37.5 truncate" title={r.message}>{r.message}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{r.fullName}</div>
                                            <div className="text-xs text-slate-500">{r.dni} • {r.phone}</div>
                                            <div className="text-xs text-slate-500">{r.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>{r.area}</div>
                                            <div className="text-xs text-slate-500">{r.district}</div>
                                            <div className="text-xs text-slate-400 mt-1">Op: {r.voucherCode}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs"><span className="font-semibold">D1:</span> {r.workshopDay1}</div>
                                            <div className="text-xs"><span className="font-semibold">D2:</span> {r.workshopDay2}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BulkRegisterPage
