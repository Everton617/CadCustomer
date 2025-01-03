import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CardData {
  number: string;
  valiDate: string;
  cvv: string;
}


export async function createCard(customerId: number, cardData: CardData) {
  try {

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error("Cliente não encontrado.");
    }


    const newCard = await prisma.card.create({
      data: {
        ...cardData,
        customerId,
      },
    });

    return newCard;
  } catch (error: any) {
    throw new Error(`Erro ao criar o cartão: ${error.message}`);
  }
}
