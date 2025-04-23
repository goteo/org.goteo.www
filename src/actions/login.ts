import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { apiUserTokensPost } from "../openapi/client/index.ts";

export const login = defineAction({
    accept: "form",
    input: z.object({
        identifier: z.string(),
        password: z.string(),
    }),
    handler: async (input, context) => {
        const { t } = context.locals;

        try {
            const { data } = await apiUserTokensPost({
                body: {
                    identifier: input.identifier,
                    password: input.password,
                },
            });

            if (!data) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("login.error.invalidCredentials"),
                });
            }

            context.cookies.set(
                "access-token",
                { id: data.id, token: data.token },
                {
                    path: "/",
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                },
            );

            return { success: true };
        } catch (err) {
            console.error(err);

            if (err instanceof ActionError) {
                throw err;
            }

            throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",
                message: t("login.error.unexpectedLogin"),
            });
        }
    },
});
