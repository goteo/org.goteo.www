import { writable, type Writable } from "svelte/store";

import type { Session } from "./types";

export const session: Writable<Session | undefined> = writable();
