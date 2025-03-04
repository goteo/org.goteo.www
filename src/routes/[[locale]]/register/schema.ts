import { z } from "zod";

export const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  taxId: z.string().min(8, "Password must be at least 8 characters"),
  hasTaxId: z.boolean().default(false),
  terms: z.boolean().refine((value) => value, { message: "You must agree to the terms" }),
  policies: z.boolean().default(false),
});

export type FormSchema = z.infer<typeof schema>;
