import type { Territory } from "../openapi/client";

export const getTerritoryTag = (territory: Territory): string | undefined => {
    const entries = Object.entries(territory).reverse();

    return entries.at(0)?.[1] ?? undefined;
};
