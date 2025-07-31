<script lang="ts">
    import FiltersIcon from "../../svgs/FiltersIcon.svelte";
    import ActiveFilterIcon from "../../svgs/ActiveFilterIcon.svelte";
    import Search from "./Search.svelte";
    import { apiGatewaysGetCollection } from "../../openapi/client/index";
    import { t } from "../../i18n/store";
    import { onMount } from "svelte";
    import { getBaseUrl } from "../../utils/consts";

    let { onApplyFilters, currentTarget } = $props<{
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
            paymentMethod: selectedPaymentMethod,
            chargeStatus: selectedChargeStatus,
            rangeAmount: selectedRangeAmount,
            from: dateFrom
                ? new Date(new Date(dateFrom).getTime() - 24 * 60 * 60 * 1000).toISOString()
                : undefined,
            to: dateTo
                ? new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000).toISOString()
                : undefined,
        });
    }

    function handleSelectTarget(accounting: string) {
        onApplyFilters({ target: accounting });
    }

    function getAccessToken(): string | null {
        const match = document.cookie.match(/(?:^|;\s*)access-token=([^;]*)/);
        if (!match) return null;

        try {
            const decoded = decodeURIComponent(match[1]);
            const parsed = JSON.parse(decoded);
            return parsed?.token ?? null;
        } catch {
            return null;
        }
    }

    async function handleExportCSV() {
        isExporting = true;

        try {
            const token = getAccessToken();
            if (!token) {
                alert($t("contributions.export.errorAuth"));
                return;
            }

            const queryParams = new URLSearchParams();

            if (selectedChargeStatus && selectedChargeStatus !== "all") {
                queryParams.append("status", selectedChargeStatus);
            }

            if (selectedRangeAmount && selectedRangeAmount !== "all") {
                if (selectedRangeAmount.includes("..")) {
                    queryParams.append("money.amount[between]", selectedRangeAmount);
                } else {
                    queryParams.append("money.amount[gte]", selectedRangeAmount);
                }
            }

            if (dateFrom) {
                const fromDate = new Date(
                    new Date(dateFrom).getTime() - 24 * 60 * 60 * 1000,
                ).toISOString();
                queryParams.append("dateCreated[strictly_after]", fromDate);
            }

            if (dateTo) {
                const toDate = new Date(
                    new Date(dateTo).getTime() + 24 * 60 * 60 * 1000,
                ).toISOString();
                queryParams.append("dateCreated[strictly_before]", toDate);
            }

            if (selectedPaymentMethod && selectedPaymentMethod !== "all") {
                queryParams.append("checkout.gateway", `/v4/gateways/${selectedPaymentMethod}`);
            }

            if (currentTarget) {
                queryParams.append("target", currentTarget);
            }

            queryParams.append("pagination", "false");
            queryParams.append("itemsPerPage", "0");
            queryParams.append("export", "all");

            const baseUrl = getBaseUrl();
            const exportUrl = `${baseUrl}/v4/gateway_charges/export?${queryParams.toString()}`;

            const response = await fetch(exportUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "text/csv",
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert($t("contributions.export.errorAuth"));
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType?.includes("text/csv")) {
                throw new Error("Response is not a CSV file");
            }

            const csvBlob = await response.blob();

            const url = window.URL.createObjectURL(csvBlob);
            const link = document.createElement("a");
            link.href = url;

            const contentDisposition = response.headers.get("content-disposition");
            let filename = "charges-export.csv";

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(
                    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
                );
                if (filenameMatch) {
                    filename = filenameMatch[1].replace(/['"]/g, "");
                }
            } else {
                const now = new Date();
                const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, "-");
                filename = `charges-export-${timestamp}.csv`;
            }

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
</script>

<div
    class="relative flex flex-col gap-10 rounded-[40px] border border-[#E6E5F7] px-8 pt-6 pb-8 shadow-[0px_1px_3px_0px_#0000001A]"
>
    <div class=" flex items-center justify-between gap-4">
        <Search onSelectTarget={handleSelectTarget} />

        <div class="flex items-center gap-3">
            <button
                type="button"
                onclick={handleExportCSV}
                disabled={isExporting}
                class="border-primary text-primary hover:bg-primary relative inline-flex cursor-pointer items-center gap-2 rounded-3xl border px-6 py-4 font-bold text-nowrap transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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

            <button
                type="button"
                onclick={() => (showFilters = !showFilters)}
                class="border-tertiary text-tertiary relative inline-flex cursor-pointer items-center gap-2 rounded-3xl border px-6 py-4 font-bold text-nowrap"
            >
                <span class="relative">
                    <FiltersIcon />
                    {#if selectedPaymentMethod || selectedChargeStatus || selectedRangeAmount || dateFrom || dateTo}
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
                    class="border-tertiary w-full rounded-lg border p-4"
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
                    class="border-tertiary w-full rounded-lg border p-4"
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
                    class="border-tertiary w-full rounded-lg border p-4"
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
                        class="border-tertiary w-full rounded-lg border p-4 pt-4"
                    />
                </div>

                <div class="relative">
                    <label for="dateTo" class="absolute top-0.5 left-4 text-[12px] text-gray-500">
                        {$t("contributions.filters.dateRange.endDate")}
                    </label>
                    <input
                        id="dateTo"
                        type="date"
                        class="border-tertiary w-full rounded-lg border p-4 pt-4"
                        bind:value={dateTo}
                        onclick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                    />
                </div>
            </div>

            <div class="col-span-3 flex justify-end">
                <button
                    type="submit"
                    class="bg-primary text-tertiary cursor-pointer rounded-3xl px-6 py-4 text-base font-bold"
                >
                    {$t("contributions.filters.btns.apply")}
                </button>
            </div>
        </form>
    {/if}
</div>
