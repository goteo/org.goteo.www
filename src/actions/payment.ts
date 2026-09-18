import { defineAction, ActionError } from "astro:actions";

import { apiGatewayCheckoutsPost, type GatewayCharge } from "../openapi/client";
import { client } from "../openapi/client/client.gen";
import { apiGatewaysIdGetUrl } from "../openapi/client/operation-paths.gen";

export const payment = defineAction({
    accept: "form",
    handler: async (input, context) => {
        const { t, session } = context.locals;

        if (!session) {
            throw new ActionError({
                code: "UNAUTHORIZED",
                message: t("system.error.unauthorized"),
            });
        }

        try {
            const paymentMethod = input.get("paymentMethod");
            if (!paymentMethod) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("system.error.payment.missingMethod"),
                });
            }

            const cartData = input.get("cartData");
            if (!cartData) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("system.error.payment.missingCartData"),
                });
            }

            let cart: any;
            try {
                cart = JSON.parse(cartData.toString());
            } catch (err) {
                console.error(err);

                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("system.error.payment.unprocessableCartData"),
                });
            }

            const charges: GatewayCharge[] = Object.values(cart.items);
            const payload = {
                origin: session.user.accounting!,
                gateway: client.buildUrl({
                    url: apiGatewaysIdGetUrl,
                    path: { id: paymentMethod },
                }),
                returnUrl: `${context.url.origin}/checkout/verify`,
                charges,
            };

            const { data, error } = await apiGatewayCheckoutsPost({
                headers: session.token.asHttpHeaders,
                body: payload,
            });

            if (error) {
                console.error(error);
                console.log(payload);

                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("system.error.payment.badAPIResponse"),
                });
            }

            return { success: true, checkout: data };
        } catch (err) {
            console.error(err);

            if (err instanceof ActionError) throw err;
            throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",
                message: t("system.error.unknown"),
            });
        }
    },
});
