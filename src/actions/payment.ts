import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { apiGatewayCheckoutsPost } from "../openapi/client/index.ts";

import type { GatewayCharge } from "../openapi/client/index.ts";

export const payment = defineAction({
    accept: "form",
    input: z.object({
        paymentMethod: z.enum(["wallet", "paypal", "stripe"]),
        cartData: z.string().min(1),
    }),
    handler: async (input, context) => {
        const { t, lang } = context.locals;

        try {
            const cart = JSON.parse(input.cartData) as {
                items: {
                    title: string;
                    amount: number;
                    quantity: number;
                    target: string;
                    accountingId: string;
                }[];
            };

            const charges: GatewayCharge[] = cart.items.map((item) => ({
                type: "single",
                title: item.title,
                description: item.title,
                target: `/v4/accountings/${item.accountingId}`,
                money: {
                    amount: item.amount * item.quantity,
                    currency: "EUR",
                },
            }));

            const origin = "/v4/accountings/2955";
            const base = context.url.origin;
            const returnUrl = `${base}/${lang}/payment/approved`;
            const gateway = `/v4/gateways/${input.paymentMethod}`;

            const response = await apiGatewayCheckoutsPost({
                body: {
                    gateway,
                    origin,
                    charges,
                    returnUrl,
                },
            });

            console.log("Response from API:", response);

            return { success: true, checkout: response.data };
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
