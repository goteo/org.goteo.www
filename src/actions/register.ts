import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import {
    apiUsersPost,
    apiUserTokensPost,
    apiUsersIdpersonPatch,
    apiUsersIdorganizationPatch,
} from "../openapi/client/index.ts";
import { extractId } from "../utils/extractId.ts";

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
            const accountingId = extractId(createUserResponse.data?.accounting);

            const { data: authData } = await apiUserTokensPost({
                body: {
                    identifier,
                    password,
                },
            });

            if (!authData?.id || !authData.token) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("login.error.invalidCredentials"),
                });
            }

            if (input.type === "individual") {
                await apiUsersIdpersonPatch({
                    path: { id: userId },
                    headers: {
                        Authorization: `Bearer ${authData?.token}`,
                    },
                    body: {
                        taxId: dni ?? "",
                        firstName: firstname,
                        lastName: lastname,
                    },
                });
            } else {
                await apiUsersIdpersonPatch({
                    path: { id: userId },
                    headers: {
                        Authorization: `Bearer ${authData?.token}`,
                    },
                    body: {
                        firstName: firstname,
                        lastName: lastname,
                    },
                });

                await apiUsersIdorganizationPatch({
                    path: { id: userId },
                    headers: {
                        Authorization: `Bearer ${authData?.token}`,
                    },
                    body: {
                        taxId: cif ?? "",
                        legalName: razonSocial ?? "",
                    },
                });
            }

            context.cookies.set(
                "access-token",
                {
                    id: authData.id,
                    token: authData.token,
                    accountingId,
                    timestamp: Date.now(), // Add timestamp for client-side expiration checking
                },
                {
                    path: "/",
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                },
            );

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
