import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getCustomersByUserEmail, createCustomer, deleteCustomerAndCards, updateCustomer } from '@/app/model/modelCustomer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return handlePost(req, res);
    case 'GET':
      return handleGet(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    case 'PUT': 
      return handlePut(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { userEmail } = req.query;
  const { name, lastname, email, birthdate, phone, address } = req.body;

  if (!name || !lastname || !birthdate || !phone || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newCustomer = await createCustomer(userEmail as string, {
      name,
      lastname,
      email,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      phone,
      address,
    });

    return res.status(201).json({
      message: 'Customer created successfully',
      customer: newCustomer,
    });
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

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { customerId } = req.query;

  if (!customerId || typeof customerId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid customer ID' });
  }

  try {
    const deletedCustomer = await deleteCustomerAndCards(parseInt(customerId));

    return res.status(200).json({
      message: 'Customer and associated cards deleted successfully',
      customer: deletedCustomer,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return res.status(500).json({ error: `Erro ao excluir cliente: ${error.message}` });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}


async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { customerId } = req.query;
  const { name, lastname, email, birthdate, phone, address } = req.body;

  if (!customerId || typeof customerId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid customer ID' });
  }

  if (!name && !lastname && !email && !birthdate && !phone && !address) {
    return res.status(400).json({ error: 'No data provided to update' });
  }

  try {
    const updatedCustomer = await updateCustomer(parseInt(customerId), {
      name,
      lastname,
      email,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      phone,
      address,
    });

    return res.status(200).json({
      message: 'Customer updated successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return res.status(500).json({ error: `Erro ao atualizar cliente: ${error.message}` });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
