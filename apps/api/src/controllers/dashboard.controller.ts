import { FastifyReply, FastifyRequest } from "fastify";
import { PeriodType } from "@prisma/client";
import { z } from "zod";
import { dashboardService } from "../services/dashboard.service";

const dashboardQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
  period: z.nativeEnum(PeriodType).default(PeriodType.MONTHLY)
});

export const dashboardController = {
  async summary(
    request: FastifyRequest<{ Querystring: { propertyId?: string; period?: PeriodType } }>,
    reply: FastifyReply
  ) {
    const query = dashboardQuerySchema.parse(request.query);
    const result = await dashboardService.getSummary(request.user.sub, query.propertyId, query.period);
    return reply.send(result);
  }
};
