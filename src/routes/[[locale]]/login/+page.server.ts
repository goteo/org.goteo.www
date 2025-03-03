import { hash, verify } from "@node-rs/argon2";
import { encodeBase32LowerCase } from "@oslojs/encoding";
import { fail, redirect } from "@sveltejs/kit";

import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import { apiUserTokensPost } from "$client";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    // Get returnUrl from query params or default to home page
    const returnUrl = event.url.searchParams.get("returnUrl") || "/";
    return redirect(302, returnUrl);
  }
  return {};
};

export const actions: Actions = {
  login: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

    // Get returnUrl from form data instead of URL params
    const returnUrl = formData.get("returnUrl") || "/";

    console.log(`Login attempt: username=${username}, returnUrl=${returnUrl}`);

    if (!validateUsername(username)) {
      return fail(400, { message: "Invalid username (min 3, max 31 characters, alphanumeric only)" });
    }
    if (!validatePassword(password)) {
      return fail(400, { message: "Invalid password (min 6, max 255 characters)" });
    }

    const { data: existingUser, error } = await apiUserTokensPost({ body: { identifier: username, password } });

    if (error || typeof existingUser === "undefined") {
      return fail(400, { message: "Incorrect username or password" });
    }

    // Session creation in separate try/catch
    try {
      const sessionId = existingUser.id;
      const sessionToken = existingUser.token;
      const userId = existingUser.owner!.split("/").pop();

      if (!sessionToken || !userId || !sessionId) {
        return fail(400, { message: "Incorrect username or password" });
      }

      const session = await auth.createSession(sessionToken, userId, sessionId);
      auth.setSessionTokenCookie(event, `${session.token}#${session.id}`, session.expiresAt);
    } catch (error) {
      console.error("Session creation error:", error);
      return fail(500, { message: "Session creation error" });
    }

    console.log(`Redirecting to: ${returnUrl}`);
    // Use returnUrl from form data
    return redirect(302, returnUrl);
  },
  register: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

    // Get returnUrl from form data instead of URL params
    const returnUrl = formData.get("returnUrl") || "/";

    if (!validateUsername(username)) {
      return fail(400, { message: "Invalid username" });
    }
    if (!validatePassword(password)) {
      return fail(400, { message: "Invalid password" });
    }

    const userId = generateUserId();
    const passwordHash = await hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    try {
      await db.insert("user").values({ id: userId, username, passwordHash });

      const sessionToken = auth.generateSessionToken();
      const session = await auth.createSession(sessionToken, userId);
      auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
    } catch (e) {
      return fail(500, { message: "An error has occurred" });
    }

    // Use returnUrl from form data
    return redirect(302, returnUrl);
  },
};

function generateUserId() {
  // ID with 120 bits of entropy, or about the same as UUID v4.
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  const id = encodeBase32LowerCase(bytes);
  return id;
}

function validateUsername(username: unknown): username is string {
  return (
    typeof username === "string" &&
    (/^[a-z0-9_-]{3,31}$/.test(username) || // valid username format
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) // valid email format
  );
}

function validatePassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 6 && password.length <= 255;
}
