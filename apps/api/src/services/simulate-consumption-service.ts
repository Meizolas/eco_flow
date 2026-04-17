import * as repository from '../repositories/consumption-repository'

export async function executeSimulation(value?: number) {
  // Se vier um valor no request, usa ele. 
  // Se não vier (undefined), gera um número aleatório entre 0.5 e 5.0 litros.
  const consumptionAmount = value ?? Number((Math.random() * (5 - 0.5) + 0.5).toFixed(2))
  
  // Chama o repositório para salvar
  const consumption = await repository.createConsumption(consumptionAmount)
  
  return consumption
}