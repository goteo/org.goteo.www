import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { apiProjectsGetCollection } from "../openapi/client/sdk.gen";
import { highlightRepository } from "../repositories/highlights";

export const saveHighlights = defineAction({
    accept: "json",
    input: z.object({
        type: z.string().min(1),
        layout: z.string().min(1),
        slots: z.array(z.string().min(1)),
    }),
    handler: async (input, context) => {
        const { session, t } = context.locals;

        if (!session?.user.roles?.includes("ROLE_ADMIN")) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: t("pages.admin.comm.banners.errors.forbidden"),
            });
        }

        await highlightRepository.save(input.type, input.layout, input.slots);
    },
});

export const deleteHighlights = defineAction({
    accept: "json",
    input: z.object({}),
    handler: async (_input, context) => {
        const { session, t } = context.locals;

        if (!session?.user.roles?.includes("ROLE_ADMIN")) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: t("pages.admin.comm.banners.errors.forbidden"),
            });
        }

        await highlightRepository.delete();
    },
});

export const searchProjects = defineAction({
    accept: "json",
    input: z.object({
        query: z.string().min(1),
    }),
    handler: async (input, context) => {
        const { session } = context.locals;

        if (!session?.user.roles?.includes("ROLE_ADMIN")) {
            throw new ActionError({
                code: "FORBIDDEN",
                message: "Forbidden",
            });
        }

        const acceptLang = context.request.headers.get("Accept-Language");

        const { data: projects } = await apiProjectsGetCollection({
            query: {
                title: input.query,
                page: 1,
                itemsPerPage: 10,
            },
            ...(acceptLang && { headers: { "Accept-Language": acceptLang } }),
        });

        return (projects || []).map((p) => ({
            slug: p.slug || "",
            title: p.title,
        }));
    },
});
