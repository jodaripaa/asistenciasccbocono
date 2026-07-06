import dayjs from "dayjs";
import { prisma } from "@shared/database/prisma";

export class DashboardService {
  async getStats() {
    const today = dayjs();
    const startOfDay = today.startOf("day").toDate();
    const endOfDay = today.endOf("day").toDate();
    const startOfWeek = today.startOf("week").toDate();
    const startOfPrevWeek = today.subtract(1, "week").startOf("week").toDate();
    const endOfPrevWeek = today.subtract(1, "week").endOf("week").toDate();

    const [
      totalMembers,
      activeMembers,
      totalEvents,
      todayAttendances,
      activeEvent,
      recentAttendances,
      weeklyData,
      prevWeekData,
      roleDistribution,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { isActive: true } }),
      prisma.event.count(),
      prisma.attendance.count({
        where: { scannedAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.event.findFirst({
        where: { isActive: true },
        include: { _count: { select: { attendances: true } } },
      }),
      prisma.attendance.findMany({
        take: 10,
        orderBy: { scannedAt: "desc" },
        include: {
          member: { select: { id: true, firstName: true, lastName: true, photoUrl: true, role: true } },
          event: { select: { id: true, name: true } },
        },
      }),
      this.getDailyCounts(startOfWeek, today.endOf("day").toDate()),
      this.getDailyCounts(startOfPrevWeek, endOfPrevWeek),
      prisma.attendance.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const eventAttendance = activeEvent?._count?.attendances ?? 0;

    const totalAttendance = roleDistribution.reduce((sum, r) => sum + r._count, 0);

    return {
      totalMembers,
      activeMembers,
      totalEvents,
      todayAttendances,
      activeEvent: activeEvent
        ? { id: activeEvent.id, name: activeEvent.name, attendanceCount: eventAttendance }
        : null,
      attendancePercentage:
        activeMembers > 0 ? Math.round((eventAttendance / activeMembers) * 100) : 0,
      recentAttendances,
      weeklyComparison: {
        currentWeek: weeklyData,
        previousWeek: prevWeekData,
      },
      statusDistribution: roleDistribution.map((r) => ({
        status: r.status,
        count: r._count,
        percentage: totalAttendance > 0 ? Math.round((r._count / totalAttendance) * 100) : 0,
      })),
    };
  }

  private async getDailyCounts(from: Date, to: Date) {
    const attendances = await prisma.attendance.findMany({
      where: { scannedAt: { gte: from, lte: to } },
      select: { scannedAt: true },
    });

    const days: Record<string, number> = {};
    let cursor = dayjs(from);
    const end = dayjs(to);

    while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
      days[cursor.format("YYYY-MM-DD")] = 0;
      cursor = cursor.add(1, "day");
    }

    for (const a of attendances) {
      const day = dayjs(a.scannedAt).format("YYYY-MM-DD");
      days[day] = (days[day] ?? 0) + 1;
    }

    return Object.entries(days).map(([date, count]) => ({
      date,
      dayLabel: dayjs(date).format("ddd"),
      count,
    }));
  }
}
