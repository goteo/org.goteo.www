import { z } from "zod";
import { localeErrorMap } from "$lib/localeErrorMap";

// Set custom error map globally
z.setErrorMap(localeErrorMap);

export const schema = z
  .object({
    type: z.enum(["individual", "organization"]).default("individual"),
    first_name: z.string().min(1), // Uses zod.string.too_small from translation
    last_name: z.string().min(1),
    email: z.string().email(), // Uses zod.email.invalid from translation
    password: z.string().min(8),
    legalName: z.string().optional(),
    taxId: z.string().optional(),
    hasTaxId: z.boolean().default(false),
    terms: z.boolean().default(false).refine(Boolean),
    policies: z.boolean().default(false).refine(Boolean),
  })
  // More concise refine conditions
  .refine((data) => !data.hasTaxId || (data.taxId && data.taxId.length >= 8), {
    params: { namespace: "register.form.zod" },
    path: ["taxId"],
  })
  .refine((data) => data.type !== "organization" || (data.legalName && data.legalName.trim() !== ""), {
    params: { namespace: "register.form.zod" },
    path: ["legalName"],
  });

export type FormSchema = z.infer<typeof schema>;
