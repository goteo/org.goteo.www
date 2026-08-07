import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { createBanner as insertBanner, toEpoch } from "../utils/banners.ts";

export const createBanner = defineAction({
    accept: "form",
    input: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        callToAction: z.string().min(1),
        link: z.string().min(1),
        startDate: z.string().min(1),
        endDate: z.string().min(1),
    }),
    handler: async (input, context) => {
        const { session, t, runtime } = context.locals;

        // Actions are posted to /_actions/*, which the /admin firewall rule does not
        // match, so the role has to be checked here.
        if (!session?.user.roles?.includes("ROLE_ADMIN")) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: t("pages.admin.comm.banners.errors.forbidden"),
            });
        }

        try {
            new URL(input.link);
        } catch {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: t("pages.admin.comm.banners.errors.invalidUrl"),
            });
        }

        const startsAt = toEpoch(input.startDate);
        const endsAt = toEpoch(input.endDate);

        if (endsAt < startsAt) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: t("pages.admin.comm.banners.errors.invalidDateRange"),
            });
        }

        await insertBanner(runtime.env.DB, {
            title: input.title,
            description: input.description,
            ctaText: input.callToAction,
            ctaLink: input.link,
            startsAt,
            endsAt,
        });
    },
});
