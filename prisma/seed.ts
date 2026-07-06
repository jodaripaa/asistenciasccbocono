import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  const adminPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ccb.org" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@ccb.org",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log(`✓ Admin creado: ${admin.email} / admin123`);

  const registrarPassword = await bcrypt.hash("registrar123", 12);

  const registrar = await prisma.user.upsert({
    where: { email: "registrar@ccb.org" },
    update: {},
    create: {
      name: "Registrador",
      email: "registrar@ccb.org",
      password: registrarPassword,
      role: "REGISTRAR",
    },
  });

  console.log(`✓ Registrador creado: ${registrar.email} / registrar123`);

  const sampleMembers = [
    { firstName: "María", lastName: "González", documentId: "CC-12345678", email: "maria@ejemplo.com", role: "LEADER" as const },
    { firstName: "Carlos", lastName: "Mendoza", documentId: "CC-23456789", email: "carlos@ejemplo.com", role: "LEADER" as const },
    { firstName: "Ana", lastName: "Martínez", documentId: "CC-34567890", email: "ana@ejemplo.com", role: "STUDENT" as const },
    { firstName: "Pedro", lastName: "Ramírez", documentId: "CC-45678901", role: "STUDENT" as const },
    { firstName: "Laura", lastName: "López", documentId: "CC-56789012", role: "LEADER" as const },
  ];

  for (const member of sampleMembers) {
    await prisma.member.upsert({
      where: { documentId: member.documentId ?? undefined },
      update: {},
      create: {
        ...member,
        createdById: admin.id,
      },
    });
  }

  console.log(`✓ ${sampleMembers.length} miembros de ejemplo creados`);

  const event = await prisma.event.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Culto Dominical",
      description: "Culto de celebración dominical",
      date: new Date(),
      type: "SERVICE",
      isActive: true,
      createdById: admin.id,
    },
  });

  console.log(`✓ Evento creado: ${event.name}`);

  console.log("✅ Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
