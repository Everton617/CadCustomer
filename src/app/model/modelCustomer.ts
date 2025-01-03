import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const getCustomersByUserEmail = async (userEmail: string) => {
  try {
 
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        customers: true, 
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user.customers;
  } catch (error: unknown) {
  
    if (error instanceof Error) {
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido');
    }
  }
};

export const createCustomer = async (userEmail: string, customerData: {
    name: string;
    lastname?: string;
    email?: string;
    birthdate?: Date;
    phone?: string;
    address?: string;
  }) => {
    try {

      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
  
    
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
  

      const newCustomer = await prisma.customer.create({
        data: {
          ...customerData,
          userId: user.id, 
        },
      });
  
      return newCustomer;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Erro ao criar cliente: ${error.message}`);
      } else {
        throw new Error('Erro desconhecido');
      }
    }
  };