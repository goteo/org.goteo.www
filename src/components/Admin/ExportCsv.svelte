<script lang="ts">
    import { t } from "../../i18n/store";
    import {
        apiGatewayChargesGetCollection,
        type ApiGatewayChargesGetCollectionData,
    } from "../../openapi/client";
    import Download from "../icons/Download.svelte";
    import Spinner from "../icons/Spinner.svelte";
    import Button from "../library/Button.svelte";

    let { filters } = $props<{
        filters?: ApiGatewayChargesGetCollectionData["query"];
    }>();

    let isExporting = $state(false);

    let currentTarget = $derived(filters?.target || "");
    let selectedChargeStatus = "";
    let selectedRangeAmount = "";
    let selectedPaymentMethod = "";
    let dateFrom;
    let dateTo;

    async function handleExportCSV() {
        isExporting = true;

        selectedChargeStatus = filters.status;

        if (filters["money.amount[gte]"] !== "") selectedRangeAmount = filters["money.amount[gte]"];
        else selectedRangeAmount = filters["money.amount[between]"];

        selectedPaymentMethod = filters["checkout.gateway"];

        dateFrom = filters["dateCreated[after]"];
        dateTo = filters["dateCreated[before]"];

        try {
            const queryParams: Record<string, string> = {};
            const filenameParams: Record<string, string> = {};

            if (selectedChargeStatus && selectedChargeStatus !== "all") {
                queryParams.status = selectedChargeStatus;
                filenameParams.status = selectedChargeStatus;
            }

            if (selectedRangeAmount && selectedRangeAmount !== "all") {
                if (selectedRangeAmount.includes("..")) {
                    queryParams["money.amount[between]"] = selectedRangeAmount;
                    filenameParams.amount = selectedRangeAmount.replace("..", "-");
                } else {
                    queryParams["money.amount[gte]"] = selectedRangeAmount;
                    filenameParams.amount = `gte${selectedRangeAmount}`;
                }
            }

            if (dateFrom) {
                const fromDate = new Date(new Date(dateFrom).getTime()).toISOString();
                queryParams["dateCreated[strictly_after]"] = fromDate;
                filenameParams.from = dateFrom;
            }

            if (dateTo) {
                const toDate = new Date(new Date(dateTo).getTime()).toISOString();
                queryParams["dateCreated[strictly_before]"] = toDate;
                filenameParams.to = dateTo;
            }

            if (selectedPaymentMethod && selectedPaymentMethod !== "all") {
                queryParams["checkout.gateway"] = `/v4/gateways/${selectedPaymentMethod}`;
                filenameParams.gateway = selectedPaymentMethod;
            }

            if (currentTarget) {
                queryParams.target = currentTarget;
                filenameParams.target = currentTarget;
            }

            let allData: any[] = [];
            let currentPage = 1;
            let hasMoreData = true;
            let totalItems = 0;

            while (hasMoreData) {
                const pageQueryParams = {
                    ...queryParams,
                    itemsPerPage: 50,
                    page: currentPage,
                };

                const pageResponse = await apiGatewayChargesGetCollection({
                    query: pageQueryParams,
                });

                const pageData = pageResponse?.data || [];
                const itemsInPage = pageData.length;
                totalItems += itemsInPage;

                if (itemsInPage === 0) {
                    hasMoreData = false;
                } else {
                    allData.push(...pageData);

                    if (itemsInPage < 50) {
                        hasMoreData = false;
                    } else {
                        currentPage++;
                    }
                }
            }

            if (allData.length === 0) {
                alert(
                    $t("pages.admin.charges.export.noData") ||
                        "No se encontraron datos para exportar",
                );
                return;
            }

            const timestamp = new Date().toISOString().split("T")[0];
            const filterParts = Object.entries(filenameParams)
                .map(([key, value]) => `${key}-${value}`)
                .join("_");

            const baseFilename = $t("pages.admin.charges.export.filename") || "gateway-charges";
            const itemsText = $t("pages.admin.charges.export.itemsText") || "items";
            const filename = `${baseFilename}_${timestamp}${filterParts ? "_" + filterParts : ""}_${totalItems}${itemsText}.csv`;

            const headers = Object.keys(allData[0]);
            const csvRows = [
                headers.join(","),
                ...allData.map((item) =>
                    headers
                        .map((header) => {
                            const value = item[header];
                            if (
                                typeof value === "string" &&
                                (value.includes(",") || value.includes('"') || value.includes("\n"))
                            ) {
                                return `"${value.replace(/"/g, '""')}"`;
                            }
                            if (typeof value === "object") {
                                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                            }
                            return value?.toString() || "";
                        })
                        .join(","),
                ),
            ];

            const csvContent = csvRows.join("\n");
            const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

            const url = window.URL.createObjectURL(csvBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting CSV:", error);
            alert($t("pages.admin.charges.export.error"));
        } finally {
            isExporting = false;
        }
    }
</script>

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
            {$t("pages.admin.charges.export.exporting")}
        </span>
    {:else}
        <Download width="16" height="16" class="text-secondary" />
        <span class="text-secondary font-bold">
            {$t("pages.admin.charges.export.csv")}
        </span>
    {/if}
</Button>
