import { z } from "zod";
import { localeErrorMap } from "$lib/i18n/localeErrorMap";

// Set custom error map globally
z.setErrorMap(localeErrorMap);

export const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type FormSchema = z.infer<typeof schema>;
