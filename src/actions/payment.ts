import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { getSession } from "../auth/session.ts";
import { apiGatewayCheckoutsPost } from "../openapi/client/index.ts";
import { getDefaultCurrency } from "../utils/consts.ts";

import type { GatewayCharge } from "../openapi/client/index.ts";

const defaultCurrency = getDefaultCurrency();

export const payment = defineAction({
    accept: "form",
    input: z.object({
        paymentMethod: z.string(), // Temporalmente cambiamos a string
        cartData: z.preprocess(
            (val) => {
                try {
                    return typeof val === "string" ? JSON.parse(val) : null;
                } catch {
                    return null;
                }
            },
            z.object({
                items: z
                    .array(
                        z.object({
                            title: z.string(),
                            amount: z.number(),
                            quantity: z.number(),
                            target: z.number(),
                        }),
                    )
                    .min(1),
            }),
        ),
    }),
    handler: async (input, context) => {
        const { t } = context.locals;

        try {
            const cart = input.cartData;
            const charges: GatewayCharge[] = cart.items.map((item) => ({
                type: "single",
                title: item.title,
                description: item.title,
                target: `/v4/accountings/${item.target}`,
                money: {
                    amount: item.amount * item.quantity,
                    currency: defaultCurrency,
                },
            }));

            const session = await getSession(context.cookies);

            if (!session) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: t("payment.error.missingAccountingId"),
                });
            }

            const response = await apiGatewayCheckoutsPost({
                body: {
                    charges,
                    gateway: `/v4/gateways/${input.paymentMethod}`,
                    origin: session.user.accounting!,
                    returnUrl: `${context.url.origin}/checkout/verify`,
                },
                headers: {
                    Authorization: `Bearer ${session.token.access_token}`,
                },
            });

            let success = true;

            if (response.error) {
                success = false;

                console.error(response);
            }

            return { success, checkout: response.data };
        } catch (err) {
            console.error(err);

            if (err instanceof ActionError) {
                throw err;
            }

            throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",
                message: t("payment.error.unexpectedPayment"),
            });
        }
    },
});
