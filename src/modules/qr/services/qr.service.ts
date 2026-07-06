import QRCode from "qrcode";
import { prisma } from "@shared/database/prisma";
import { NotFoundError } from "@shared/errors/app-error";

export class QrService {
  async generateForMember(memberId: string): Promise<Buffer> {
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundError("Miembro");

    return QRCode.toBuffer(member.qrToken, {
      type: "png",
      width: 400,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });
  }

  async generateDataUrl(memberId: string): Promise<string> {
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundError("Miembro");

    return QRCode.toDataURL(member.qrToken, {
      width: 400,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });
  }

  async resolveToken(token: string) {
    const member = await prisma.member.findUnique({ where: { qrToken: token } });
    if (!member || !member.isActive) throw new NotFoundError("Miembro");
    return member;
  }
}
