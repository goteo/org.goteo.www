export type QueryFilters = Record<string, string | string[]>;

export function parseQueryFilters(
    search: string | URLSearchParams,
    options?: { exclude?: string[] },
): QueryFilters {
    const searchParams = typeof search === "string" ? new URLSearchParams(search) : search;
    const exclude = options?.exclude ?? [];
    const filters: QueryFilters = {};

    for (const [key] of searchParams.entries()) {
        if (exclude.includes(key)) continue;

        const values = searchParams.getAll(key);

        if (values.length > 1 || key.endsWith("[]")) {
            filters[key] = values;
        } else {
            filters[key] = values[0];
        }
    }

    return filters;
}

export function splitOrderParams(parsed: QueryFilters): {
    filters: QueryFilters;
    order: Record<string, "asc" | "desc">;
} {
    const filters: QueryFilters = {};
    const order: Record<string, "asc" | "desc"> = {};

    for (const [key, value] of Object.entries(parsed)) {
        const orderMatch = key.match(/^order\[(.+)\]$/);

        if (orderMatch && (value === "asc" || value === "desc")) {
            order[orderMatch[1]] = value;
        } else {
            filters[key] = value;
        }
    }

    return { filters, order };
}
