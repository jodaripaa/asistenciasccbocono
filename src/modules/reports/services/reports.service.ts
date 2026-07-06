import dayjs from "dayjs";
import { prisma } from "@shared/database/prisma";
import { NotFoundError } from "@shared/errors/app-error";

type ReportType = "person" | "event" | "monthly" | "annual" | "by-type";

export interface ReportData {
  title: string;
  subtitle: string;
  headers: string[];
  rows: string[][];
  summary: Record<string, any>;
}

export class ReportsService {
  async generate(type: ReportType, params: Record<string, string>) {
    switch (type) {
      case "person":
        return this.personReport(params.memberId!);
      case "event":
        return this.eventReport(params.eventId!);
      case "monthly":
        return this.monthlyReport(Number(params.year), Number(params.month));
      case "annual":
        return this.annualReport(Number(params.year));
      case "by-type":
        return this.byTypeReport(params.role as "LEADER" | "STUDENT");
      default:
        throw new Error("Tipo de reporte no válido");
    }
  }

  private async personReport(memberId: string) {
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundError("Miembro");

    const attendances = await prisma.attendance.findMany({
      where: { memberId },
      orderBy: { scannedAt: "desc" },
      include: {
        event: { select: { id: true, name: true, date: true, type: true } },
        registeredBy: { select: { name: true } },
      },
    });

    return {
      title: `Historial de Asistencia - ${member.firstName} ${member.lastName}`,
      subtitle: `${member.role === "LEADER" ? "Líder" : "Estudiante"} · ${member.documentId ?? "Sin documento"}`,
      headers: ["Evento", "Tipo", "Fecha", "Hora", "Estado", "Registró"],
      rows: attendances.map((a) => [
        a.event.name,
        a.event.type,
        dayjs(a.event.date).format("DD/MM/YYYY"),
        dayjs(a.scannedAt).format("HH:mm"),
        a.status === "LATE" ? "Tardanza" : "A tiempo",
        a.registeredBy.name,
      ]),
      summary: { total: attendances.length, presentes: attendances.filter((a) => a.status === "PRESENT").length },
    };
  }

  private async eventReport(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError("Evento");

    const attendances = await prisma.attendance.findMany({
      where: { eventId },
      orderBy: { scannedAt: "asc" },
      include: {
        member: { select: { firstName: true, lastName: true, documentId: true, role: true } },
        registeredBy: { select: { name: true } },
      },
    });

    return {
      title: `Asistencia - ${event.name}`,
      subtitle: `${dayjs(event.date).format("DD/MM/YYYY HH:mm")} · ${event.type}`,
      headers: ["Nombre", "Documento", "Rol", "Hora", "Estado", "Registró"],
      rows: attendances.map((a) => [
        `${a.member.firstName} ${a.member.lastName}`,
        a.member.documentId ?? "—",
        a.member.role === "LEADER" ? "Líder" : "Estudiante",
        dayjs(a.scannedAt).format("HH:mm"),
        a.status === "LATE" ? "Tardanza" : "A tiempo",
        a.registeredBy.name,
      ]),
      summary: { total: attendances.length, presentes: attendances.filter((a) => a.status === "PRESENT").length },
    };
  }

  private async monthlyReport(year: number, month: number) {
    const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
    const end = start.endOf("month");

    const attendances = await prisma.attendance.findMany({
      where: { scannedAt: { gte: start.toDate(), lte: end.toDate() } },
      orderBy: { scannedAt: "desc" },
      include: {
        member: { select: { firstName: true, lastName: true, role: true } },
        event: { select: { name: true, date: true } },
      },
    });

    const byEvent: Record<string, number> = {};
    for (const a of attendances) {
      byEvent[a.event.name] = (byEvent[a.event.name] ?? 0) + 1;
    }

    return {
      title: `Reporte Mensual - ${start.format("MMMM YYYY")}`,
      subtitle: `${attendances.length} asistencias registradas`,
      headers: ["Miembro", "Rol", "Evento", "Fecha", "Hora", "Estado"],
      rows: attendances.map((a) => [
        `${a.member.firstName} ${a.member.lastName}`,
        a.member.role === "LEADER" ? "Líder" : "Estudiante",
        a.event.name,
        dayjs(a.scannedAt).format("DD/MM/YYYY"),
        dayjs(a.scannedAt).format("HH:mm"),
        a.status === "LATE" ? "Tardanza" : "A tiempo",
      ]),
      summary: { total: attendances.length, eventos: Object.keys(byEvent).length, porEvento: byEvent },
    };
  }

  private async annualReport(year: number) {
    const start = dayjs(`${year}-01-01`);
    const end = start.endOf("year");

    const attendances = await prisma.attendance.findMany({
      where: { scannedAt: { gte: start.toDate(), lte: end.toDate() } },
      orderBy: { scannedAt: "desc" },
      include: {
        member: { select: { firstName: true, lastName: true, role: true } },
        event: { select: { name: true, type: true, date: true } },
      },
    });

    const byMonth: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const a of attendances) {
      const month = dayjs(a.scannedAt).format("MMM");
      byMonth[month] = (byMonth[month] ?? 0) + 1;
      byType[a.event.type] = (byType[a.event.type] ?? 0) + 1;
    }

    return {
      title: `Reporte Anual - ${year}`,
      subtitle: `${attendances.length} asistencias en total`,
      headers: ["Miembro", "Rol", "Evento", "Tipo", "Fecha", "Estado"],
      rows: attendances.slice(0, 500).map((a) => [
        `${a.member.firstName} ${a.member.lastName}`,
        a.member.role === "LEADER" ? "Líder" : "Estudiante",
        a.event.name,
        a.event.type,
        dayjs(a.scannedAt).format("DD/MM/YYYY"),
        a.status === "LATE" ? "Tardanza" : "A tiempo",
      ]),
      summary: { total: attendances.length, porMes: byMonth, porTipo: byType },
    };
  }

  private async byTypeReport(role: "LEADER" | "STUDENT") {
    const members = await prisma.member.findMany({
      where: { role, isActive: true },
      include: {
        _count: { select: { attendances: true } },
        attendances: {
          take: 1,
          orderBy: { scannedAt: "desc" },
          select: { scannedAt: true, event: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      title: `Reporte por Tipo - ${role === "LEADER" ? "Líderes" : "Estudiantes"}`,
      subtitle: `${members.length} miembros activos`,
      headers: ["Nombre", "Documento", "Total Asistencias", "Última Asistencia", "Último Evento"],
      rows: members.map((m) => [
        `${m.firstName} ${m.lastName}`,
        m.documentId ?? "—",
        String(m._count.attendances),
        m.attendances[0] ? dayjs(m.attendances[0].scannedAt).format("DD/MM/YYYY") : "—",
        m.attendances[0]?.event.name ?? "—",
      ]),
      summary: { total: members.length, totalAsistencias: members.reduce((s, m) => s + m._count.attendances, 0) },
    };
  }
}
