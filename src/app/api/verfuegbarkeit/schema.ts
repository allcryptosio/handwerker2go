import { z } from "zod";
import { isValidDate, isValidTime, timeWindows } from "@/lib/booking/time";

export const searchSchema = z
  .object({
    leistung: z.string().regex(/^[a-z0-9-]{2,60}$/),
    ort: z.string().trim().min(2).max(80),
    datum: z.string().refine(isValidDate),
    zeit: z.string().refine(isValidTime).optional(),
    fenster: z.enum(timeWindows.map((w) => w.id) as [string, ...string[]]).optional(),
  })
  .refine((d) => Boolean(d.zeit) !== Boolean(d.fenster), { message: "Uhrzeit oder Zeitfenster wählen" });

export const windowById = (id: string) => timeWindows.find((w) => w.id === id)!;
