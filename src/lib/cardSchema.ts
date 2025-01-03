import { z } from "zod";

const CardSchema = z.object({
  number: z
    .string()
    .min(16, "O número do cartão deve ter 16 caracteres")
    .regex(/^(\d{4} ){3}\d{4}$/, "O número do cartão deve estar no formato xxxx xxxx xxxx xxxx"), 
  valiDate: z
    .string(), 
  cvv: z
    .string()
    .min(3, "O CVV deve ter 3 caracteres")
    .max(3, "O CVV deve ter 3 caracteres")
    .regex(/^\d+$/, "O CVV deve conter apenas números"), 
});

export { CardSchema };
