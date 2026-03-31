import { z } from "zod";

export const createPropertySchema = z.object({
  name: z.string().min(2),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  reference: z.string().optional()
});

export const createMeterSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(2),
  serialNumber: z.string().min(4),
  installedAt: z.string().datetime().optional()
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type CreateMeterInput = z.infer<typeof createMeterSchema>;
