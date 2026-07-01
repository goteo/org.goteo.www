import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { passwordGrant } from "../auth/grant.ts";
import { buildSession, setSession } from "../auth/session.ts";
import {
    apiUsersPost,
    apiUsersIdpersonPatch,
    apiUsersIdorganizationPatch,
} from "../openapi/client/index.ts";

export const register = defineAction({
    accept: "form",
    input: z.object({
        type: z.enum(["individual", "organization"]),
        identifier: z.string(),
        password: z.string().min(8),
        firstname: z.string(),
        lastname: z.string(),
        dni: z.string().optional(),
        razonSocial: z.string().optional(),
        cif: z.string().optional(),
    }),
    handler: async (input, context) => {
        const { t } = context.locals;

        try {
            const { identifier, password, firstname, lastname, dni, razonSocial, cif } = input;

            if (input.type === "individual") {
                if (!firstname.trim() || !lastname.trim()) {
                    throw new ActionError({
                        code: "BAD_REQUEST",
                        message: t("register.error.incompletePersonFields"),
                    });
                }
            }

            if (input.type === "organization") {
                if (!razonSocial?.trim() || !cif?.trim() || !firstname.trim() || !lastname.trim()) {
                    throw new ActionError({
                        code: "BAD_REQUEST",
                        message: t("register.error.incompleteOrgFields"),
                    });
                }
            }

            const createUserResponse = await apiUsersPost({
                body: {
                    email: identifier,
                    password,
                    type: input.type,
                },
            });
            const userId = String(createUserResponse.data?.id ?? "");

            const auth = await passwordGrant({ identifier, password });

            if (!auth.access_token) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("login.error.invalidCredentials"),
                });
            }

            if (input.type === "individual") {
                await apiUsersIdpersonPatch({
                    path: { id: userId },
                    headers: auth.asHttpHeaders,
                    body: {
                        taxId: dni ?? "",
                        firstName: firstname,
                        lastName: lastname,
                    },
                });
            } else {
                await apiUsersIdpersonPatch({
                    path: { id: userId },
                    headers: auth.asHttpHeaders,
                    body: {
                        firstName: firstname,
                        lastName: lastname,
                    },
                });

                await apiUsersIdorganizationPatch({
                    path: { id: userId },
                    headers: auth.asHttpHeaders,
                    body: {
                        taxId: cif ?? "",
                        legalName: razonSocial ?? "",
                    },
                });
            }

            const session = await buildSession(auth);
            setSession(context.cookies, session);

            return { success: true };
        } catch (error) {
            console.error("🚨 Error al registrar:", JSON.stringify(error, null, 2));
            throw new ActionError({
                code: "BAD_REQUEST",
                message: t("register.error.unexpectedRegistration"),
            });
        }
    },
});
