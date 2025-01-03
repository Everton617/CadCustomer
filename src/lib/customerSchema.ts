import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"), 
  lastname: z.string().min(1, "O sobrenome é obrigatório"),
  email: z.string().email("Formato de e-mail inválido"), 
  birthDate: z.date(), 
  phone: z
    .string()
    .min(10, "O telefone deve conter pelo menos 10 caracteres")
    .max(15, "O telefone deve conter no máximo 15 caracteres"), 
  address: z.string().min(1, "O endereço é obrigatório"), 
 /* cep: z.string()  .min(9, "O cep deve ter no mínimo 9 caracteres")
  .max(9, "O cep deve ter no máximo 9 caracteres")
  .regex(/^\d{5}-\d{3}$/, "O formato do CEP é inválido. Exemplo: 12345-678"),
*/
});
