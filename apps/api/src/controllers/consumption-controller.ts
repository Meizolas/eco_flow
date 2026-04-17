import { FastifyRequest, FastifyReply } from "fastify"
import * as service from "../services/simulate-consumption-service"

export async function handleSimulation(req: FastifyRequest, res: FastifyReply) {
  // Tenta pegar o 'amount' do corpo da requisição (opcional)
  const body = req.body as { amount?: number }
  
  try {
    const data = await service.executeSimulation(body?.amount)
    
    // Devolve o consumo criado com status 201 (Criado)
    return res.status(201).send({
      message: "Simulação realizada com sucesso!",
      data
    })
  } catch (error) {
    return res.status(500).send({ error: "Erro ao simular consumo." })
  }
}