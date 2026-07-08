import {
    apiTipjarsGetCollectionUrl,
    apiUsersGetCollectionUrl,
    apiProjectsGetCollectionUrl,
} from "../openapi/client/paths.gen";

import type { Accounting, User, Project, Tipjar } from "../openapi/client/index.ts";

export function getDisplayNameFromAccounting(
    accounting: Accounting | undefined,
    owners: Map<string, User | Project | Tipjar>,
): string | undefined {
    const ownerIri = accounting?.owner;
    if (!ownerIri) return undefined;

    const owner = owners.get(ownerIri);
    if (!owner) return undefined;

    switch (ownerIri.split("/").slice(0, -1).join("/")) {
        case apiUsersGetCollectionUrl:
            return (owner as User).displayName ?? undefined;
        case apiProjectsGetCollectionUrl:
            return (owner as Project).title ?? undefined;
        case apiTipjarsGetCollectionUrl:
            return (owner as Tipjar).name ?? undefined;
    }

    return undefined;
}
