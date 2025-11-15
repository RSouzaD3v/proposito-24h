import { z } from "zod";

export const PersonalizationSchema = z.object({
  writerId: z.string(),
  primaryColor: z.string().default("#22c55e"),
  secondaryColor: z.string().default("#0f172a"), 
  backgroundColor: z.string().default("#ffffff"), 
  bgButtonColor: z.string().default("#22c55e"),
  buttonTextColor: z.string().default("#ffffff"),
  textColor: z.string().default("#000000"),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export type Personalization = z.infer<typeof PersonalizationSchema>;
