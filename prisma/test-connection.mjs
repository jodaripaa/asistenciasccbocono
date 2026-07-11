import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
try {
  const users = await p.user.findMany();
  console.log("Users:", JSON.stringify(users.map(x => ({ email: x.email, role: x.role }))));
  const members = await p.member.findMany();
  console.log("Members:", members.length);
  const events = await p.event.findMany();
  console.log("Events:", events.length);
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await p.$disconnect();
}
