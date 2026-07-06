import { z } from "zod";

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  documentId: z.string().optional().nullable(),
  email: z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable().or(z.literal("")),
  photoUrl: z.string().optional().nullable().or(z.literal("")),
  role: z.enum(["LEADER", "STUDENT"]),
});

export const updateMemberSchema = createMemberSchema.partial();

export const memberQuerySchema = z.object({
  q: z.string().optional(),
  role: z.enum(["LEADER", "STUDENT"]).optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === "false" ? false : v === "true" ? true : undefined)),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Math.max(1, Number(v)) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => {
      const n = v ? Number(v) : 20;
      return Math.min(Math.max(1, n), 100);
    }),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type MemberQuery = z.infer<typeof memberQuerySchema>;
