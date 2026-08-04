export interface ExportCsvOptions {
    filename: string;
    abortSignal?: AbortSignal;
    fetcher: (page: number, itemsPerPage: number) => Promise<unknown[]>;
    transformer?: (item: unknown) => Record<string, unknown>;
    pagination?: {
        itemsPerPage?: number;
        maxTotalRows?: number;
        timeoutMs?: number;
    };
    onProgress?: (current: number, total: number) => void;
}

export interface ExportCsvResult {
    status: "success" | "partial";
    message?: string;
}

export function flattenObject(obj: unknown, prefix = ""): Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) {
        return prefix ? { [prefix]: obj ?? "" } : {};
    }

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const pre = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
            result[pre] = "";
        } else if (value instanceof Date) {
            result[pre] = value.toISOString();
        } else if (Array.isArray(value)) {
            result[pre] = value
                .map((item) =>
                    typeof item === "object" && item !== null ? JSON.stringify(item) : String(item),
                )
                .join(", ");
        } else if (typeof value === "object") {
            Object.assign(result, flattenObject(value, pre));
        } else {
            result[pre] = value;
        }
    }

    return result;
}

function sanitizeCsvField(value: unknown): string {
    if (value === null || value === undefined) return '""';

    let str = String(value);

    if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
    }

    return `"${str.replace(/"/g, '""')}"`;
}

export async function exportCollectionAsCSV(options: ExportCsvOptions): Promise<ExportCsvResult> {
    const {
        filename,
        abortSignal,
        fetcher,
        transformer = (item) => flattenObject(item),
        pagination = {},
        onProgress,
    } = options;

    const itemsPerPage = pagination.itemsPerPage ?? 100;
    const maxTotalRows = pagination.maxTotalRows ?? 10000;

    let page = 1;
    const allRows: Record<string, unknown>[] = [];
    let hasMore = true;

    while (hasMore) {
        if (abortSignal?.aborted) {
            throw new Error("cancelled");
        }

        const items = await fetcher(page, itemsPerPage);

        if (!items || items.length === 0) {
            break;
        }

        const transformed = items.map((item) => transformer(item));
        allRows.push(...transformed);

        if (onProgress) {
            onProgress(allRows.length, maxTotalRows);
        }

        if (items.length < itemsPerPage || allRows.length >= maxTotalRows) {
            hasMore = false;
        } else {
            page++;
        }
    }

    if (allRows.length === 0) {
        throw new Error("no data");
    }

    const headers = Array.from(new Set(allRows.flatMap((row) => Object.keys(row))));

    const csvContent = [
        headers.map((h) => sanitizeCsvField(h)).join(","),
        ...allRows.map((row) => headers.map((header) => sanitizeCsvField(row[header])).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
        status: allRows.length >= maxTotalRows ? "partial" : "success",
        message:
            allRows.length >= maxTotalRows ? `Export limited to ${maxTotalRows} rows.` : undefined,
    };
}
