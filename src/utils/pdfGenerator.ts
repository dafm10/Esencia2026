import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';
import type { Ticket } from '../types/tycketTypes';

function drawDashedLine(page: PDFPage, x: number, yStart: number, yEnd: number, dashArray: number[]) {
    // Simple custom dashed line implementation for pdf-lib since native setLineDash can be tricky
    page.drawLine({
        start: { x, y: yStart },
        end: { x, y: yEnd },
        thickness: 2,
        color: rgb(0, 0, 0),
        dashArray,
    });
}

export async function generateTicketPdf(ticket: Ticket): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([800, 280]); // 800x280
    const { height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const black = rgb(0.1, 0.1, 0.1);
    const gray = rgb(0.4, 0.4, 0.4);

    // --- LEFT SIDE ---
    // Header
    page.drawText("CONFERENCIA ESENCIA", { x: 40, y: height - 40, size: 24, font: fontItalic, color: black });
    page.drawText("Colegio Embl. Mercedes Cabello de Carbonera", { x: 40, y: height - 65, size: 14, font: fontItalic, color: black });
    page.drawText("15 AL 17 DE OCTUBRE", { x: 40, y: height - 85, size: 10, font: fontItalic, color: black });

    // Name
    const name = ticket.full_name.toUpperCase();
    let nameSize = 40;
    const maxNameWidth = 430;
    let nameWidth = fontBold.widthOfTextAtSize(name, nameSize);
    
    while (nameWidth > maxNameWidth && nameSize > 12) {
        nameSize -= 1;
        nameWidth = fontBold.widthOfTextAtSize(name, nameSize);
    }

    page.drawText(name, { x: 40, y: height - 140, size: nameSize, font: fontBold, color: black });

    // Workshops
    page.drawText("TALLERES REGISTRADOS", { x: 40, y: height - 170, size: 16, font: fontBold, color: black });
    
    const w1 = ticket.workshop_day1 || "Taller Día 1 Pendiente";
    const w2 = ticket.workshop_day2 || "Taller Día 2 Pendiente";
    page.drawText(`• ${w1}`, { x: 50, y: height - 195, size: 12, font: fontItalic, color: black });
    page.drawText(`• ${w2}`, { x: 50, y: height - 215, size: 12, font: fontItalic, color: black });

    // Disclaimer
    const disclaimer = "Este es tu ticket de entrada al evento. Debes presentar este ticket (impreso o digital) al momento de ingresar. Puedes encontrar mas detalles del evento en nuestra pagina web. ¡Te esperamos!";
    page.drawText(disclaimer, {
        x: 100, y: 35, size: 8, font: fontItalic, color: gray, maxWidth: 450, lineHeight: 12,
    });

    // --- DIVIDER ---
    const divX = 620;
    drawDashedLine(page, divX, 20, height - 20, [5, 5]);

    // Semi-circles
    page.drawCircle({ x: divX, y: height, size: 15, color: black });
    page.drawCircle({ x: divX, y: 0, size: 15, color: black });

    // --- ORDER INFO (LEFT OF DIVIDER) ---
    const orderDate = new Date(ticket.created_at).toLocaleDateString("es-ES", {
        year: "numeric", month: "short", day: "numeric",
    }).toUpperCase().replace(/ /g, ' - ');
    
    const shortCode = ticket.ticket_code || ticket.id.split("-")[0].toUpperCase();

    const infoX = 480;
    page.drawText("FECHA DE COMPRA", { x: infoX, y: height - 40, size: 8, font: fontBold, color: black });
    page.drawText(orderDate, { x: infoX, y: height - 55, size: 12, font: fontItalic, color: black });

    page.drawText("ORDEN NRO.", { x: infoX, y: height - 90, size: 8, font: fontBold, color: black });
    page.drawText(shortCode, { x: infoX, y: height - 105, size: 12, font: fontItalic, color: black });

    page.drawText("ENTRADA GENERAL", { x: infoX, y: height - 140, size: 8, font: fontBold, color: black });
    page.drawText("S/. 80.00", { x: infoX, y: height - 155, size: 14, font: fontItalic, color: black });

    // --- QR CODE (RIGHT SIDE) ---
    const qrPayload = JSON.stringify({
        id: ticket.id,
        nombre: ticket.full_name,
        dni: ticket.dni,
        taller1: ticket.workshop_day1,
        taller2: ticket.workshop_day2
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 140 });
    const qrBuffer = Uint8Array.from(atob(qrDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    
    // QR is on the far right (centered in the 180px area)
    page.drawImage(qrImage, {
        x: 640, y: 70, width: 140, height: 140,
    });

    return await pdfDoc.save();
}
