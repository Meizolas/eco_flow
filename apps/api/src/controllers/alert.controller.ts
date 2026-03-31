import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { alertRepository } from "../repositories/alert.repository";

const markNotificationSchema = z.object({
  notificationId: z.string().uuid()
});

export const alertController = {
  async listAlerts(request: FastifyRequest, reply: FastifyReply) {
    const alerts = await alertRepository.listByUser(request.user.sub);
    return reply.send(alerts);
  },
  async listNotifications(request: FastifyRequest, reply: FastifyReply) {
    const notifications = await alertRepository.listNotifications(request.user.sub);
    return reply.send(notifications);
  },
  async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    const { notificationId } = markNotificationSchema.parse(request.body);
    await alertRepository.markNotificationAsRead(request.user.sub, notificationId);
    return reply.code(204).send();
  }
};
