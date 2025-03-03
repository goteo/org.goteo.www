import { fail, type RequestEvent } from "@sveltejs/kit";
import { eq } from "$lib/server/db/mock-db";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { apiUsersIdGet } from "$client";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = "auth-session";

export function generateSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const token = encodeBase64url(bytes);
  return token;
}

export async function createSession(token: string, userId: string) {
  // const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(`${token}#${userId}`)));
  const sessionId = `${token}#${userId}`;
  const session = {
    id: sessionId,
    userId,
    token,
    expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
  };
  // await db.insert("session").values(session);
  console.log(`Created session ${sessionId} for user ${userId}`);
  return session;
}

export async function validateSessionToken(token: string) {
  console.log("Validating session token");
  // const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sessionId = token;
  console.debug("Session ID:", sessionId);
  const [sessionToken, userId] = sessionId.split("#");
  console.debug("Session token:", sessionToken);
  console.debug("User ID:", userId);

  if (!sessionToken || !userId) {
    console.log("Invalid session token");
    return { session: null, user: null };
  }

  // First get the session
  // const sessionResults = await db.select().from("session").where(eq("id", sessionId)).execute();

  // if (!sessionResults || sessionResults.length === 0) {
  //   console.log("No session found");
  //   return { session: null, user: null };
  // }

  // const session = sessionResults[0];

  // Now get the user
  // const userResults = await db.select().from("user").where(eq("id", session.userId)).execute();
  const { data: user, error } = await apiUsersIdGet({
    path: { id: userId },
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (error || typeof user === "undefined") {
    return { session: null, user: null };
  }

  // const user = userResults[0];
  // if (!user) {
  //   console.log("No user found for session");
  //   return { session: null, user: null };
  // }

  // const sessionExpired = Date.now() >= session.expiresAt.getTime();
  // if (sessionExpired) {
  //   console.log("Session expired");
  //   await db.delete("session").where(eq("id", session.id));
  //   return { session: null, user: null };
  // }

  const renewSession = await createSession(sessionToken, userId);
  // const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
  // if (renewSession) {
  //   session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
  //   await db.update("session").set({ expiresAt: session.expiresAt }).where(eq("id", session.id));
  //   console.log("Session renewed");
  // }

  return { session: renewSession, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
  await db.delete("session").where(eq("id", sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
  console.log("Setting session cookie");
  event.cookies.set(sessionCookieName, token, {
    expires: expiresAt,
    path: "/",
  });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
  event.cookies.delete(sessionCookieName, {
    path: "/",
  });
}
