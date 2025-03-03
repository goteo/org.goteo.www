import * as auth from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  if (!event.locals.session) {
    return new Response(null, { status: 401 });
  }

  await auth.invalidateSession(event.locals.session.id, event.locals.session.token);
  auth.deleteSessionTokenCookie(event);

  // Get the referrer URL or fallback to homepage
  const returnTo = event.request.headers.get("referer") || "/";

  return redirect(302, returnTo);
};
