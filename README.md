Passo a Passo para Rodar o Projeto
1. Clonar o Repositório
Primeiro, clone o repositório para sua máquina local:

git clone https://github.com/Everton617/CadCustomer

Navegue até a pasta do projeto:
```bash
cd nome-do-repositorio
```

2. Instalar Dependências
Instale as dependências do projeto usando npm, yarn ou pnpm. Recomendamos o uso do pnpm:
```bash
pnpm install
```

3. Configurar o Banco de Dados
Se você estiver usando o Prisma, é necessário gerar e aplicar as migrações para configurar o banco de dados. Execute os seguintes comandos:
Gere as migrações:
```bash
pnpm prisma migrate dev --development init
```

4. Rodar o Projeto
Agora, você pode rodar o projeto em modo de desenvolvimento:
```bash
pnpm run dev
```

O projeto estará disponível em:

http://localhost:3000


ESTRUTURA DOS ENDPOINTS.

Criar Cliente (POST /api/customers)

Visualizar Clientes (GET /api/customers)

Atualizar Cliente (PUT /api/customers)

Excluir Cliente (DELETE /api/customers)

- Associação de Cartões de Crédito
  
Criar Cartão (POST /api/cards)

Visualizar Cartões associados a um cliente (GET /api/cards)

Excluir Cartão (DELETE /api/cards)


