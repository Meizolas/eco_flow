import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createConsumption(amount: number) {
  // Esse comando salva o valor no banco de dados real
  return await prisma.waterConsumption.create({
    data: {
      amount
    }
  })
}