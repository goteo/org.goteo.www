<script lang="ts">
    import ExportCsv from "./ExportCsv.svelte";
    import Filters from "./Filters.svelte";
    import FiltersTags from "./FiltersTags.svelte";
    import Slider from "./Slider.svelte";
    import UsersTable from "./UsersTable.svelte";
    import { t } from "../../i18n/store";
    import { withoutCache } from "../../openapi/cacheInterceptor";
    import { apiUsersGetCollection, type User } from "../../openapi/client/index.ts";
    import { toCollectionItems } from "../../utils/hydra";
    import {
        parseQueryFilters,
        splitOrderParams,
        syncQueryFiltersToUrl,
    } from "../../utils/queryParams";

    import type { UserRow } from "./UsersTable.svelte";
    import type { ApiUsersGetCollectionData } from "../../openapi/client/types.gen";

    type UsersQuery = Partial<NonNullable<ApiUsersGetCollectionData["query"]>>;

    const initialParams =
        typeof window !== "undefined"
            ? splitOrderParams(
                  parseQueryFilters(window.location.search, {
                      exclude: ["page", "itemsPerPage"],
                  }),
              )
            : { filters: {}, order: {} };

    let filters: UsersQuery = $state(initialParams.filters ?? {});
    let selectedSort = $state("handle-asc");
    let searchValue = $state(
        typeof initialParams.filters.handle === "string" ? initialParams.filters.handle : "",
    );

    let currentPage = $state(1);
    let itemsPerPage = $state(10);
    let totalItemsCount = $state(0);
    let userRows = $state<UserRow[]>([]);
    let isLoading = $state(false);
    let isFirstLoad = $state(true);

    let lastQueryKey = $state("");

    let userSlides = $derived([
        { title: $t("pages.admin.users.totalizers.selected"), amount: totalItemsCount },
    ]);

    const sortMap: Record<string, { field: "handle" | "email"; direction: "asc" | "desc" }> = {
        "handle-asc": { field: "handle", direction: "asc" },
        "handle-desc": { field: "handle", direction: "desc" },
        "email-asc": { field: "email", direction: "asc" },
        "email-desc": { field: "email", direction: "desc" },
    };

    const initialSortKey = Object.keys(sortMap).find(
        (key) => initialParams.order[sortMap[key].field] === sortMap[key].direction,
    );
    if (initialSortKey) selectedSort = initialSortKey;

    function buildUsersQuery(
        filters: UsersQuery,
        page: number,
        perPage: number,
        sort: string,
    ): UsersQuery {
        const query: UsersQuery = {
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

    async function loadUsers(bypassCache = false): Promise<void> {
        isLoading = true;

        async function fetchUsers() {
            const query = buildUsersQuery(filters, currentPage, itemsPerPage, selectedSort);

            return apiUsersGetCollection({
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
            } = await (bypassCache ? withoutCache(fetchUsers) : fetchUsers());

            if (error) {
                console.error("Failed to fetch users:", error);
                return;
            }

            const loadedUsers = toCollectionItems<User>(collection);
            totalItemsCount = getCollectionTotalItems(collection, response);

            userRows = loadedUsers.map((user): UserRow => {
                return {
                    id: user.id ?? 0,
                    handle: user.handle,
                    email: user.email,
                    displayName: user.displayName ?? "—",
                    type: user.type ?? "individual",
                    active: user.active ?? false,
                    roles: user.roles ?? [],
                    territory: user.territory?.country ?? "—",
                };
            });
        } finally {
            isLoading = false;
            isFirstLoad = false;
        }
    }

    function reloadUsers(bypassCache = false): void {
        const queryKey = JSON.stringify({ filters, selectedSort, itemsPerPage });
        if (queryKey !== lastQueryKey) {
            lastQueryKey = queryKey;
        }
        userRows = [];
        loadUsers(bypassCache);
    }

    $effect(() => {
        if (isFirstLoad) {
            reloadUsers();
        }
    });

    $effect(() => {
        const sortOption = sortMap[selectedSort];

        syncQueryFiltersToUrl(
            filters as Record<string, unknown>,
            sortOption ? { [sortOption.field]: sortOption.direction } : undefined,
        );
    });

    function handlePageChange(page: number): void {
        currentPage = page;
        reloadUsers();
    }

    function handleItemsPerPageChange(perPage: number): void {
        itemsPerPage = perPage;
        currentPage = 1;
        reloadUsers();
    }

    function handleSortChange(sort: string): void {
        selectedSort = sort;
        currentPage = 1;
        reloadUsers();
    }

    function handleSearch(value: string): void {
        searchValue = value;

        if (value.length >= 4 || value.length === 0) {
            if (value) {
                filters = { ...filters, handle: value };
                currentPage = 1;
                reloadUsers(true);
                return;
            } else {
                const { handle, ...rest } = filters;
                filters = rest;
            }
            currentPage = 1;
            reloadUsers();
        }
    }

    function handleApplyFilters(newFilters: UsersQuery): void {
        filters = { ...filters, ...newFilters };
        currentPage = 1;
        reloadUsers();
    }

    function handleCloseFilter(newFilters: any): void {
        filters = { ...newFilters };
        currentPage = 1;
        reloadUsers();
    }
</script>

<div class="flex flex-col gap-10">
    <Filters
        resource="users"
        {filters}
        onApplyFilters={handleApplyFilters}
        searchPlaceholder={$t("pages.admin.users.filters.search.placeholder")}
        onSelectUser={(u) => {
            filters = { ...filters, handle: u.handle };
            currentPage = 1;
            reloadUsers();
        }}
    />

    <div class="flex flex-col">
        <div class="mb-8 flex justify-between">
            <FiltersTags
                title={$t("pages.admin.users.lastUsers")}
                {filters}
                onCloseFilter={handleCloseFilter}
                resource="users"
            />
            <ExportCsv {filters} />
        </div>
        <Slider slides={userSlides} {isLoading} />
    </div>
</div>
<UsersTable
    users={userRows}
    {currentPage}
    totalItems={totalItemsCount}
    {itemsPerPage}
    bind:selectedSort
    {isLoading}
    {isFirstLoad}
    onPageChange={handlePageChange}
    onSortChange={handleSortChange}
    onItemsPerPageChange={handleItemsPerPageChange}
/>
