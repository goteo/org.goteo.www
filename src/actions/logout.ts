import { ActionError, defineAction } from "astro:actions";

import { apiUserTokensIdDelete } from "../openapi/client/index.ts";

export const logout = defineAction({
    handler: async (_, context) => {
        try {
            const cookieValue = context.cookies.get("access-token");

            if (!cookieValue) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: "Token de acceso no encontrado.",
                });
            }

            const { id, token } = cookieValue.json();

            if (!id || !token) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: "Credenciales inválidas en la cookie.",
                });
            }

            /* TODO: Check if  works */

            await apiUserTokensIdDelete({
                path: {
                    id,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            context.cookies.delete("access-token", { path: "/" });

            return { success: true };
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            throw new ActionError({
                code: "BAD_REQUEST",
                message: "No se pudo cerrar la sesión. Intenta de nuevo.",
            });
        }
    },
});
