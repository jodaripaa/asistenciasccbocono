import { prisma } from "@shared/database/prisma";
import { NotFoundError } from "@shared/errors/app-error";
import type { CreateMemberInput, UpdateMemberInput, MemberQuery } from "../schemas/members.schema";
import type { Prisma } from "@prisma/client";

export class MembersService {
  async list(query: MemberQuery) {
    const where: Prisma.MemberWhereInput = {};

    if (query.q) {
      where.OR = [
        { firstName: { contains: query.q, mode: "insensitive" } },
        { lastName: { contains: query.q, mode: "insensitive" } },
        ...(query.q.length >= 3 ? [{ documentId: { contains: query.q } }] : []),
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { id: true, name: true } } },
      }),
      prisma.member.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getById(id: string) {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        attendances: { include: { event: { select: { id: true, name: true, date: true } } } },
      },
    });

    if (!member) {
      throw new NotFoundError("Miembro");
    }

    return member;
  }

  async create(input: CreateMemberInput, createdById: string) {
    const member = await prisma.member.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        documentId: input.documentId || null,
        email: input.email || null,
        phone: input.phone || null,
        photoUrl: input.photoUrl || null,
        role: input.role,
        createdById,
      },
    });

    return member;
  }

  async update(id: string, input: UpdateMemberInput) {
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Miembro");
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        ...(input.firstName !== undefined && { firstName: input.firstName }),
        ...(input.lastName !== undefined && { lastName: input.lastName }),
        ...(input.documentId !== undefined && { documentId: input.documentId || null }),
        ...(input.email !== undefined && { email: input.email || null }),
        ...(input.phone !== undefined && { phone: input.phone || null }),
        ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl || null }),
        ...(input.role !== undefined && { role: input.role }),
      },
    });

    return member;
  }

  async deactivate(id: string) {
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Miembro");
    }

    const member = await prisma.member.update({
      where: { id },
      data: { isActive: false },
    });

    return member;
  }

  async activate(id: string) {
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Miembro");
    }

    const member = await prisma.member.update({
      where: { id },
      data: { isActive: true },
    });

    return member;
  }
}
