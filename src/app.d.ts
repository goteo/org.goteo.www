import type { SupportedLocale } from "$lib/i18n";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      locale: SupportedLocale;
      user: import("$lib/server/auth").SessionValidationResult["user"];
      session: import("$lib/server/auth").SessionValidationResult["session"];
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
