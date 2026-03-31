import { propertyRepository } from "../repositories/property.repository";
import { limitRepository } from "../repositories/limit.repository";
import { UpsertLimitInput } from "../schemas/limit.schemas";

export const limitService = {
  async upsert(userId: string, input: UpsertLimitInput) {
    const property = await propertyRepository.findAccessibleProperty(userId, input.propertyId);

    if (!property) {
      throw new Error("Propriedade nao encontrada para o usuario.");
    }

    return limitRepository.upsert(userId, input);
  },
  list(propertyId: string) {
    return limitRepository.listByProperty(propertyId);
  }
};
