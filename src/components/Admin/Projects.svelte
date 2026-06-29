<script lang="ts">
    import FiltersTags from "./FiltersTags.svelte";
    import ProjectsExportCsv from "./ProjectsExportCsv.svelte";
    import ProjectsFilters from "./ProjectsFilters.svelte";
    import ProjectsTable from "./ProjectsTable.svelte";
    import type { ProjectRow } from "./ProjectsTable.svelte";
    import Slider from "./Slider.svelte";
    import { t } from "../../i18n/store";
    import {
        apiProjectsGetCollection,
        apiProjectsIdPatch,
        apiAccountingsIdGet,
        apiUsersIdOrHandleGet,
        type Project,
        type Accounting,
        type User,
    } from "../../openapi/client/index.ts";
    import { toCollectionItems } from "../../utils/hydra";
    import { extractId } from "../../utils/extractId";
    import { formatCurrency } from "../../utils/currencies";

    let filters: Record<string, unknown> = $state({});
    let selectedSort = $state("date-desc");
    let searchValue = $state("");

    let currentPage = $state(1);
    let itemsPerPage = $state(10);
    let totalItemsCount = $state(0);
    let projectRows = $state<ProjectRow[]>([]);
    let isLoading = $state(false);
    let isFirstLoad = $state(true);

    let accountingsCache = $state(new Map<string, Accounting>());
    let ownersCache = $state(new Map<string, User>());
    let lastQueryKey = $state("");

    let projectSlides = $derived([
        { title: $t("admin.projects.totalizers.selected"), amount: totalItemsCount },
        { title: $t("admin.projects.totalizers.totalEarned"), amount: "—" },
        { title: $t("admin.projects.totalizers.totalPaid"), amount: "—" },
        { title: $t("admin.projects.totalizers.totalUnpaid"), amount: "—" },
    ]);

    const sortMap: Record<string, { field: string; direction: "asc" | "desc" }> = {
        "date-desc": { field: "dateCreated", direction: "desc" },
        "date-asc": { field: "dateCreated", direction: "asc" },
        "title-asc": { field: "title", direction: "asc" },
        "title-desc": { field: "title", direction: "desc" },
    };

    function buildProjectsQuery(
        filters: Record<string, unknown>,
        page: number,
        perPage: number,
        sort: string,
    ): Record<string, unknown> {
        const query: Record<string, unknown> = {
            page,
            itemsPerPage: perPage,
            ...filters,
        };

        const sortOption = sortMap[sort];
        if (sortOption) {
            query[`order[${sortOption.field}]`] = sortOption.direction;
        }

        return query;
    }

    function getCollectionTotalItems(collection: unknown, response?: Response): number {
        if (Array.isArray(collection)) {
            const headerTotal =
                response?.headers.get("X-Total-Items") ??
                response?.headers.get("Content-Range")?.split("/")[1];
            if (headerTotal) return Number(headerTotal);
            return collection.length;
        }
        if (!collection || typeof collection !== "object") return 0;
        const record = collection as Record<string, unknown>;
        const total = record.totalItems ?? record["hydra:totalItems"];
        return typeof total === "number"
            ? total
            : ((record["hydra:member"] as unknown[])?.length ?? 0);
    }

    async function loadProjects(): Promise<void> {
        isLoading = true;

        try {
            const query = buildProjectsQuery(filters, currentPage, itemsPerPage, selectedSort);

            const {
                data: collection,
                response,
                error,
            } = await apiProjectsGetCollection({
                query,
                headers: { Accept: "application/ld+json" },
            });

            if (error) {
                console.error("Failed to fetch projects:", error);
                return;
            }

            const loadedProjects = toCollectionItems<Project>(collection);
            totalItemsCount = getCollectionTotalItems(collection, response);

            const uniqueAccountingIris = [
                ...new Set(loadedProjects.map((p) => p.accounting).filter(Boolean)),
            ] as string[];
            const uniqueOwnerIris = [
                ...new Set(loadedProjects.map((p) => p.owner).filter(Boolean)),
            ] as string[];

            const missingAccountingIris = uniqueAccountingIris.filter(
                (iri) => !accountingsCache.has(iri),
            );
            const missingOwnerIris = uniqueOwnerIris.filter((iri) => !ownersCache.has(iri));

            const [accountingResults, ownerResults] = await Promise.all([
                Promise.all(
                    missingAccountingIris.map(async (iri) => {
                        const accId = extractId(iri);
                        if (!accId) return null;
                        const { data } = await apiAccountingsIdGet({ path: { id: accId } });
                        return data ? ([iri, data] as const) : null;
                    }),
                ),
                Promise.all(
                    missingOwnerIris.map(async (iri) => {
                        const ownerId = extractId(iri);
                        if (!ownerId) return null;
                        const { data } = await apiUsersIdOrHandleGet({
                            path: { idOrHandle: ownerId },
                        });
                        return data ? ([iri, data] as const) : null;
                    }),
                ),
            ]);

            for (const [iri, accounting] of accountingResults.filter(Boolean) as [
                string,
                Accounting,
            ][]) {
                accountingsCache.set(iri, accounting);
            }
            for (const [iri, owner] of ownerResults.filter(Boolean) as [string, User][]) {
                ownersCache.set(iri, owner);
            }

            projectRows = loadedProjects.map((project): ProjectRow => {
                const accounting = project.accounting
                    ? accountingsCache.get(project.accounting)
                    : undefined;
                const owner = project.owner ? ownersCache.get(project.owner) : undefined;
                const balance = accounting?.balance;
                const calendar = project.calendar;

                return {
                    id: project.id ?? 0,
                    name: project.title,
                    slug: project.slug ?? "",
                    promoter: owner?.displayName ?? owner?.email ?? "—",
                    contractNumber: "—",
                    achieved: balance ? formatCurrency(balance.amount, balance.currency) : "—",
                    paid: "—",
                    paidMatchfunding: "—",
                    status: project.status ?? "",
                    process: "",
                    datePublished: calendar?.release ?? "—",
                    dateEnd1: calendar?.minimum ?? "—",
                    dateEnd2: calendar?.optimum ?? "—",
                    minOptim: "—",
                    contractExpiry: "—",
                    remaining: "—",
                    annotationsCount: 0,
                    annotations: "",
                    accounting: project.accounting ?? "",
                };
            });
        } finally {
            isLoading = false;
            isFirstLoad = false;
        }
    }

    function reloadProjects(): void {
        const queryKey = JSON.stringify({ filters, selectedSort, itemsPerPage });
        if (queryKey !== lastQueryKey) {
            accountingsCache = new Map();
            ownersCache = new Map();
            lastQueryKey = queryKey;
        }
        projectRows = [];
        loadProjects();
    }

    $effect(() => {
        if (isFirstLoad) {
            reloadProjects();
        }
    });

    function handlePageChange(page: number): void {
        currentPage = page;
        reloadProjects();
    }

    function handleItemsPerPageChange(perPage: number): void {
        itemsPerPage = perPage;
        currentPage = 1;
        reloadProjects();
    }

    function handleSortChange(sort: string): void {
        selectedSort = sort;
        currentPage = 1;
        reloadProjects();
    }

    function handleSearch(value: string): void {
        searchValue = value;

        if (value.length >= 4 || value.length === 0) {
            if (value) {
                filters = { ...filters, title: value };
            } else {
                const { title: _, ...rest } = filters;
                filters = rest;
            }
            currentPage = 1;
            reloadProjects();
        }
    }

    function handleApplyFilters(newFilters: Record<string, unknown>): void {
        filters = { ...filters, ...newFilters };
        currentPage = 1;
        reloadProjects();
    }

    function handleCloseFilter(newFilters: Record<string, unknown>): void {
        filters = { ...newFilters };
        currentPage = 1;
        reloadProjects();
    }

    async function handleProcessChange(projectId: number, process: string): Promise<void> {
        const { error } = await apiProjectsIdPatch({
            path: { id: String(projectId) },
            body: { status: process as any },
        });
        if (error) console.error("Failed to update project process:", error);
    }

    async function handleSavePaid(
        _projectId: number,
        _paidValue: string,
        _paidMatchfundingValue: string,
    ): Promise<void> {
        reloadProjects();
    }

    async function handleSaveAnnotations(_projectId: number, _text: string): Promise<void> {
        reloadProjects();
    }
</script>

<div class="flex flex-col gap-10">
    <ProjectsFilters onSearch={handleSearch} onApplyFilters={handleApplyFilters} />

    <div class="flex flex-col">
        <div class="mb-8 flex justify-between">
            <FiltersTags
                title={$t("admin.projects.lastProjects")}
                {filters}
                onCloseFilter={handleCloseFilter}
            />
            <ProjectsExportCsv />
        </div>
        <Slider slides={projectSlides} isLoading={isLoading} />
    </div>
</div>
<ProjectsTable
    projects={projectRows}
    {currentPage}
    totalItems={totalItemsCount}
    {itemsPerPage}
    bind:selectedSort
    {isLoading}
    {isFirstLoad}
    onPageChange={handlePageChange}
    onSortChange={handleSortChange}
    onItemsPerPageChange={handleItemsPerPageChange}
    onProcessChange={handleProcessChange}
    onSavePaid={handleSavePaid}
    onSaveAnnotations={handleSaveAnnotations}
/>
