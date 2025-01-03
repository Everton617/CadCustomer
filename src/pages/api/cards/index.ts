import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getCustomersByUserEmail } from '@/app/model/modelCustomer';
import { createCard } from '@/app/model/modelCard';
import { CardSchema } from '@/lib/cardSchema';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return handlePost(req, res);
    case 'GET':
      return handleGet(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {

    const { customerId, cardData } = req.body;


  try {
    const validatedCardData = CardSchema.parse(cardData);

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

  
    const newCard = await prisma.card.create({
      data: {
        ...validatedCardData,
        customerId,
      },
    });

    return res.status(201).json({ message: "Cartão adicionado com sucesso.", card: newCard });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return res.status(500).json({ error: `Internal server error: ${error.message}` });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid email' });
  }

  try {
    const customers = await getCustomersByUserEmail(email);

    if (customers.length === 0) {
      return res.status(409).json({ message: 'Nenhum cliente encontrado para este usuário' });
    }
    return res.status(200).json(customers);

  } catch (error: unknown) {
    console.error(error);
    
    if (error instanceof Error) {
      return res.status(500).json({ error: `Erro ao buscar clientes: ${error.message}` });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
