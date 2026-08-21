<script lang="ts">
    import ProjectsModalAnnotations from "./ProjectsModalAnnotations.svelte";
    import ProjectsModalPaid from "./ProjectsModalPaid.svelte";
    import ProjectsTable, { type ProjectRow, type ProjectSortKey } from "./ProjectsTable.svelte";
    import { t } from "../../../i18n/store";
    import { withoutCache } from "../../../openapi/cacheInterceptor";
    import {
        apiProjectsGetCollection,
        apiProjectsIdPatch,
        apiAccountingsIdGet,
        apiUsersIdOrHandleGet,
        type Project,
        type Accounting,
        type User,
    } from "../../../openapi/client/index.ts";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/operation-paths.gen.ts";
    import { useAdminTableState } from "../../../utils/adminTableState.svelte";
    import { formatCurrency } from "../../../utils/currencies";
    import { extractId } from "../../../utils/extractId";
    import { toCollectionItems } from "../../../utils/hydra";
    import {
        parseQueryFilters,
        splitOrderParams,
        syncQueryFiltersToUrl,
    } from "../../../utils/queryParams";
    import Dashboard from "../AdminDashboard.svelte";

    import type { ApiProjectsGetCollectionData } from "../../../openapi/client/types.gen";

    type ProjectsQuery = Partial<ApiProjectsGetCollectionData["query"]>;

    const initialParams =
        typeof window !== "undefined"
            ? splitOrderParams(
                  parseQueryFilters(window.location.search, {
                      exclude: ["page", "itemsPerPage"],
                  }),
              )
            : { filters: {}, order: {} };

    const sortFieldMap: Record<
        ProjectSortKey,
        { field: "dateCreated" | "dateUpdated"; direction: "asc" | "desc" }
    > = {
        "date-desc": { field: "dateCreated", direction: "desc" },
        "date-asc": { field: "dateCreated", direction: "asc" },
    };

    const initialSort = ((Object.keys(sortFieldMap) as ProjectSortKey[]).find(
        (key) => initialParams.order[sortFieldMap[key].field] === sortFieldMap[key].direction,
    ) ?? "date-desc") as ProjectSortKey;

    const table = useAdminTableState<ProjectSortKey>(initialSort);

    let filters: ProjectsQuery = $state(initialParams.filters);
    let searchValue = $state(
        typeof initialParams.filters.title === "string" ? initialParams.filters.title : "",
    );

    let projectRows = $state<ProjectRow[]>([]);

    let accountingsCache = $state(new Map<string, Accounting>());
    let ownersCache = $state(new Map<string, User>());
    let lastQueryKey = $state("");

    let userEmailById = $derived.by(() => {
        const map = new Map<number, string>();
        for (const project of projectRows) {
            const owner = ownersCache.get(project.owner);
            if (owner?.email && project.id) {
                map.set(project.id, owner.email);
            }
        }
        return map;
    });
    let annotationsCache = $state(new Map<number, string>());
    let paidModalOpen = $state(false);
    let annotationsModalOpen = $state(false);
    let paidValue = $state("");
    let paidMatchfundingValue = $state("");
    let annotationText = $state("");
    let selectedProjectId = $state(0);

    let projectSlides = $derived([
        { title: $t("pages.admin.projects.totalizers.selected"), amount: table.totalItems },
        { title: $t("pages.admin.projects.totalizers.totalEarned"), amount: "—" },
        { title: $t("pages.admin.projects.totalizers.totalPaid"), amount: "—" },
        { title: $t("pages.admin.projects.totalizers.totalUnpaid"), amount: "—" },
    ]);

    function buildProjectsQuery(
        filters: ProjectsQuery,
        page: number,
        perPage: number,
        sort: ProjectSortKey,
    ): ProjectsQuery {
        const query: ProjectsQuery = {
            page,
            itemsPerPage: perPage,
            ...filters,
        };

        const sortOption = sortFieldMap[sort];
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

    async function loadProjects(bypassCache = false): Promise<void> {
        table.isLoading = true;

        async function fetchProjects() {
            const query = buildProjectsQuery(
                filters,
                table.currentPage,
                table.itemsPerPage,
                table.selectedSort,
            );

            return apiProjectsGetCollection({
                query,
                headers: {
                    Accept: "application/ld+json",
                    "Accept-Language": " ",
                },
            });
        }

        try {
            const {
                data: collection,
                response,
                error,
            } = await (bypassCache ? withoutCache(fetchProjects) : fetchProjects());

            if (error) {
                console.error("Failed to fetch projects:", error);
                return;
            }

            const loadedProjects = toCollectionItems<Project>(collection);
            table.totalItems = getCollectionTotalItems(collection, response);

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
                    datePublished: calendar?.release ?? "—",
                    dateEnd1: calendar?.minimum ?? "—",
                    dateEnd2: calendar?.optimum ?? "—",
                    minOptim: "—",
                    contractExpiry: "—",
                    remaining: "—",
                    annotationsCount: 0,
                    annotations: "",
                    accounting: project.accounting ?? "",
                    owner: project.owner ?? "",
                };
            });
        } finally {
            table.isLoading = false;
            table.isFirstLoad = false;
        }
    }

    function reloadProjects(bypassCache = false): void {
        const queryKey = JSON.stringify({
            filters,
            selectedSort: table.selectedSort,
            itemsPerPage: table.itemsPerPage,
        });
        if (queryKey !== lastQueryKey) {
            accountingsCache = new Map();
            ownersCache = new Map();
            lastQueryKey = queryKey;
        }
        projectRows = [];
        loadProjects(bypassCache);
    }

    $effect(() => {
        if (table.isFirstLoad) {
            reloadProjects();
        }
    });

    $effect(() => {
        const sortOption = sortFieldMap[table.selectedSort];

        syncQueryFiltersToUrl(
            (filters ?? {}) as Record<string, unknown>,
            sortOption ? { [sortOption.field]: sortOption.direction } : undefined,
        );
    });

    function handleSearch(value: string): void {
        if (value.length >= 4 || value.length === 0) {
            if (value) {
                filters = { ...filters, title: value };
                table.currentPage = 1;
                reloadProjects(true);
                return;
            } else {
                const { ...rest } = filters;
                filters = rest;
            }
            table.currentPage = 1;
            reloadProjects();
        }
    }

    async function handleApplyFilters(newFilters: ProjectsQuery): Promise<void> {
        filters = { ...filters, ...newFilters };
        table.currentPage = 1;
        reloadProjects();
    }

    function handleCloseFilter(newFilters: any): void {
        filters = { ...newFilters };
        table.currentPage = 1;
        reloadProjects();
    }

    async function handleStatusChange(projectId: number, status: string): Promise<void> {
        const { error } = await apiProjectsIdPatch({
            path: { id: String(projectId) },
            body: { status: status as any },
        });
        if (error) console.error("Failed to update project status:", error);
    }

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
        annotationText = annotationsCache.get(project.id) ?? project.annotations;
        annotationsModalOpen = true;
    }

    function handleSavePaid() {
        reloadProjects();
        paidModalOpen = false;
    }

    function handleSaveAnnotations() {
        annotationsCache = new Map(annotationsCache).set(selectedProjectId, annotationText);
        const project = projectRows.find((p) => p.id === selectedProjectId);
        if (project) {
            project.annotations = annotationText;
            project.annotationsCount = annotationText ? 1 : 0;
        }
        annotationsModalOpen = false;
    }
</script>

<Dashboard
    title={$t("pages.admin.projects.title")}
    description={$t("pages.admin.projects.description")}
    filters={{
        resource: "projects",
        filters: filters,
        onApplyFilters: handleApplyFilters,
        searchPlaceholder: $t("pages.admin.projects.filters.search.placeholder"),
        onSelectProject: (p: Project) => {
            filters = { ...filters, title: p.title };
            table.currentPage = 1;
            reloadProjects();
        },
    }}
    filterTags={{
        title: $t("pages.admin.projects.lastProjects"),
        filters: filters,
        onCloseFilter: handleCloseFilter,
        resource: "projects",
    }}
    csv={{
        endpoint: apiProjectsGetCollectionUrl,
        filenamePrefix: "projects",
        queryParams: filters,
        totalItems: table.totalItems,
    }}
    slider={{
        slides: projectSlides,
        isLoading: table.isLoading,
    }}
>
    <ProjectsTable
        projects={projectRows}
        currentPage={table.currentPage}
        itemsPerPage={table.itemsPerPage}
        selectedSort={table.selectedSort}
        totalItems={table.totalItems}
        isLoading={table.isLoading}
        {userEmailById}
        onPageChange={table.handlePageChange}
        onItemsPerPageChange={table.handleItemsPerPageChange}
        onSortChange={table.handleSortChange}
        onStatusChange={handleStatusChange}
        onOpenPaidModal={openPaidModal}
        onOpenAnnotationsModal={openAnnotationsModal}
    />
</Dashboard>

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
