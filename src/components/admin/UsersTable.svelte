<script lang="ts" module>
    export type UserRow = {
        id: number;
        handle: string;
        email: string;
        displayName: string;
        type: string;
        active: boolean;
        roles: string[];
        territory: string;
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
    import { t } from "../../i18n/store";
    import Chevron from "../icons/navigation/Chevron.svelte";
    import Loader from "../library/feedback/Loader.svelte";

    const tableHeaders = [
        "pages.admin.users.table.headers.handle",
        "pages.admin.users.table.headers.email",
        "pages.admin.users.table.headers.displayName",
        "pages.admin.users.table.headers.type",
        "pages.admin.users.table.headers.active",
        "pages.admin.users.table.headers.roles",
        "",
    ];

    let {
        users = [],
        currentPage = 1,
        totalItems = 0,
        itemsPerPage = 10,
        selectedSort = $bindable("handle-asc"),
        isLoading = false,
        isFirstLoad = false,
        onPageChange,
        onSortChange,
        onItemsPerPageChange,
    } = $props<{
        users: UserRow[];
        currentPage: number;
        totalItems: number;
        itemsPerPage: number;
        selectedSort?: string;
        isLoading: boolean;
        isFirstLoad: boolean;
        onPageChange?: (page: number) => void;
        onSortChange?: (sort: string) => void;
        onItemsPerPageChange?: (perPage: number) => void;
    }>();

    let openRow = $state<number | null>(null);

    const toggleRow = (i: number) => {
        openRow = openRow === i ? null : i;
    };
</script>

<div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
        <div class="flex justify-between">
            <div class="flex flex-row items-center gap-2">
                <p class="text-content font-bold">
                    {$t("pages.admin.users.filters.order.title")}
                </p>
                <select
                    class="border-secondary text-secondary min-w-50 rounded-sm py-1"
                    value={selectedSort}
                    onchange={(e) => onSortChange?.(e.currentTarget.value)}
                >
                    {#each Object.entries($t("pages.admin.users.filters.order.options")) as [value, label]}
                        <option {value}>{label}</option>
                    {/each}
                </select>
            </div>
            <div class="flex flex-row items-center gap-2">
                <p class="text-content font-bold">
                    {$t("pages.admin.users.filters.itemsPerPage.title")}
                </p>
                <select
                    class="border-secondary text-secondary rounded-sm py-1"
                    value={itemsPerPage}
                    onchange={(e) => onItemsPerPageChange?.(Number(e.currentTarget.value))}
                >
                    {#each Object.entries($t("pages.admin.users.filters.itemsPerPage.options")) as [value, label]}
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
                                <Loader />
                            </div>
                        </TableBodyCell>
                    </TableBodyRow>
                {:else if users.length === 0 && !isLoading}
                    <TableBodyRow>
                        <TableBodyCell colspan={tableHeaders.length} class="text-center">
                            {$t("pages.admin.users.table.rows.noData") ?? "—"}
                        </TableBodyCell>
                    </TableBodyRow>
                {:else}
                    {#each users as user, i}
                        <TableBodyRow
                            onclick={() => toggleRow(i)}
                            class="{openRow === i
                                ? 'bg-purple-soft'
                                : 'bg-white'} border-variant1 hover:bg-purple-soft text-content cursor-pointer border transition-colors"
                        >
                            <TableBodyCell
                                class="border-variant1 max-w-60 rounded-l-md border-t border-b border-l p-4"
                            >
                                <p class="truncate font-medium text-black">{user.handle}</p>
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4 text-sm">
                                {user.email}
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4 text-sm">
                                {user.displayName}
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4 text-sm">
                                <span
                                    class="rounded-full px-3 py-1 text-xs font-medium"
                                    class:bg-purple-100={user.type === "individual"}
                                    class:text-purple-800={user.type === "individual"}
                                    class:bg-blue-100={user.type === "organization"}
                                    class:text-blue-800={user.type === "organization"}
                                >
                                    {$t(
                                        `pages.admin.users.table.rows.type.${user.type}`,
                                        { default: user.type },
                                    )}
                                </span>
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4 text-sm">
                                {#if user.active}
                                    <span
                                        class="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                                    >
                                        {$t("pages.admin.users.table.rows.active")}
                                    </span>
                                {:else}
                                    <span
                                        class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                                    >
                                        {$t("pages.admin.users.table.rows.inactive")}
                                    </span>
                                {/if}
                            </TableBodyCell>
                            <TableBodyCell class="border-variant1 border-t border-b p-4 text-sm">
                                <div class="flex flex-wrap gap-1">
                                    {#each user.roles as role}
                                        <span
                                            class="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700"
                                        >
                                            {role}
                                        </span>
                                    {/each}
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
                                    class="border-variant1 bg-purple-soft rounded-lg border p-6 shadow-[0px_1px_3px_0px_#0000001A]"
                                >
                                    <div class="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span class="font-bold text-black">
                                                {$t("pages.admin.users.table.rows.details.id")}:
                                            </span>
                                            <span class="text-content ml-2">{user.id}</span>
                                        </div>
                                        <div>
                                            <span class="font-bold text-black">
                                                {$t("pages.admin.users.table.rows.details.handle")}:
                                            </span>
                                            <span class="text-content ml-2">{user.handle}</span>
                                        </div>
                                        <div>
                                            <span class="font-bold text-black">
                                                {$t("pages.admin.users.table.rows.details.email")}:
                                            </span>
                                            <span class="text-content ml-2">{user.email}</span>
                                        </div>
                                        <div>
                                            <span class="font-bold text-black">
                                                {$t("pages.admin.users.table.rows.details.type")}:
                                            </span>
                                            <span class="text-content ml-2">
                                                {$t(
                                                    `pages.admin.users.table.rows.type.${user.type}`,
                                                    { default: user.type },
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span class="font-bold text-black">
                                                {$t("pages.admin.users.table.rows.details.territory")}:
                                            </span>
                                            <span class="text-content ml-2">{user.territory}</span>
                                        </div>
                                        <div>
                                            <span class="font-bold text-black">
                                                {$t("pages.admin.users.table.rows.details.active")}:
                                            </span>
                                            <span class="text-content ml-2">
                                                {user.active
                                                    ? $t("pages.admin.users.table.rows.active")
                                                    : $t("pages.admin.users.table.rows.inactive")}
                                            </span>
                                        </div>
                                    </div>
                                </TableBodyCell>
                            </TableBodyRow>
                        {/if}
                    {/each}

                    {#if isLoading}
                        <TableBodyRow>
                            <TableBodyCell colspan={tableHeaders.length}>
                                <div class="flex justify-center py-4">
                                    <Loader />
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
