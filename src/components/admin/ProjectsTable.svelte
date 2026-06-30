<script lang="ts" module>
    export type ProjectRow = {
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
    import Chevron from "../icons/navigation/Chevron.svelte";
    import Edit from "../icons/actions/Edit.svelte";

    const tableHeaders = [
        "admin.projects.table.headers.name",
        "admin.projects.table.headers.promoter",
        "admin.projects.table.headers.contractNumber",
        "admin.projects.table.headers.achieved",
        "admin.projects.table.headers.paid",
        "admin.projects.table.headers.process",
        "",
    ];

    const projects: ProjectRow[] = [];

    const processOptions = [
        { value: "in_draft", label: $t("admin.projects.table.rows.status.in_draft") },
        {
            value: "to_campaign_review",
            label: $t("admin.projects.table.rows.status.to_campaign_review"),
        },
        {
            value: "in_campaign_review",
            label: $t("admin.projects.table.rows.status.in_campaign_review"),
        },
        {
            value: "in_campaign_review_request_change",
            label: $t("admin.projects.table.rows.status.in_campaign_review_request_change"),
        },
        {
            value: "campaign_review_rejected",
            label: $t("admin.projects.table.rows.status.campaign_review_rejected"),
        },
        { value: "to_campaign", label: $t("admin.projects.table.rows.status.to_campaign") },
        { value: "in_campaign", label: $t("admin.projects.table.rows.status.in_campaign") },
        {
            value: "campaign_failed",
            label: $t("admin.projects.table.rows.status.campaign_failed"),
        },
        {
            value: "to_funding_review",
            label: $t("admin.projects.table.rows.status.to_funding_review"),
        },
        {
            value: "in_funding_review",
            label: $t("admin.projects.table.rows.status.in_funding_review"),
        },
        {
            value: "in_funding_review_request_change",
            label: $t("admin.projects.table.rows.status.in_funding_review_request_change"),
        },
        {
            value: "funding_review_rejected",
            label: $t("admin.projects.table.rows.status.funding_review_rejected"),
        },
        { value: "to_funding", label: $t("admin.projects.table.rows.status.to_funding") },
        { value: "in_funding", label: $t("admin.projects.table.rows.status.in_funding") },
        { value: "funding_paid", label: $t("admin.projects.table.rows.status.funding_paid") },
    ];

    let currentPage = $state(1);
    let itemsPerPage = $state(10);
    let totalItems = $state(0);
    let openRow = $state<number | null>(null);
    let paidModalOpen = $state(false);
    let annotationsModalOpen = $state(false);
    let paidValue = $state("");
    let paidMatchfundingValue = $state("");
    let annotationText = $state("");

    const toggleRow = (i: number) => {
        openRow = openRow === i ? null : i;
    };

    function openPaidModal(project: ProjectRow, e: MouseEvent) {
        e.stopPropagation();
        paidValue = project.paid !== "—" ? project.paid : "";
        paidMatchfundingValue = project.paidMatchfunding !== "—" ? project.paidMatchfunding : "";
        paidModalOpen = true;
    }

    function openAnnotationsModal(project: ProjectRow, e: MouseEvent) {
        e.stopPropagation();
        annotationText = project.annotations;
        annotationsModalOpen = true;
    }
</script>

<div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
        <div class="flex justify-between">
            <div class="flex flex-row items-center gap-2">
                <p class="text-content font-bold">{$t("admin.projects.filters.order.title")}</p>
                <select class="border-secondary text-secondary min-w-50 rounded-sm py-1">
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
                    bind:value={itemsPerPage}
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
                {#each projects as project, i}
                    <TableBodyRow
                        onclick={() => toggleRow(i)}
                        class="{openRow === i
                            ? 'bg-purple-soft'
                            : 'bg-white'} border-variant1 hover:bg-purple-soft text-content cursor-pointer border transition-colors"
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
                            <div onclick={(e) => e.stopPropagation()} role="presentation">
                                <select
                                    class="border-secondary text-secondary rounded-sm border py-1 text-sm"
                                    value={project.process}
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
            </TableBody>
        </Table>

        <Pagination
            {currentPage}
            {totalItems}
            {itemsPerPage}
            onPageChange={(p) => (currentPage = p)}
        />
    </div>
</div>

<ProjectsModalPaid bind:open={paidModalOpen} bind:paidValue bind:paidMatchfundingValue />
<ProjectsModalAnnotations bind:open={annotationsModalOpen} bind:annotationText />
