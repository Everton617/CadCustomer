import { z } from "zod";

const CardSchema = z.object({
  number: z
    .string()
    .min(16, "O número do cartão deve ter 16 caracteres")
    .regex(/^(\d{4} ){3}\d{4}$/, "O número do cartão deve estar no formato xxxx xxxx xxxx xxxx"),
  valiDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/(2[5-9]|3[0-5])$/, "A data de validade deve estar no formato MM/AA, com o mês entre 01 e 12 e o ano entre 25 e 35."),
  cvv: z
    .string()
    .min(3, "O CVV deve ter 3 caracteres")
    .max(3, "O CVV deve ter 3 caracteres")
    .regex(/^\d+$/, "O CVV deve conter apenas números"),
});

export { CardSchema };