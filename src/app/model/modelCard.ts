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

    const existingCard = await prisma.card.findUnique({
      where: { number: cardData.number },
    });

    if (existingCard) {
      throw new Error("Número do cartão já está em uso.");
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


export async function deleteCard(cardId: number) {
  try {
  
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new Error("Cartão não encontrado.");
    }

    const deletedCard = await prisma.card.delete({
      where: { id: cardId },
    });

    return deletedCard;
  } catch (error: any) {
    throw new Error(`Erro ao excluir o cartão: ${error.message}`);
  }
}