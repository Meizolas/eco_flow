import { propertyRepository } from "../repositories/property.repository";
import { CreateMeterInput, CreatePropertyInput } from "../schemas/property.schemas";

export const propertyService = {
  list(userId: string) {
    return propertyRepository.listByUser(userId);
  },
  create(userId: string, input: CreatePropertyInput) {
    return propertyRepository.create(userId, input);
  },
  async createMeter(userId: string, input: CreateMeterInput) {
    const property = await propertyRepository.findAccessibleProperty(userId, input.propertyId);

    if (!property) {
      throw new Error("Propriedade nao encontrada para o usuario.");
    }

    return propertyRepository.createMeter(input);
  }
};
