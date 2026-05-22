import { FastifyInstance } from "fastify"
import { handleSimulation } from "../controllers/consumption-controller"

export async function consumptionRoutes(app: FastifyInstance) {
  // Quando alguém enviar um POST para /simulate, o controller assume
  app.post("/simulate", handleSimulation)
}