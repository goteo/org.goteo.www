import { z } from "zod";

export const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  taxId: z.string().min(8, "Tax ID must be at least 8 characters long"),
  hasTaxId: z.boolean().default(false),
  terms: z
    .boolean()
    .default(false)
    .refine((value) => value === true, { message: "You must agree to the terms" }),
  policies: z
    .boolean()
    .default(false)
    .refine((value) => value === true, { message: "You must accept our privacy policies" }),
});

export type FormSchema = z.infer<typeof schema>;
