import { prisma } from "@shared/database/prisma";
import { NotFoundError } from "@shared/errors/app-error";

export class CredentialService {
  async getCredentialData(memberId: string) {
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundError("Miembro");

    return {
      id: member.id,
      qrToken: member.qrToken,
      fullName: `${member.firstName} ${member.lastName}`,
      firstName: member.firstName,
      lastName: member.lastName,
      documentId: member.documentId,
      email: member.email,
      phone: member.phone,
      photoUrl: member.photoUrl,
      role: member.role,
      roleLabel: member.role === "LEADER" ? "Líder" : "Estudiante",
      churchName: "Centro Cristiano Boconó",
    };
  }
}
