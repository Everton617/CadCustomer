Passo a Passo para Rodar o Projeto
1. Clonar o Repositório
Primeiro, clone o repositório para sua máquina local:

bash
Copy
git clone https://github.com/seu-usuario/nome-do-repositorio.git
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
pnpm prisma migrate dev --name init
```

4. Rodar o Projeto
Agora, você pode rodar o projeto em modo de desenvolvimento:
```bash
pnpm run dev
```

O projeto estará disponível em:


http://localhost:3000
