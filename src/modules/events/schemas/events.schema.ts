import { z } from "zod";

export const eventTypeLabels: Record<string, string> = {
  SERVICE: "Culto",
  BIBLE_SCHOOL: "Escuela Bíblica",
  CONGRESS: "Congreso",
  VIGIL: "Vigilia",
  CAMP: "Campamento",
  SPECIAL: "Evento Especial",
  CELL: "Célula",
};

export const createEventSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable().or(z.literal("")),
  date: z.string().min(1, "La fecha es requerida").transform((v) => new Date(v)),
  type: z.enum(["SERVICE", "BIBLE_SCHOOL", "CONGRESS", "VIGIL", "CAMP", "SPECIAL", "CELL"]),
  isActive: z.boolean().default(false),
});

export const updateEventSchema = createEventSchema.partial();

export const eventQuerySchema = z.object({
  type: z.enum(["SERVICE", "BIBLE_SCHOOL", "CONGRESS", "VIGIL", "CAMP", "SPECIAL", "CELL"]).optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === "false" ? false : v === "true" ? true : undefined)),
  from: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  to: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
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

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQuery = z.infer<typeof eventQuerySchema>;
