import { prisma } from "@shared/database/prisma";
import { NotFoundError } from "@shared/errors/app-error";
import type { CreateEventInput, UpdateEventInput, EventQuery } from "../schemas/events.schema";
import type { Prisma } from "@prisma/client";

export class EventsService {
  async list(query: EventQuery) {
    const where: Prisma.EventWhereInput = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = query.from;
      if (query.to) where.date.lte = query.to;
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { attendances: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { attendances: true } },
      },
    });

    if (!event) throw new NotFoundError("Evento");
    return event;
  }

  async create(input: CreateEventInput, createdById: string) {
    const event = await prisma.event.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        date: input.date,
        type: input.type,
        isActive: input.isActive ?? false,
        createdById,
      },
    });

    return event;
  }

  async update(id: string, input: UpdateEventInput) {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Evento");

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description ?? null }),
        ...(input.date !== undefined && { date: input.date }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });

    return event;
  }

  async setActive(id: string) {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Evento");

    const [event] = await prisma.$transaction([
      prisma.event.updateMany({ where: { isActive: true }, data: { isActive: false } }),
      prisma.event.update({ where: { id }, data: { isActive: true } }),
    ]);

    return event;
  }

  async getActive() {
    const event = await prisma.event.findFirst({
      where: { isActive: true },
      include: { _count: { select: { attendances: true } } },
    });

    return event;
  }
}
