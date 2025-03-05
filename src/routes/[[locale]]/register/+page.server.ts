import { fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { apiUsersIdorganizationPatch, apiUsersIdpersonPatch, apiUsersPost, apiUserTokensPost } from "$client";
import * as auth from "$lib/server/auth";

import type { PageServerLoad, Actions } from "./$types.js";
import { schema } from "./schema.js";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    // Get returnUrl from query params or default to home page
    const returnUrl = event.url.searchParams.get("returnUrl") || "/";
    return redirect(302, returnUrl);
  }

  const form = await superValidate(zod(schema));
  return { form };
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;
    const form = await superValidate(request, zod(schema));
    console.log({ form });
    if (!form.valid) {
      return fail(400, { form });
    }

    const { email, password, type } = form.data;
    const { data: user, error: userError } = await apiUsersPost({ body: { email, password, type } });

    if (userError || !user?.id) {
      console.error("Failed to create user:", userError);
      return fail(500, { message: "Failed to create user" });
    }

    const { data: existingUser, error } = await apiUserTokensPost({ body: { identifier: email, password } });

    if (error || typeof existingUser === "undefined") {
      console.error("Incorrect username or password");
      return fail(400, { message: "Incorrect username or password" });
    }

    const { id: userId } = user;
    const sessionId = existingUser.id;
    const sessionToken = existingUser.token;

    if (!sessionToken || !userId || !sessionId) {
      return fail(400, { message: "Incorrect username or password" });
    }

    const { firstName, lastName, taxId } = form.data;
    const { data: person, error: personError } = await apiUsersIdpersonPatch({
      headers: { Authorization: `Bearer ${sessionToken}` },
      path: { id: String(userId) },
      body: { firstName, lastName, ...(type === "individual" && taxId && { taxId }) },
    });

    if (personError || !person) {
      console.error("Failed to create person:", personError);
      return fail(500, { message: "Failed to create person" });
    }

    const { legalName } = form.data;
    if (type === "organization" && legalName && taxId) {
      const { data: organization, error: organizationError } = await apiUsersIdorganizationPatch({
        headers: { Authorization: `Bearer ${sessionToken}` },
        path: { id: String(userId) },
        body: { legalName, taxId },
      });

      if (organizationError || !organization) {
        console.error("Failed to create organization:", organizationError);
        return fail(500, { message: "Failed to create organization" });
      }
    }

    console.log(`User created successfully: ${email}`);

    const session = await auth.createSession(sessionToken, String(userId), sessionId);
    auth.setSessionTokenCookie(event, `${session.token}#${session.id}`, session.expiresAt);

    return { form };
  },
};
