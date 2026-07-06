import dayjs from "dayjs";
import { prisma } from "@shared/database/prisma";
import { QrService } from "@modules/qr/services/qr.service";
import { NotFoundError, ConflictError } from "@shared/errors/app-error";
import type { ManualAttendanceInput, AttendanceQuery } from "../schemas/attendance.schema";
import type { Prisma } from "@prisma/client";

const LATE_THRESHOLD_MINUTES = 15;

export class AttendanceService {
  async scan(qrToken: string, eventId: string, registeredById: string) {
    const qrService = new QrService();
    const member = await qrService.resolveToken(qrToken);

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError("Evento");

    const existing = await prisma.attendance.findUnique({
      where: { memberId_eventId: { memberId: member.id, eventId } },
    });

    if (existing) {
      throw new ConflictError("Este miembro ya registró asistencia en este evento");
    }

    const now = dayjs();
    const eventStart = dayjs(event.date);
    const diffMinutes = now.diff(eventStart, "minute");
    const status = diffMinutes > LATE_THRESHOLD_MINUTES ? "LATE" : "PRESENT";

    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        eventId,
        registeredById,
        status,
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, photoUrl: true, role: true } },
        event: { select: { id: true, name: true } },
      },
    });

    return attendance;
  }

  async register(input: ManualAttendanceInput, registeredById: string) {
    const member = await prisma.member.findUnique({ where: { id: input.memberId } });
    if (!member || !member.isActive) throw new NotFoundError("Miembro");

    const event = await prisma.event.findUnique({ where: { id: input.eventId } });
    if (!event) throw new NotFoundError("Evento");

    const existing = await prisma.attendance.findUnique({
      where: { memberId_eventId: { memberId: input.memberId, eventId: input.eventId } },
    });

    if (existing) {
      throw new ConflictError("Este miembro ya registró asistencia en este evento");
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId: input.memberId,
        eventId: input.eventId,
        registeredById,
        status: input.status,
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, photoUrl: true, role: true } },
        event: { select: { id: true, name: true } },
      },
    });

    return attendance;
  }

  async list(query: AttendanceQuery) {
    const where: Prisma.AttendanceWhereInput = {};

    if (query.eventId) where.eventId = query.eventId;
    if (query.memberId) where.memberId = query.memberId;
    if (query.date) {
      const day = dayjs(query.date);
      where.scannedAt = {
        gte: day.startOf("day").toDate(),
        lte: day.endOf("day").toDate(),
      };
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { scannedAt: "desc" },
        include: {
          member: { select: { id: true, firstName: true, lastName: true, photoUrl: true, role: true, documentId: true } },
          event: { select: { id: true, name: true, date: true } },
          registeredBy: { select: { id: true, name: true } },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getTodayStats() {
    const today = dayjs();
    const startOfDay = today.startOf("day").toDate();
    const endOfDay = today.endOf("day").toDate();

    const [totalMembers, todayAttendances, activeEvent] = await Promise.all([
      prisma.member.count({ where: { isActive: true } }),
      prisma.attendance.count({
        where: { scannedAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.event.findFirst({ where: { isActive: true } }),
    ]);

    let eventAttendances = 0;
    if (activeEvent) {
      eventAttendances = await prisma.attendance.count({
        where: { eventId: activeEvent.id },
      });
    }

    return {
      totalMembers,
      todayAttendances,
      activeEvent,
      eventAttendances,
      percentage: totalMembers > 0 ? Math.round((eventAttendances / totalMembers) * 100) : 0,
    };
  }
}
