import { z } from "zod";

export const scanAttendanceSchema = z.object({
  qrToken: z.string().uuid("Token QR inválido"),
  eventId: z.string().uuid("ID de evento inválido"),
});

export const manualAttendanceSchema = z.object({
  memberId: z.string().uuid("ID de miembro inválido"),
  eventId: z.string().uuid("ID de evento inválido"),
  status: z.enum(["PRESENT", "LATE"]).default("PRESENT"),
});

export const attendanceQuerySchema = z.object({
  eventId: z.string().optional(),
  memberId: z.string().optional(),
  date: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.max(1, Number(v)) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => {
      const n = v ? Number(v) : 50;
      return Math.min(Math.max(1, n), 200);
    }),
});

export type ScanAttendanceInput = z.infer<typeof scanAttendanceSchema>;
export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;
export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;
