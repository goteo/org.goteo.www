import { ActionError, defineAction } from "astro:actions";

import { apiUserTokensIdDelete } from "../openapi/client/index.ts";

export const logout = defineAction({
    handler: async (_, context) => {
        const { t } = context.locals;

        try {
            const cookieValue = context.cookies.get("access-token");

            if (!cookieValue) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: t("logout.error.cookieNotFound"),
                });
            }

            const { id, token } = cookieValue.json();

            if (!id || !token) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: t("logout.error.invalidToken"),
                });
            }

            await apiUserTokensIdDelete({
                path: { id },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            context.cookies.delete("access-token", { path: "/" });

            return { success: true };
        } catch (err) {
            console.error(err);

            if (err instanceof ActionError) {
                throw err;
            }

            throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",
                message: t("logout.error.unexpectedLogout"),
            });
        }
    },
});
