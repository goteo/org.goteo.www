import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { bannerRepository } from "../repositories/banner";

export const createBanner = defineAction({
    accept: "form",
    input: z.object({
        title: z.string("system.constraint.text.notEmpty").min(1),
        description: z.string("system.constraint.text.notEmpty").min(1),
        ctaText: z.string("system.constraint.text.notEmpty").min(1),
        ctaLink: z.url("system.constraint.text.expectedUrl"),
        startsAt: z.coerce.date().min(new Date(), "system.constraint.date.greaterThan"),
        endsAt: z.coerce.date().min(new Date(), "system.constraint.date.greaterThan"),
    }),
    handler: async (input, context) => {
        const { session, t } = context.locals;

        // Actions are posted to /_actions/*, which the /admin firewall rule does not
        // match, so the role has to be checked here.
        if (!session?.user.roles?.includes("ROLE_ADMIN")) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: t("pages.admin.comm.banners.errors.forbidden"),
            });
        }

        if (input.endsAt < input.startsAt) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: t("pages.admin.comm.banners.errors.invalidDateRange"),
            });
        }

        await bannerRepository.create({ ...input, dateCreated: new Date() });
    },
});
