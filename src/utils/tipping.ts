import { client } from "../openapi/client/client.gen";
import { apiTipjarsIdGetUrl } from "../openapi/client/paths.gen";

/**
 * Is tipping to the platform owner possible?
 */
export const isEnabled =
    import.meta.env.PUBLIC_TIPPING_TIPJAR_ID && import.meta.env.PUBLIC_TIPPING_TIPJAR_ID !== "";

export const tipjarId = import.meta.env.PUBLIC_TIPPING_TIPJAR_ID;

/**
 * IRI to the Tipjar resource defined by the platform owner as recipient of tips
 */
export const tipjarIri = client.buildUrl({
    url: apiTipjarsIdGetUrl,
    path: { id: tipjarId },
});

export const defaultAmount = import.meta.env.PUBLIC_TIPPING_DEFAULT_AMOUNT;
