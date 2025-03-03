import { fail } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import type { PageServerLoad, Actions } from "./$types.js";
import { schema } from "./schema.js";

export const load: PageServerLoad = async () => {
  const form = await superValidate(zod(schema));
  return { form };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(schema));
    console.log({ form });
    if (!form.valid) {
      return fail(400, { form });
    }

    return message(form, "Form posted successfully!");
  },
};
