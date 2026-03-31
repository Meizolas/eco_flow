import { PeriodType, ReadingSource } from "@prisma/client";
import { z } from "zod";

export const createReadingSchema = z.object({
  measuredLiters: z.coerce.number().positive(),
  meterReading: z.coerce.number().positive().optional(),
  readingAt: z.string().datetime(),
  source: z.nativeEnum(ReadingSource).default(ReadingSource.API),
  isEstimated: z.boolean().default(false)
});

export const readingQuerySchema = z.object({
  period: z.nativeEnum(PeriodType).default(PeriodType.MONTHLY)
});

export type CreateReadingInput = z.infer<typeof createReadingSchema>;
export type ReadingQueryInput = z.infer<typeof readingQuerySchema>;
