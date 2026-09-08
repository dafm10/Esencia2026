// deno-lint-ignore-file no-import-prefix
import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.2.0";
import * as QRCode from "https://esm.sh/qrcode@1.5.3";
import { PDFDocument, rgb, StandardFonts, PDFPage } from "https://esm.sh/pdf-lib@1.17.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function drawDashedLine(page: PDFPage, x: number, yStart: number, yEnd: number, dashArray: number[]) {
    page.drawLine({
        start: { x, y: yStart },
        end: { x, y: yEnd },
        thickness: 2,
        color: rgb(0, 0, 0),
        dashArray,
    });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const formData = await req.formData();
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const dni = formData.get("dni") as string;
    const edad = formData.get("edad") as string;
    const profesion = formData.get("profesion") as string;
    const church = formData.get("church") as string;
    const churchRole = formData.get("churchRole") as string;
    const area = formData.get("area")?.toString();
    const district = formData.get("district")?.toString();
    const voucherCode = formData.get("voucherCode")?.toString();
    const workshopDay1 = formData.get("workshopDay1")?.toString();
    const workshopDay2 = formData.get("workshopDay2")?.toString();
    const voucherFile = formData.get("voucherFile") as File | null;

    if (!fullName || !email || !phone || !dni || !church || !area || !workshopDay1 || !workshopDay2) {
      return new Response(JSON.stringify({ error: "Faltan campos requeridos" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate capacities
    const unlimitedWorkshops = [
        "6.- Molde modelo y ejemplo / Scarlet",
        "6.- En que momento dejé de ser Yo / Edith",
        "10.- Menopausia informada: Decisiones estratégicas para tu salud y liderazgo",
        "10.- Liderazgo, legado y multiplicación",
        "10.- Por confirmar"
    ];
    const MAX_CAPACITY = 40;

    if (!unlimitedWorkshops.includes(workshopDay1)) {
        const { count } = await supabaseAdmin.from("tickets")
            .select("*", { count: "exact", head: true })
            .eq("workshop_day1", workshopDay1)
            .eq("status", "approved");
        
        if (count !== null && count >= MAX_CAPACITY) {
            return new Response(JSON.stringify({ error: `El ${workshopDay1} ya no tiene cupos disponibles para el Día 1.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
    }

    if (!unlimitedWorkshops.includes(workshopDay2)) {
        const { count } = await supabaseAdmin.from("tickets")
            .select("*", { count: "exact", head: true })
            .eq("workshop_day2", workshopDay2)
            .eq("status", "approved");
        
        if (count !== null && count >= MAX_CAPACITY) {
            return new Response(JSON.stringify({ error: `El ${workshopDay2} ya no tiene cupos disponibles para el Día 2.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
    }

    let filePath = "";
    if (voucherFile) {
        const fileExt = voucherFile.name.split(".").pop();
        filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabaseAdmin.storage.from("vouchers").upload(filePath, voucherFile, { contentType: voucherFile.type });
        if (uploadError) {
          return new Response(JSON.stringify({ error: "Error al subir el comprobante" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
    }

    // Auto-approve logic
    const shortCode = crypto.randomUUID().split("-")[0].toUpperCase();
    const created_at = new Date().toISOString();

    const { data: ticket, error: insertError } = await supabaseAdmin
      .from("tickets")
      .insert({
        full_name: fullName,
        email,
        phone,
        dni,
        edad,
        profesion,
        church,
        church_role: churchRole,
        area,
        district,
        voucher_path: filePath,
        voucher_code: voucherCode,
        workshop_day1: workshopDay1,
        workshop_day2: workshopDay2,
        status: "approved",
        ticket_code: shortCode,
        created_at
      })
      .select()
      .single();

    if (insertError) {
      if (filePath) await supabaseAdmin.storage.from("vouchers").remove([filePath]);
      return new Response(JSON.stringify({ error: "Error al registrar la orden" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generate PDF Ticket
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([800, 280]);
    const { height } = page.getSize();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const black = rgb(0.1, 0.1, 0.1);
    const gray = rgb(0.4, 0.4, 0.4);

    page.drawText("CONFERENCIA ESENCIA", { x: 40, y: height - 40, size: 24, font: fontItalic, color: black });
    page.drawText("Colegio Embl. Mercedes Cabello de Carbonera", { x: 40, y: height - 65, size: 14, font: fontItalic, color: black });
    page.drawText("15 AL 17 DE OCTUBRE", { x: 40, y: height - 85, size: 10, font: fontItalic, color: black });

    let nameSize = 40;
    const maxNameWidth = 430;
    const nameStr = fullName.toUpperCase();
    let nameWidth = fontBold.widthOfTextAtSize(nameStr, nameSize);
    
    while (nameWidth > maxNameWidth && nameSize > 12) {
        nameSize -= 1;
        nameWidth = fontBold.widthOfTextAtSize(nameStr, nameSize);
    }

    page.drawText(nameStr, { x: 40, y: height - 140, size: nameSize, font: fontBold, color: black });
    page.drawText("TALLERES REGISTRADOS", { x: 40, y: height - 170, size: 16, font: fontBold, color: black });
    
    page.drawText(`• ${workshopDay1}`, { x: 50, y: height - 195, size: 12, font: fontItalic, color: black });
    page.drawText(`• ${workshopDay2}`, { x: 50, y: height - 215, size: 12, font: fontItalic, color: black });

    const disclaimer = "Este es tu ticket de entrada al evento. Debes presentar este ticket (impreso o digital) al momento de ingresar. Puedes encontrar mas detalles del evento en nuestra pagina web. ¡Te esperamos!";
    page.drawText(disclaimer, { x: 100, y: 35, size: 8, font: fontItalic, color: gray, maxWidth: 450, lineHeight: 12 });

    const divX = 620;
    drawDashedLine(page, divX, 20, height - 20, [5, 5]);
    page.drawCircle({ x: divX, y: height, size: 15, color: black });
    page.drawCircle({ x: divX, y: 0, size: 15, color: black });

    const orderDate = new Date(created_at).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" }).toUpperCase().replace(/ /g, ' - ');
    const infoX = 480;
    page.drawText("FECHA DE COMPRA", { x: infoX, y: height - 40, size: 8, font: fontBold, color: black });
    page.drawText(orderDate, { x: infoX, y: height - 55, size: 12, font: fontItalic, color: black });
    page.drawText("ORDEN NRO.", { x: infoX, y: height - 90, size: 8, font: fontBold, color: black });
    page.drawText(shortCode, { x: infoX, y: height - 105, size: 12, font: fontItalic, color: black });
    page.drawText("ENTRADA GENERAL", { x: infoX, y: height - 140, size: 8, font: fontBold, color: black });
    page.drawText("S/. 80.00", { x: infoX, y: height - 155, size: 14, font: fontItalic, color: black });

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
    page.drawImage(qrImage, { x: 640, y: 70, width: 140, height: 140 });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = encodeBase64(pdfBytes);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Esencia Conf <contacto@esencia.cogopperu.com>",
        to: email,
        subject: "¡Tu ticket para Esencia Conf está listo!",
        html: `
          <h1>¡Hola ${fullName}!</h1>
          <p>Tu registro ha sido completado y aprobado con éxito.</p>
          <p>Adjunto encontrarás tu ticket oficial de entrada al evento en formato PDF. Asegúrate de mostrar este código QR en la puerta.</p>
          <p>Tus talleres registrados:</p>
          <ul>
            <li>Día 1: ${workshopDay1}</li>
            <li>Día 2: ${workshopDay2}</li>
          </ul>
          <br/>
          <p>¡Nos vemos pronto!</p>
        `,
        attachments: [{ filename: `ticket-${dni}.pdf`, content: pdfBase64 }],
      });
    }

    return new Response(JSON.stringify({ success: true, ticket }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error inesperado:", err);
    return new Response(JSON.stringify({ error: "Error inesperado en el servidor" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
