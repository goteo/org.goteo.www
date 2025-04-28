import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { apiGatewayCheckoutsPost, apiGatewaysGetCollection } from "../openapi/client/index.ts";

import type { GatewayCharge, ApiGatewaysNameGetResponse } from "../openapi/client/index.ts";

const defaultCurrency = import.meta.env.PUBLIC_CURRENCY_DEFAULT || "EUR";

const response = await apiGatewaysGetCollection();
const paymentGateways: ApiGatewaysNameGetResponse[] | undefined = response.data;

if (!paymentGateways) {
    throw new Error("Payment gateways not found");
}

const paymentGatewayNames = paymentGateways
    .map((gateway) => gateway.name)
    .filter((name): name is string => name !== undefined);

export const payment = defineAction({
    accept: "form",
    input: z.object({
        paymentMethod: z.enum(paymentGatewayNames as [string, ...string[]]),
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
        const { t, lang } = context.locals;

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

            const accessToken = context.cookies.get("access-token")?.json();
            const accountingId = accessToken?.accountingId ?? null;

            if (!accountingId) {
                throw new ActionError({
                    code: "UNAUTHORIZED",
                    message: t("payment.error.missingAccountingId"),
                });
            }

            const origin = `/v4/accountings/${accountingId}`;
            const base = context.url.origin;
            const returnUrl = `${base}/${lang}/payment/verify`;
            const gateway = `/v4/gateways/${input.paymentMethod}`;

            const response = await apiGatewayCheckoutsPost({
                body: {
                    gateway,
                    origin,
                    charges,
                    returnUrl,
                },
            });

            return { success: true, checkout: response.data };
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
