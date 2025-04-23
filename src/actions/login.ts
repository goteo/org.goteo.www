import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { apiUserTokensPost, apiUsersIdGet } from "../openapi/client/index.ts";
import { extractId } from "../utils/extractId.ts";

export const login = defineAction({
    accept: "form",
    input: z.object({
        identifier: z.string(),
        password: z.string(),
    }),
    handler: async (input, context) => {
        const { t } = context.locals;

        try {
            const { data: tokenData } = await apiUserTokensPost({
                body: {
                    identifier: input.identifier,
                    password: input.password,
                },
            });

            if (!tokenData?.id || !tokenData.token) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("login.error.invalidCredentials"),
                });
            }

            const id = extractId(String(tokenData.owner));

            if (!id) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("login.error.invalidCredentials"),
                });
            }

            const { data: userData } = await apiUsersIdGet({ path: { id } });

            if (!userData || !userData.accounting) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("login.error.invalidCredentials"),
                });
            }

            context.cookies.set(
                "access-token",
                {
                    id: tokenData.id,
                    token: tokenData.token,
                    accountingId: extractId(userData.accounting),
                },
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
