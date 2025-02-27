import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  console.debug("Loading layout", locals);
  return {
    user: locals.user,
  };
};
