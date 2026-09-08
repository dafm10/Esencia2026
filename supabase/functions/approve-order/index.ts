// deno-lint-ignore-file no-import-prefix
import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.2.0";
import * as QRCode from "https://esm.sh/qrcode@1.5.3";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { ticket_id, admin_id } = await req.json();

    if (!ticket_id) {
      return new Response(JSON.stringify({ error: "ticket_id es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Obtener datos del ticket
    const { data: ticket, error: fetchError } = await supabaseAdmin
      .from("tickets")
      .select("*")
      .eq("id", ticket_id)
      .single();

    if (fetchError || !ticket) {
      return new Response(JSON.stringify({ error: "Ticket no encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (ticket.status === "approved") {
      return new Response(
        JSON.stringify({ error: "El ticket ya está aprobado" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate a short 6-character alphanumeric code just to have a friendly reference in DB
    const shortCode = ticket.id.split("-")[0].toUpperCase();

    // 2. Generar QR Code (sigue usando el ID para que el escáner lo lea)
    const qrDataUrl = await QRCode.toDataURL(ticket.id, {
      margin: 1,
      width: 200,
    });
    const qrBuffer = Uint8Array.from(
      atob(qrDataUrl.split(",")[1]),
      (c) => c.charCodeAt(0),
    );

    // 3. Crear PDF del Ticket
    const pdfDoc = await PDFDocument.create();
    // Layout landscape: 600x400
    const page = pdfDoc.addPage([600, 400]);
    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const brandColor = rgb(0.2, 0.2, 0.8);
    const textColor = rgb(0.1, 0.1, 0.1);
    const grayColor = rgb(0.4, 0.4, 0.4);

    // Titulo del Evento
    page.drawText("Esencia Conf", {
      x: 40,
      y: height - 60,
      size: 28,
      font,
      color: brandColor,
    });

    // Fecha y Lugar
    page.drawText("15 - 17 de Octubre, 2026, 7:00 PM", {
      x: 40,
      y: height - 100,
      size: 12,
      font,
      color: textColor,
    });
    page.drawText("Ex Cine Portofino, Av. Nicolás de Pierola 423, Lima", {
      x: 40,
      y: height - 120,
      size: 12,
      font,
      color: textColor,
    });

    // Dibujar Caja Principal
    const boxY = 100;
    const boxHeight = 160;
    page.drawRectangle({
      x: 40,
      y: boxY,
      width: 520,
      height: boxHeight,
      borderColor: brandColor,
      borderWidth: 2,
    });
    // Linea divisoria para el QR
    page.drawLine({
      start: { x: 420, y: boxY },
      end: { x: 420, y: boxY + boxHeight },
      color: brandColor,
      thickness: 2,
    });

    // Contenido dentro de la caja - Izquierda
    page.drawText("Tipo de ticket & precio", {
      x: 60,
      y: boxY + 130,
      size: 10,
      font: normalFont,
      color: grayColor,
    });
    page.drawText("Ticket General - S/ 80.00", {
      x: 60,
      y: boxY + 110,
      size: 12,
      font,
      color: textColor,
    });

    page.drawText("Ordenado por", {
      x: 60,
      y: boxY + 60,
      size: 10,
      font: normalFont,
      color: grayColor,
    });
    page.drawText(`${ticket.full_name}`, {
      x: 60,
      y: boxY + 40,
      size: 12,
      font,
      color: textColor,
    });

    page.drawText("Estado de pago", {
      x: 250,
      y: boxY + 60,
      size: 10,
      font: normalFont,
      color: grayColor,
    });
    page.drawText(`Pagado (${ticket.payment_method})`, {
      x: 250,
      y: boxY + 40,
      size: 12,
      font,
      color: textColor,
    });

    // Embed QR - Derecha
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    page.drawImage(qrImage, {
      x: 430,
      y: boxY + 10,
      width: 120,
      height: 120,
    });

    // Order Info Abajo de la caja
    const orderDate = new Date(ticket.created_at).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    page.drawText(`Nro. de orden:`, {
      x: 40,
      y: 70,
      size: 10,
      font: normalFont,
      color: grayColor,
    });
    page.drawText(shortCode, {
      x: 110,
      y: 70,
      size: 10,
      font,
      color: textColor,
    });

    page.drawText(`Fecha de compra:`, {
      x: 220,
      y: 70,
      size: 10,
      font: normalFont,
      color: grayColor,
    });
    page.drawText(orderDate, {
      x: 310,
      y: 70,
      size: 10,
      font,
      color: textColor,
    });

    // Disclaimer
    const disclaimer =
      "Este es tu ticket de entrada al evento. Debes presentar este ticket (impreso o digital) al momento de ingresar. Puedes encontrar mas detalles del evento en nuestra pagina web. ¡Te esperamos!";
    page.drawText(disclaimer, {
      x: 40,
      y: 40,
      size: 8,
      font: normalFont,
      color: grayColor,
      maxWidth: 520,
      lineHeight: 12,
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = encodeBase64(pdfBytes);

    // 4. Enviar Email con Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("RESEND_API_KEY no configurada");
    }

    const resend = new Resend(resendKey);
    const { error: emailError } = await resend.emails.send({
      from: "Esencia Conf <contacto@esencia.cogopperu.com>",
      to: ticket.email,
      subject: "¡Tu ticket para Esencia Conf está listo!",
      html: `
        <h1>¡Hola ${ticket.full_name}!</h1>
        <p>Tu pago ha sido validado con éxito. Adjunto encontrarás tu ticket de acceso.</p>
        <p>Por favor, descarga el PDF y muéstralo en la entrada el día del evento para escanear tu código QR.</p>
        <br/>
        <p>¡Nos vemos pronto!</p>
      `,
      attachments: [
        {
          filename: `ticket-${ticket.dni}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (emailError) {
      console.error("Error enviando email:", emailError);
      throw new Error(`Resend Error: ${emailError.message}`);
    }

    // 5. Actualizar estado en DB
    const { error: updateError } = await supabaseAdmin
      .from("tickets")
      .update({
        status: "approved",
        ticket_code: shortCode,
        reviewed_by: admin_id || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Error en approve-order:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error
          ? err.message
          : "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
