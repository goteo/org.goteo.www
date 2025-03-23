import type { ProjectTerritoryApiResource } from "../openapi/client/index";

export const getTerritoryTag = (territory: ProjectTerritoryApiResource): string | undefined => {
    const entries = Object.entries(territory)
        .filter(([key, value]) => /^subLvl\d+$/.test(key) && typeof value === "string")
        .sort(([a], [b]) => {
            const aNum = parseInt(a.replace("subLvl", ""), 10);
            const bNum = parseInt(b.replace("subLvl", ""), 10);
            return aNum - bNum;
        });

    const last = entries.at(-1);
    return last?.[1];
};
