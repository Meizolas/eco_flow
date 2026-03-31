import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { upsertLimitSchema } from "../schemas/limit.schemas";
import { limitService } from "../services/limit.service";

const listLimitQuerySchema = z.object({
  propertyId: z.string().uuid()
});

export const limitController = {
  async upsert(request: FastifyRequest, reply: FastifyReply) {
    const input = upsertLimitSchema.parse(request.body);
    const result = await limitService.upsert(request.user.sub, input);
    return reply.send(result);
  },
  async list(request: FastifyRequest<{ Querystring: { propertyId: string } }>, reply: FastifyReply) {
    const query = listLimitQuerySchema.parse(request.query);
    const result = await limitService.list(query.propertyId);
    return reply.send(result);
  }
};
