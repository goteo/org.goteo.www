type RedirectOptions = {
    /**
     * A "permanent" redirection will return a status 301\
     * A "temporary" redirection will return a status 302
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/301
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/302
     */
    type?: "permanent" | "temporary";

    /**
     * Add query params to the target URL
     */
    query?: string | URLSearchParams | Record<string, string> | string[][];
}

const defaultOptions: RedirectOptions = {
    type: "temporary"
}

export function goto(target: URL | string, options: RedirectOptions = defaultOptions): Response {
    const status = options.type === "permanent" ? 301 : 302;
    const query = options.query ? '?' + options.query.toString() : '';

    return new Response(null, { status, headers: { "Location": target + query } });
}
