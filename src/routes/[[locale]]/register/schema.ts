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
    terms: z
      .boolean()
      .default(false)
      .refine(Boolean, { message: "zod.terms_required" }),
    policies: z
      .boolean()
      .default(false)
      .refine(Boolean, { message: "zod.policies_required" }),
  })
  // More concise refine conditions
  .refine(
    (data) => !data.hasTaxId || (data.taxId && data.taxId.length >= 8),
    { message: "zod.taxId_too_short", path: ["taxId"] }
  )
  .refine(
    (data) => data.type !== "organization" || (data.legalName && data.legalName.trim() !== ""),
    { message: "zod.legalName_required", path: ["legalName"] }
  );

export type FormSchema = z.infer<typeof schema>;
