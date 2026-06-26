<script lang="ts" module>
    export type ProjectRow = {
        id: number;
        name: string;
        slug: string;
        promoter: string;
        contractNumber: string;
        achieved: string;
        paid: string;
        paidMatchfunding: string;
        status: string;
        process: string;
        datePublished: string;
        dateEnd1: string;
        dateEnd2: string;
        minOptim: string;
        contractExpiry: string;
        remaining: string;
        annotationsCount: number;
        annotations: string;
    };
</script>

<script lang="ts">
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";

    import Pagination from "./Pagination.svelte";
    import ProjectsDetailsRow from "./ProjectsDetailsRow.svelte";
    import ProjectsModalAnnotations from "./ProjectsModalAnnotations.svelte";
    import ProjectsModalPaid from "./ProjectsModalPaid.svelte";
    import { t } from "../../i18n/store";
    import Chevron from "../icons/Chevron.svelte";
    import Edit from "../icons/Edit.svelte";

    const tableHeaders = [
        "admin.projects.table.headers.name",
        "admin.projects.table.headers.promoter",
        "admin.projects.table.headers.contractNumber",
        "admin.projects.table.headers.achieved",
        "admin.projects.table.headers.paid",
        "admin.projects.table.headers.status",
        "admin.projects.table.headers.process",
        "",
    ];

    const processOptions = [
        { value: "", label: "—" },
        { value: "signed", label: $t("admin.projects.table.rows.process.signed") },
        {
            value: "sent_for_signature",
            label: $t("admin.projects.table.rows.process.sent_for_signature"),
        },
        { value: "form_closed", label: $t("admin.projects.table.rows.process.form_closed") },
        { value: "payments_made", label: $t("admin.projects.table.rows.process.payments_made") },
        {
            value: "contract_fulfilled",
            label: $t("admin.projects.table.rows.process.contract_fulfilled"),
        },
    ];

    let {
        projects = [],
        currentPage = 1,
        totalItems = 0,
        itemsPerPage = 10,
        selectedSort = $bindable("date-desc"),
        isLoading = false,
        isFirstLoad = false,
        onPageChange,
        onSortChange,
        onItemsPerPageChange,
        onProcessChange,
        onSavePaid,
        onSaveAnnotations,
    } = $props<{
        projects: ProjectRow[];
        currentPage: number;
        totalItems: number;
        itemsPerPage: number;
        selectedSort?: string;
        isLoading: boolean;
        isFirstLoad: boolean;
        onPageChange?: (page: number) => void;
        onSortChange?: (sort: string) => void;
        onItemsPerPageChange?: (perPage: number) => void;
        onProcessChange?: (projectId: number, process: string) => void;
        onSavePaid?: (projectId: number, paid: string, paidMatchfunding: string) => void;
        onSaveAnnotations?: (projectId: number, text: string) => void;
    }>();

    let openRow = $state<number | null>(null);
    let paidModalOpen = $state(false);
    let annotationsModalOpen = $state(false);
    let paidValue = $state("");
    let paidMatchfundingValue = $state("");
    let annotationText = $state("");
    let selectedProjectId = $state(0);

    const toggleRow = (i: number) => {
        openRow = openRow === i ? null : i;
    };

    function openPaidModal(project: ProjectRow, e: MouseEvent) {
        e.stopPropagation();
        selectedProjectId = project.id;
        paidValue = project.paid !== "—" ? project.paid : "";
        paidMatchfundingValue = project.paidMatchfunding !== "—" ? project.paidMatchfunding : "";
        paidModalOpen = true;
    }

    function openAnnotationsModal(project: ProjectRow, e: MouseEvent) {
        e.stopPropagation();
        selectedProjectId = project.id;
        annotationText = project.annotations;
        annotationsModalOpen = true;
    }

    function handleProcessChange(project: ProjectRow, newProcess: string) {
        onProcessChange?.(project.id, newProcess);
    }

    function handleSavePaid() {
        onSavePaid?.(selectedProjectId, paidValue, paidMatchfundingValue);
        paidModalOpen = false;
    }

    function handleSaveAnnotations() {
        onSaveAnnotations?.(selectedProjectId, annotationText);
        annotationsModalOpen = false;
    }

    function normalizeStatus(status: string): string {
        return status.replace(/\./g, "_");
    }

    function getStatusVariant(status: string): string {
        if (status === "funding_paid") return "border-green-600 text-green-600";
        if (status.includes("rejected") || status.includes("failed"))
            return "border-red-600 text-red-600";
        if (status.includes("review")) return "border-yellow-600 text-yellow-600";
        if (status.includes("campaign") || status.includes("funding"))
            return "border-secondary text-secondary";
        return "border-black text-black";
    }
</script>

<div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
        <div class="flex justify-between">
            <div class="flex flex-row items-center gap-2">
                <p class="text-content font-bold">{$t("admin.projects.filters.order.title")}</p>
                <select
                    class="border-secondary text-secondary min-w-50 rounded-sm py-1"
                    value={selectedSort}
                    onchange={(e) => onSortChange?.(e.currentTarget.value)}
                >
                    {#each Object.entries($t("admin.projects.filters.order.options")) as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>
            </div>
            <div class="flex flex-row items-center gap-2">
                <p class="text-content font-bold">
                    {$t("admin.projects.filters.itemsPerPage.title")}
                </p>
                <select
                    class="border-secondary text-secondary rounded-sm py-1"
                    value={itemsPerPage}
                    onchange={(e) => onItemsPerPageChange?.(Number(e.currentTarget.value))}
                >
                    {#each Object.entries($t("admin.projects.filters.itemsPerPage.options")) as [value, label]}
                        <option value={Number(value)}>{label}</option>
                    {/each}
                </select>
            </div>
        </div>

        <Table class="w-full border-separate border-spacing-y-2">
            <TableHead>
                {#each tableHeaders as header}
                    <TableHeadCell
                        class="bg-black p-4 text-base whitespace-nowrap text-white first:rounded-l-lg last:rounded-r-lg"
                    >
                        <span class="normal-case">{$t(header)}</span>
                    </TableHeadCell>
                {/each}
            </TableHead>

            <TableBody class="text-base">
                {#if isFirstLoad}
                    <TableBodyRow>
                        <TableBodyCell colspan={tableHeaders.length}>
                            <div class="flex justify-center py-6">
                                <span class="text-content">{$t("system.loading")}</span>
                            </div>
                        </TableBodyCell>
                    </TableBodyRow>
                {:else if projects.length === 0 && !isLoading}
                    <TableBodyRow>
                        <TableBodyCell colspan={tableHeaders.length} class="text-center">
                            {$t("admin.projects.table.rows.noData") ?? "—"}
                        </TableBodyCell>
                    </TableBodyRow>
                {:else}
                    {#each projects as project, i}
                        <TableBodyRow
                            onclick={() => toggleRow(i)}
                            class="{openRow === i
                                ? 'bg-purple-soft'
                                : 'bg-[#ffffff]'} border-variant1 hover:bg-purple-soft text-content cursor-pointer border transition-colors"
                        >
                            <TableBodyCell
                                class="border-variant1 max-w-60 rounded-l-md border-t border-b border-l p-4"
                            >
                                <p class="truncate font-medium text-black">{project.name}</p>
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4 text-sm">
                                {project.promoter}
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4 text-sm">
                                {project.contractNumber}
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4">
                                {project.achieved}
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4">
                                <div class="flex items-center gap-2">
                                    <span>{project.paid}</span>
                                    <button
                                        onclick={(e) => openPaidModal(project, e)}
                                        class="text-secondary hover:text-secondary/70 cursor-pointer"
                                        aria-label={$t("admin.projects.table.headers.paid")}
                                    >
                                        <Edit width="14" height="14" />
                                    </button>
                                </div>
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4">
                                <span
                                    class="rounded border px-3 py-1 text-sm font-medium {getStatusVariant(
                                        project.status,
                                    )}"
                                >
                                    {$t(
                                        `admin.projects.table.rows.status.${normalizeStatus(project.status)}`,
                                    )}
                                </span>
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4">
                                <div onclick={(e) => e.stopPropagation()} role="presentation">
                                    <select
                                        class="border-secondary text-secondary rounded-sm border py-1 text-sm"
                                        value={project.process}
                                        onchange={(e) =>
                                            handleProcessChange(project, e.currentTarget.value)}
                                    >
                                        {#each processOptions as opt}
                                            <option value={opt.value}>{opt.label}</option>
                                        {/each}
                                    </select>
                                </div>
                            </TableBodyCell>
                            <TableBodyCell
                                class="border-variant1 rounded-r-md border-t border-r border-b p-4"
                            >
                                <Chevron
                                    direction={openRow === i ? "up" : "down"}
                                    width="24"
                                    height="24"
                                    class="text-black transition-transform"
                                />
                            </TableBodyCell>
                        </TableBodyRow>

                        {#if openRow === i}
                            <TableBodyRow>
                                <TableBodyCell
                                    colspan={tableHeaders.length}
                                    class="border-variant1 bg-purple-soft rounded-lg border p-0 shadow-[0px_1px_3px_0px_#0000001A]"
                                >
                                    <ProjectsDetailsRow
                                        {project}
                                        onOpenAnnotationsModal={() =>
                                            openAnnotationsModal(project, new MouseEvent("click"))}
                                    />
                                </TableBodyCell>
                            </TableBodyRow>
                        {/if}
                    {/each}

                    {#if isLoading}
                        <TableBodyRow>
                            <TableBodyCell colspan={tableHeaders.length}>
                                <div class="flex justify-center py-4">
                                    <span class="text-content">{$t("system.loading")}</span>
                                </div>
                            </TableBodyCell>
                        </TableBodyRow>
                    {/if}
                {/if}
            </TableBody>
        </Table>

        <Pagination
            {currentPage}
            {totalItems}
            {itemsPerPage}
            onPageChange={(p) => onPageChange?.(p)}
        />
    </div>
</div>

<ProjectsModalPaid
    bind:open={paidModalOpen}
    bind:paidValue
    bind:paidMatchfundingValue
    onsave={handleSavePaid}
/>
<ProjectsModalAnnotations
    bind:open={annotationsModalOpen}
    bind:annotationText
    onsave={handleSaveAnnotations}
/>
