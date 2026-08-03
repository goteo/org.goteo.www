<script lang="ts">
    import { createClient } from "@hey-api/client-fetch";

    import { t } from "../../i18n/store";
    import {
        apiGatewayChargesGetCollection,
        type ApiGatewayChargesGetCollectionData,
    } from "../../openapi/client";
    import Download from "../icons/actions/Download.svelte";
    import Close from "../icons/navigation/Close.svelte";
    import Spinner from "../icons/status/Spinner.svelte";
    import Button from "../library/buttons/Button.svelte";
    import { exportCollectionAsCSV } from "./../../utils/csvExporter";

    type ChargesFilters = ApiGatewayChargesGetCollectionData["query"];

    let { filters } = $props<{
        filters?: ChargesFilters;
    }>();

    const relayClient = createClient({
        baseUrl: "/api/relay",
    });

    let abortController = $state<AbortController | null>(null);
    let isExporting = $state(false);
    let exportProgress = $state(0);
    let rowsExported = $state(0);

    function handleCancelExport() {
        if (abortController) {
            abortController.abort();
            abortController = null;
        }
        isExporting = false;
        exportProgress = 0;
        rowsExported = 0;
    }

    function buildFilename(): string {
        const filenameParams: Record<string, string> = {};

        if (filters?.status && filters.status !== "all") {
            filenameParams.status = filters.status;
        }

        if (filters?.["money.amount[gte]"]) {
            filenameParams.amount = `gte${filters["money.amount[gte]"]}`;
        } else if (filters?.["money.amount[between]"]) {
            filenameParams.amount = (filters["money.amount[between]"] as string).replace("..", "-");
        }

        if (filters?.["checkout.gateway"]) {
            const gateway = String(filters["checkout.gateway"]).split("/").pop();
            filenameParams.gateway = gateway || "";
        }

        if (filters?.target) {
            filenameParams.target = String(filters.target);
        }

        if (filters?.["dateCreated[after]"]) {
            filenameParams.from = String(filters["dateCreated[after]"]);
        }

        if (filters?.["dateCreated[before]"]) {
            filenameParams.to = String(filters["dateCreated[before]"]);
        }

        const timestamp = new Date().toISOString().split("T")[0];
        const filterParts = Object.entries(filenameParams)
            .map(([key, value]) => `${key}-${value}`)
            .join("_");

        const baseFilename = $t("pages.admin.charges.export.filename") || "gateway-charges";
        return `${baseFilename}_${timestamp}${filterParts ? "_" + filterParts : ""}`;
    }

    async function handleExportCSV() {
        abortController = new AbortController();
        isExporting = true;
        exportProgress = 0;
        rowsExported = 0;

        try {
            const queryParams = { ...filters };

            const result = await exportCollectionAsCSV({
                filename: buildFilename(),
                abortSignal: abortController?.signal,
                fetcher: async (page, itemsPerPage) => {
                    if (abortController?.signal.aborted) throw new Error("cancelled");

                    try {
                        const response = await apiGatewayChargesGetCollection({
                            client: relayClient,
                            query: {
                                ...queryParams,
                                page,
                                itemsPerPage,
                            } as any,
                            signal: abortController?.signal,
                        });

                        const data = response?.data || [];
                        return data;
                    } catch (err) {
                        const errMessage = err instanceof Error ? err.message : String(err);
                        if (
                            errMessage.includes("aborted") ||
                            errMessage.includes("abort") ||
                            abortController?.signal.aborted
                        ) {
                            throw new Error("cancelled", { cause: err });
                        }
                        throw err;
                    }
                },
                transformer: (item) => {
                    const { money, ...rest } = item as any;
                    return {
                        ...rest,
                        "money.amount": money?.amount ?? "",
                        currency: money?.currency ?? "",
                    };
                },
                pagination: {
                    itemsPerPage: 100,
                    maxTotalRows: 10_000,
                    timeoutMs: 240_000,
                },
                onProgress: (current, total) => {
                    rowsExported = current;
                    exportProgress = total > 0 ? Math.round((current / total) * 100) : 0;
                },
            });

            if (result.status === "partial") {
                alert(
                    `${$t("pages.admin.charges.export.success") || "Export completed"}\n${result.message}`,
                );
            }
        } catch (error) {
            const message = (error instanceof Error ? error.message : String(error)).toLowerCase();

            if (
                message.includes("session") ||
                message.includes("401") ||
                message.includes("authentication")
            ) {
                alert($t("auth.sessionExpired") || "Session expired. Please log in again.");
            } else if (message.includes("no data")) {
                alert($t("pages.admin.charges.export.noData") || "No data found to export");
            } else if (message.includes("timeout")) {
                alert(
                    $t("pages.admin.charges.export.timeout") ||
                        "Export took too long. Try with more specific filters.",
                );
            } else if (
                message.includes("cancelled") ||
                message.includes("abort") ||
                message.includes("aborted")
            ) {
                console.log("Export cancelled by user");
            } else {
                console.error("Error exporting CSV:", error);
                alert($t("pages.admin.charges.export.error") || "Error exporting data");
            }
        } finally {
            abortController = null;
            isExporting = false;
            exportProgress = 0;
            rowsExported = 0;
        }
    }
</script>

<div class="flex items-center gap-2">
    <Button
        size="sm"
        kind="secondary"
        onclick={handleExportCSV}
        disabled={isExporting}
        aria-label={$t("pages.admin.charges.export.csv")}
    >
        {#if isExporting}
            <Spinner width="16px" height="16px" class="text-secondary" />
            <span class="text-secondary font-bold">
                {exportProgress > 0
                    ? `${rowsExported} (${exportProgress}%)`
                    : $t("pages.admin.charges.export.exporting")}
            </span>
        {:else}
            <Download width="16" height="16" class="text-secondary" />
            <span class="text-secondary font-bold">
                {$t("pages.admin.charges.export.csv")}
            </span>
        {/if}
    </Button>

    {#if isExporting}
        <Button
            size="sm"
            kind="ghost"
            onclick={handleCancelExport}
            aria-label={$t("actions.cancel") || "Cancel"}
            title={$t("actions.cancel") || "Cancel"}
        >
            <Close width="16" height="16" class="text-secondary" />
        </Button>
    {/if}
</div>
