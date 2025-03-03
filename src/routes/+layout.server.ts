import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  console.debug("/+layout.server", locals);
  return {
    user: locals.user,
  };
};
