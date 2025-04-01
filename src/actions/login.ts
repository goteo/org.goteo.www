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
                    message: "Correo electrónico o contraseña inválidos.",
                });
            }

            context.cookies.set(
                "access-token",
                { id: data.id, token: data.token },
                {
                    path: "/",
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                },
            );

            return { success: true };
        } catch (error) {
            console.error("Ocurrió un error inesperado:", error);
            throw new ActionError({
                code: "BAD_REQUEST",
                message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
            });
        }
    },
});
