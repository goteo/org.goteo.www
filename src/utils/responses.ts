/**
 * An HTTP response with 401 status
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401
 */
export const Unauthorized = new Response(null, { status: 401 });

/**
 * An HTTP response with 404 status
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404
 */
export const NotFound = new Response(null, { status: 404 });

/**
 * An HTTP response with 500 status
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/500
 */
export const InternalSeverError = new Response(null, { status: 500 });
