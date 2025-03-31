import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import {
    apiUsersPost,
    apiUserTokensPost,
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
        try {
            console.log("🔁 Iniciando proceso de registro para tipo:", input.type);
            console.log("ℹ️ Datos de registro:", input);
            const { identifier, password, firstname, lastname, dni, razonSocial, cif } = input;

            if (input.type === "individual") {
                if (!firstname.trim() || !lastname.trim() || !dni?.trim()) {
                    throw new ActionError({
                        code: "BAD_REQUEST",
                        message: "Faltan datos obligatorios para persona física",
                    });
                }
            }

            if (input.type === "organization") {
                if (!razonSocial?.trim() || !cif?.trim() || !firstname.trim() || !lastname.trim()) {
                    throw new ActionError({
                        code: "BAD_REQUEST",
                        message: "Faltan datos obligatorios para persona jurídica",
                    });
                }
            }

            console.log("👤 Creando usuario...");
            const createUserResponse = await apiUsersPost({
                body: {
                    email: identifier,
                    password,
                    type: input.type,
                },
            });
            const userId = String(createUserResponse.data?.id ?? "");
            console.log("✅ Usuario creado con ID:", userId);

            console.log("🔐 Generando token...");
            const { data: authData } = await apiUserTokensPost({
                body: {
                    identifier,
                    password,
                },
            });
            console.log("✅ Token generado");

            if (input.type === "individual") {
                console.log("📝 Actualizando perfil de persona física...");
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
                console.log("📝 Actualizando perfil de organización...");
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

                /* TODO: Check if  works */
                const resOrg = await apiUsersIdorganizationPatch({
                    path: { id: userId },
                    headers: {
                        Authorization: `Bearer ${authData?.token}`,
                    },
                    body: {
                        taxId: cif ?? "",
                        legalName: razonSocial ?? "",
                    },
                });
                console.log("✅ Organización actualizada", resOrg);
            }

            context.cookies.set(
                "access-token",
                { id: authData?.id ?? "", token: authData?.token ?? "" },
                {
                    path: "/",
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                },
            );

            console.log("🎉 Registro completado con éxito.");
            return { success: true };
        } catch (error) {
            console.error("🚨 Error al registrar:", JSON.stringify(error, null, 2));
            throw new ActionError({
                code: "BAD_REQUEST",
                message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
            });
        }
    },
});
