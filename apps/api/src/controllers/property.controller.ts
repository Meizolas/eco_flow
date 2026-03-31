import { FastifyReply, FastifyRequest } from "fastify";
import { createMeterSchema, createPropertySchema } from "../schemas/property.schemas";
import { propertyService } from "../services/property.service";

export const propertyController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const properties = await propertyService.list(request.user.sub);
    return reply.send(properties);
  },
  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createPropertySchema.parse(request.body);
    const property = await propertyService.create(request.user.sub, input);
    return reply.code(201).send(property);
  },
  async createMeter(request: FastifyRequest, reply: FastifyReply) {
    const input = createMeterSchema.parse(request.body);
    const meter = await propertyService.createMeter(request.user.sub, input);
    return reply.code(201).send(meter);
  }
};
