import { defineAction, ActionError } from "astro:actions";
import { apiGatewayCheckoutsPost, type GatewayCharge } from "../openapi/client";
import { client } from "../openapi/client/client.gen";
import { apiGatewaysNameGetUrl } from "../openapi/client/paths.gen";

export const payment = defineAction({
    accept: "form",
    handler: async (input, context) => {
        const { t, session } = context.locals;

        try {
            const paymentMethod = input.get("paymentMethod");
            if (!paymentMethod) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("system.error.payment.missingMethod")
                });
            }

            const cartData = input.get("cartData");
            if (!cartData) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("system.error.payment.missingCartData")
                });
            }

            let cart: any;
            try {
                cart = JSON.parse(cartData.toString());
            } catch (err) {
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("system.error.payment.unprocessableCartData")
                });
            }

            const charges: GatewayCharge[] = Object.values(cart.items);

            const response = await apiGatewayCheckoutsPost({
                headers: session?.token.asHttpHeaders,
                body: {
                    origin: session?.user.accounting!,
                    gateway: client.buildUrl({ url: apiGatewaysNameGetUrl, path: { name: paymentMethod } }),
                    returnUrl: `${context.url.origin}/checkout/verify`,
                    charges
                }
            });

            if (response.error) {
                console.log(response);

                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: t("system.error.payment.badAPIResponse")
                })
            }

            return { success: true, checkout: response.data };
        } catch (err) {
            console.error(err);

            if (err instanceof ActionError) throw err;
            throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",
                message: t("system.error.unknown")
            });
        }
    },
});