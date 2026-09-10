import { ActionError, defineAction } from "astro:actions";
import { z } from "zod";

import { homeHeroRepository } from "../repositories/homeHero";
import { endOfDay } from "../utils/dates";

// Astro turns any empty form field into null unless the validator is optional,
// so every field the admin may leave blank has to be declared as such.
const optionalText = z.string().optional();
const optionalUrl = z.url("pages.admin.home.hero.errors.invalidUrl").optional();

export const createHomeHero = defineAction({
    accept: "form",
    input: z.object({
        title: z.string("system.constraint.text.notEmpty").min(1),
        content: z.string("system.constraint.text.notEmpty").min(1),
        primaryCtaText: optionalText,
        primaryCtaLink: optionalUrl,
        secondaryCtaText: optionalText,
        secondaryCtaLink: optionalUrl,
        mediaUrl: optionalUrl,
        mediaType: optionalText,
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
    }),
    handler: async (input, context) => {
        const { session, t } = context.locals;

        // Actions are posted to /_actions/*, which the /admin firewall rule does not
        // match, so the role has to be checked here.
        if (!session?.user.roles?.includes("ROLE_ADMIN")) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: t("pages.admin.home.hero.errors.forbidden"),
            });
        }

        // DateInput submits a date-only string, so both dates land on midnight.
        // The scheduling window has to cover the whole end day.
        const endsAt = endOfDay(input.endsAt);

        if (endsAt < input.startsAt) {
            throw new ActionError({
                code: "BAD_REQUEST",
                message: t("pages.admin.home.hero.errors.invalidDateRange"),
            });
        }

        await homeHeroRepository.create({
            title: input.title,
            content: input.content,
            primaryCtaText: input.primaryCtaText || null,
            primaryCtaLink: input.primaryCtaLink || null,
            secondaryCtaText: input.secondaryCtaText || null,
            secondaryCtaLink: input.secondaryCtaLink || null,
            mediaUrl: input.mediaUrl || null,
            mediaType: input.mediaType || null,
            startsAt: input.startsAt,
            endsAt,
            dateCreated: new Date(),
        });
    },
});
