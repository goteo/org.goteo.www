import { z } from "zod";

export const schema = z
  .object({
    type: z.enum(["individual", "organization"]).default("individual"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    legalName: z.string().optional(),
    taxId: z.string().optional(),
    hasTaxId: z.boolean().default(false),
    terms: z
      .boolean()
      .default(false)
      .refine((value) => value === true, { message: "You must agree to the terms" }),
    policies: z
      .boolean()
      .default(false)
      .refine((value) => value === true, { message: "You must accept our privacy policies" }),
  })
  .refine(
    (data) => {
      // If hasTaxId is true, taxId must be provided and at least 8 characters long
      if (data.hasTaxId && (!data.taxId || data.taxId.length < 8)) {
        return false;
      }
      return true;
    },
    {
      message: "Tax ID must be at least 8 characters long when selected",
      path: ["taxId"],
    }
  )
  .refine(
    (data) => {
      // If type is organization, legalName must be provided
      if (data.type === "organization" && (!data.legalName || data.legalName.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Legal name is required for organizations",
      path: ["legalName"],
    }
  );

export type FormSchema = z.infer<typeof schema>;
