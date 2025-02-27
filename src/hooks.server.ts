import * as auth from "$lib/server/auth.js";
import { sequence } from "@sveltejs/kit/hooks";
import { init, locale } from "svelte-i18n";
import type { Handle } from "@sveltejs/kit";
import { config, hasTranslations, isValidLocale } from "$lib/i18n";

const i18n: Handle = async ({ event, resolve }) => {
  const urlLocale = event.params.locale;
  const acceptLang = event.request.headers.get("accept-language")?.split(",")[0]?.split("-")[0];

  let resolvedLocale = config.defaultLocale;

  if (urlLocale && isValidLocale(urlLocale) && hasTranslations(urlLocale)) {
    resolvedLocale = urlLocale;
  } else if (acceptLang && isValidLocale(acceptLang) && hasTranslations(acceptLang)) {
    resolvedLocale = acceptLang;
  }

  // Initialize i18n for SSR if not already initialized
  try {
    locale.set(resolvedLocale);
  } catch {
    init({
      fallbackLocale: config.defaultLocale,
      initialLocale: resolvedLocale,
    });
  }

  event.locals.locale = resolvedLocale;
  return resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
  console.log("Auth hook running");
  const sessionToken = event.cookies.get(auth.sessionCookieName);
  if (!sessionToken) {
    console.log("No session token in cookies");
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  console.log("Session token found, validating...");
  const { session, user } = await auth.validateSessionToken(sessionToken);
  if (session) {
    console.log("Valid session, user logged in:", user.username);
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
  } else {
    console.log("Invalid session, removing cookie");
    auth.deleteSessionTokenCookie(event);
  }

  event.locals.user = user;
  event.locals.session = session;

  return resolve(event);
};

export const handle = sequence(i18n, handleAuth);
