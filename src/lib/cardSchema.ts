import { z } from "zod";

const CardSchema = z.object({
  number: z
    .string()
    .min(16, "O número do cartão deve ter 16 caracteres")
    .max(16, "O número do cartão deve ter no máximo 16 caracteres")
    .regex(/^\d+$/, "O número do cartão deve conter apenas números"), 
  valiDate: z
    .string()
    .length(5, "A validade deve ser no formato MM/AA")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "A validade deve estar no formato MM/AA"), 
  cvv: z
    .string()
    .min(3, "O CVV deve ter 3 caracteres")
    .max(3, "O CVV deve ter 3 caracteres")
    .regex(/^\d+$/, "O CVV deve conter apenas números"), 
});

export { CardSchema };
