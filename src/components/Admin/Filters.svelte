<script lang="ts">
    import FiltersIcon from "../../svgs/FiltersIcon.svelte";
    import ActiveFilterIcon from "../../svgs/ActiveFilterIcon.svelte";
    import Search from "./Search.svelte";
    import { apiGatewaysGetCollection } from "../../openapi/client/index";
    import {
        apiGatewayChargesGetCollection,
        type ApiGatewayChargesGetCollectionData,
    } from "../../openapi/client/index";
    import { t } from "../../i18n/store";
    import { onMount } from "svelte";

    let { filters, onApplyFilters, currentTarget } = $props<{
        filters: ApiGatewayChargesGetCollectionData["query"];
        onApplyFilters: (filters: any) => void;
        currentTarget?: string;
    }>();

    let showFilters = $state(false);
    let isExporting = $state(false);

    let selectedPaymentMethod = $state("");
    let selectedChargeStatus = $state("");
    let selectedRangeAmount = $state("");
    let dateFrom = $state("");
    let dateTo = $state("");

    let paymentMethodOptions = $state<[string, string][]>([]);
    let chargeStatusOptions = $state<[string, string][]>([]);
    let rangeAmountOptions = $state<[string, string][]>([]);

    onMount(async () => {
        const { data: paymentGateways } = await apiGatewaysGetCollection();

        paymentMethodOptions = [
            ["all", $t("contributions.filters.paymentMethod.options.all")],
            ...(paymentGateways ?? []).map((g): [string, string] => [
                g.name!,
                $t(`contributions.filters.paymentMethod.options.${g.name}`),
            ]),
        ];

        chargeStatusOptions = Object.entries($t("contributions.filters.chargeStatus.options"));
        rangeAmountOptions = Object.entries($t("contributions.filters.rangeAmount.options")).sort(
            ([a], [b]) => {
                const parseMin = (val: string) =>
                    val.includes("..") ? parseInt(val.split("..")[0]) : parseInt(val);
                if (a === "all") return -1;
                if (b === "all") return 1;
                return parseMin(a) - parseMin(b);
            },
        );
    });

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
            alert($t("contributions.filters.dateRange.errors.invalidRange"));
            return;
        }

        onApplyFilters({
            ...filters,
            "checkout.gateway": selectedPaymentMethod || undefined,
            status: selectedChargeStatus || undefined,
            "money.amount[gte]": selectedRangeAmount || undefined,
            "dateCreated[after]": dateFrom
                ? new Date(new Date(dateFrom).getTime()).toISOString()
                : undefined,
            "dateCreated[before]": dateTo
                ? new Date(new Date(dateTo).getTime()).toISOString()
                : undefined,
        });
    }

    function handleSelectTarget(accounting: string) {
        onApplyFilters({ target: accounting });
    }

    async function handleExportCSV() {
        isExporting = true;

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
                alert($t("contributions.export.noData") || "No se encontraron datos para exportar");
                return;
            }

            const timestamp = new Date().toISOString().split("T")[0];
            const filterParts = Object.entries(filenameParams)
                .map(([key, value]) => `${key}-${value}`)
                .join("_");

            const baseFilename = $t("contributions.export.filename") || "gateway-charges";
            const itemsText = $t("contributions.export.itemsText") || "items";
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
            alert($t("contributions.export.error"));
        } finally {
            isExporting = false;
        }
    }

    $effect(() => {
        if (typeof filters["checkout.gateway"] === "undefined") selectedPaymentMethod = "";
        if (typeof filters.status === "undefined") selectedChargeStatus = "";
        if (typeof filters["money.amount[gte]"] === "undefined") selectedRangeAmount = "";
        if (typeof filters["money.amount[between]"] === "undefined") selectedRangeAmount = "";

        if (typeof filters["dateCreated[after]"] === "undefined") dateFrom = "";
        if (typeof filters["dateCreated[before]"] === "undefined") dateTo = "";
    });
</script>

<div
    class="border-variant1 relative flex flex-col gap-10 rounded-[40px] border px-8 pt-6 pb-8 shadow-[0px_1px_3px_0px_#0000001A]"
>
    <div class=" flex items-center justify-between gap-4">
        <Search onSelectTarget={handleSelectTarget} />

        <div class="flex items-center gap-3">
            <button
                type="button"
                onclick={() => (showFilters = !showFilters)}
                class="border-secondary text-secondary relative inline-flex cursor-pointer items-center gap-2 rounded-3xl border px-6 py-4 font-bold text-nowrap"
            >
                <span class="relative">
                    <FiltersIcon />
                    {#if selectedPaymentMethod !== "" || selectedChargeStatus !== "" || selectedRangeAmount !== "" || dateFrom !== "" || dateTo !== ""}
                        <span class="absolute -top-1 -right-1">
                            <ActiveFilterIcon />
                        </span>
                    {/if}
                </span>
                {#if showFilters}
                    {$t("contributions.filters.btns.closeFilters")}
                {:else}
                    {$t("contributions.filters.btns.openFilters")}
                {/if}
            </button>
        </div>
    </div>

    {#if showFilters}
        <form onsubmit={handleSubmit} class="flex flex-col gap-6">
            <div class="grid grid-cols-3 gap-4">
                <select
                    class="border-secondary w-full rounded-lg border p-4"
                    bind:value={selectedPaymentMethod}
                >
                    <option value="" disabled selected
                        >{$t("contributions.filters.paymentMethod.title")}</option
                    >
                    {#each paymentMethodOptions as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>

                <select
                    class="border-secondary w-full rounded-lg border p-4"
                    bind:value={selectedChargeStatus}
                >
                    <option value="" disabled
                        >{$t("contributions.filters.chargeStatus.title")}</option
                    >
                    {#each chargeStatusOptions as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>

                <select
                    class="border-secondary w-full rounded-lg border p-4"
                    bind:value={selectedRangeAmount}
                >
                    <option value="" disabled
                        >{$t("contributions.filters.rangeAmount.title")}</option
                    >
                    {#each rangeAmountOptions as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>

                <div class="relative">
                    <label for="dateFrom" class="absolute top-0.5 left-4 text-[12px] text-gray-500">
                        {$t("contributions.filters.dateRange.initDate")}
                    </label>
                    <input
                        id="dateFrom"
                        type="date"
                        bind:value={dateFrom}
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                        class="border-secondary w-full rounded-lg border p-4 pt-4"
                    />
                </div>

                <div class="relative">
                    <label for="dateTo" class="absolute top-0.5 left-4 text-[12px] text-gray-500">
                        {$t("contributions.filters.dateRange.endDate")}
                    </label>
                    <input
                        id="dateTo"
                        type="date"
                        class="border-secondary w-full rounded-lg border p-4 pt-4"
                        bind:value={dateTo}
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                    />
                </div>
            </div>

            <div class="col-span-3 flex justify-end">
                <button
                    type="submit"
                    class="bg-primary text-secondary cursor-pointer rounded-3xl px-6 py-4 text-base font-bold"
                >
                    {$t("contributions.filters.btns.apply")}
                </button>
            </div>
        </form>
    {/if}
</div>

<div class="mt-2 flex justify-end">
    <button
        type="button"
        onclick={handleExportCSV}
        disabled={isExporting}
        class="bg-variant1 relative inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 font-medium text-nowrap text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
        {#if isExporting}
            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                ></circle>
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            {$t("contributions.export.exporting")}
        {:else}
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="text-gray-600"
            >
                <path
                    d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M7 10L12 15L17 10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M12 15V3"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
            {$t("contributions.export.csv")}
        {/if}
    </button>
</div>
