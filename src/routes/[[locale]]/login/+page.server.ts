import { fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { apiUserTokensPost } from "$client";
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

        const { email, password } = form.data;
        const { data: existingUser, error } = await apiUserTokensPost({
            body: { identifier: email, password },
        });

        if (error || typeof existingUser === "undefined") {
            console.error("Incorrect username or password");
            return fail(400, { message: "Incorrect username or password" });
        }

        const { id: userId } = existingUser;
        const sessionId = existingUser.id;
        const sessionToken = existingUser.token;

        if (!sessionToken || !userId || !sessionId) {
            return fail(400, { message: "Incorrect username or password" });
        }

        const session = await auth.createSession(sessionToken, String(userId), sessionId);
        auth.setSessionTokenCookie(event, `${session.token}#${session.id}`, session.expiresAt);

        return message(form, "User logged successfully");
    },
};
