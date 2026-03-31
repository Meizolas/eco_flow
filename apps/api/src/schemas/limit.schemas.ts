import { PeriodType } from "@prisma/client";
import { z } from "zod";

export const upsertLimitSchema = z.object({
  propertyId: z.string().uuid(),
  waterMeterId: z.string().uuid().optional(),
  periodType: z.nativeEnum(PeriodType),
  limitLiters: z.coerce.number().positive(),
  warningPercentage: z.coerce.number().min(5).max(200).default(15),
  criticalPercentage: z.coerce.number().min(15).max(300).default(45),
  minimumSampleSize: z.coerce.number().min(3).max(60).default(7)
});

export type UpsertLimitInput = z.infer<typeof upsertLimitSchema>;
