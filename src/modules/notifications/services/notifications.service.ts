import { prisma } from "@shared/database/prisma";
import { NotFoundError } from "@shared/errors/app-error";

const APP_URL = process.env.APP_URL ?? "http://localhost:4321";

export class NotificationsService {
  async sendCredentialEmail(memberId: string): Promise<{ sent: boolean; to: string }> {
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundError("Miembro");
    if (!member.email) throw new Error("El miembro no tiene correo registrado");

    const credentialUrl = `${APP_URL}/members/${member.id}/credential`;

    if (!process.env.SMTP_HOST) {
      console.info("[EMAIL] Simulado - Para:", member.email, "URL:", credentialUrl);
      return { sent: true, to: member.email };
    }

    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: member.email,
      subject: `Credencial de Asistencia - ${member.firstName} ${member.lastName}`,
      html: this.buildEmailTemplate(member, credentialUrl),
    });

    return { sent: true, to: member.email };
  }

  async sendCredentialWhatsApp(memberId: string): Promise<{ sent: boolean; to: string }> {
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundError("Miembro");
    if (!member.phone) throw new Error("El miembro no tiene teléfono registrado");

    const credentialUrl = `${APP_URL}/members/${member.id}/credential`;

    if (!process.env.WHATSAPP_API_URL) {
      console.info("[WHATSAPP] Simulado - Para:", member.phone, "URL:", credentialUrl);
      return { sent: true, to: member.phone };
    }

    const res = await fetch(process.env.WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
      },
      body: JSON.stringify({
        to: member.phone,
        message: `Hola ${member.firstName}, aquí está tu credencial de asistencia: ${credentialUrl}`,
      }),
    });

    if (!res.ok) throw new Error("Error al enviar mensaje de WhatsApp");
    return { sent: true, to: member.phone };
  }

  private buildEmailTemplate(member: { firstName: string; lastName: string; role: string }, url: string): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#1a1a2e;">Centro Cristiano Boconó</h2>
        <p>Hola <strong>${member.firstName} ${member.lastName}</strong>,</p>
        <p>Tu credencial de asistencia ha sido generada.</p>
        <p>Rol: <strong>${member.role === "LEADER" ? "Líder" : "Estudiante"}</strong></p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:6px;">
          Ver mi credencial
        </a>
        <p style="margin-top:24px;font-size:12px;color:#999;">
          Escanea el código QR en tus eventos para registrar tu asistencia.
        </p>
      </div>
    `;
  }
}
