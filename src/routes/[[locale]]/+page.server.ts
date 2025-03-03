import * as auth from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  logout: async (event) => {
    if (!event.locals.session) {
      return fail(401);
    }
    await auth.invalidateSession(event.locals.session.id, event.locals.session.token);
    auth.deleteSessionTokenCookie(event);

    // Refresh current page instead of redirecting to "/login"
    return redirect(302, event.url.pathname);
  },
};
