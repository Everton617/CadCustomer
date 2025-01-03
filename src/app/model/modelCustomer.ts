import { PrismaClient } from '@prisma/client';
import { fail } from 'assert';

const prisma = new PrismaClient();


export const getCustomersByUserEmail = async (userEmail: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        customers: {
          include: {
            cards: {
              select: {
                id: true, 
                number: true,
                valiDate: true,
                cvv: true,
              },
            },
          },
        },
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

  export const deleteCustomerAndCards = async (customerId: number) => {
    try {
      const deletedCustomer = await prisma.customer.delete({
        where: {
          id: customerId,
        },
      });
  
      console.log('Cliente excluído com sucesso:', deletedCustomer);
      return deletedCustomer;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      throw new Error('Erro ao excluir o cliente e seus cartões');
    }
  };

  export const updateCustomer = async (customerId: number, customerData: {
    name?: string;
    lastname?: string;
    email?: string;
    birthdate?: Date;
    phone?: string;
    address?: string;
  }) => {
    try {
      const updatedCustomer = await prisma.customer.update({
        where: {
          id: customerId, 
        },
        data: {
          ...customerData, 
        },
      });
  
      console.log('Cliente atualizado com sucesso:', updatedCustomer);
      return updatedCustomer;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw new Error('Erro ao atualizar o cliente');
    }
  };