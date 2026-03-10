import { writable, type Writable } from "svelte/store";

import type { OAuthResponse } from "./types";
import type { Organization, Person, User } from "../openapi/client";

interface AuthStore {
    token: OAuthResponse;
    user: User;
    person?: Person;
    organization?: Organization;
}

export const LOCAL_STORAGE_KEY = "auth";

function init() {
    if (typeof localStorage === "undefined") {
        return;
    }

    const data = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!data) {
        return;
    }

    return JSON.parse(data);
}

export const auth: Writable<AuthStore> = writable(init());

auth.subscribe((value: AuthStore | undefined) => {
    if (typeof localStorage === "undefined") {
        return;
    }

    if (value === undefined) {
        return;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
});
