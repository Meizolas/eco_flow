import { FastifyReply, FastifyRequest } from "fastify";
import { createReadingSchema, readingQuerySchema } from "../schemas/reading.schemas";
import { readingService } from "../services/reading.service";

export const readingController = {
  async create(request: FastifyRequest<{ Params: { meterId: string } }>, reply: FastifyReply) {
    const input = createReadingSchema.parse(request.body);
    const result = await readingService.ingest(request.user.sub, request.params.meterId, input);
    return reply.code(201).send(result);
  },
  async list(
    request: FastifyRequest<{ Params: { meterId: string }; Querystring: { period?: string } }>,
    reply: FastifyReply
  ) {
    const query = readingQuerySchema.parse(request.query);
    const result = await readingService.listByPeriod(
      request.user.sub,
      request.params.meterId,
      query.period
    );
    return reply.send(result);
  }
};
