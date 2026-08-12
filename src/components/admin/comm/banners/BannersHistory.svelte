<script lang="ts">
    import { Modal, TableBodyCell } from "flowbite-svelte";

    import { locale, t } from "../../../../i18n/store";
    import { formatDate } from "../../../../utils/dates";
    import HomeBanner from "../../../home/HomeBanner.svelte";
    import Chevron from "../../../icons/navigation/Chevron.svelte";
    import Title from "../../../library/typography/Title.svelte";
    import DataTable from "../../DataTable.svelte";

    import type { BannerRecord } from "../../../../repositories/banner";
    import type { DataTableHeader } from "../../DataTable.svelte";

    interface Props {
        rows: BannerRecord[];
    }

    let { rows }: Props = $props();

    const headers: DataTableHeader[] = [
        { key: "pages.admin.comm.banners.history.headers.title", sortable: false },
        { key: "pages.admin.comm.banners.history.headers.content", sortable: false },
        {
            key: "pages.admin.comm.banners.history.headers.publishedAt",
            sortable: false,
        },
        { key: "pages.admin.comm.banners.history.headers.endAt", sortable: false },
        { key: "", sortable: false, class: "w-25" },
    ];

    const itemsPerPage = 10;
    let currentPage = $state(1);

    const paginatedRows = $derived(
        rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    );

    let isLoading = $state(false);
    let isModalOpen = $state(false);
    let selectedRow = $state<BannerRecord | null>(null);

    function openModal(row: BannerRecord) {
        selectedRow = row;
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        selectedRow = null;
    }
</script>

<div class="flex flex-col gap-4">
    <Title level={3} variant="subsection">
        {$t("pages.admin.comm.banners.history.title")}
    </Title>
    <p class="text-content">{$t("pages.admin.comm.banners.history.description")}</p>
</div>

<DataTable
    {headers}
    rows={paginatedRows}
    {isLoading}
    emptyMessage="pages.admin.comm.banners.history.noData"
    {currentPage}
    totalItems={rows.length}
    {itemsPerPage}
    paginationPrefix="common.pagination"
    onPageChange={(page) => (currentPage = page)}
>
    {#snippet children(row)}
        <TableBodyCell
            class="border-variant1 max-w-80 truncate rounded-l-md border-t border-b border-l p-4"
        >
            {row.title}
        </TableBodyCell>
        <TableBodyCell class="border-variant1 truncate border-t border-b p-4">
            {row.content}
        </TableBodyCell>
        <TableBodyCell class="border-variant1 border-t border-b p-4">
            {formatDate(row.startsAt, $locale)}
        </TableBodyCell>
        <TableBodyCell class="border-variant1 border-t border-b p-4">
            {formatDate(row.endsAt, $locale)}
        </TableBodyCell>
        <TableBodyCell class="border-variant1 w-25 rounded-r-md border-t border-r border-b p-4">
            <button class="flex cursor-pointer items-center gap-2" onclick={() => openModal(row)}>
                <span class="text-secondary self-center text-center underline">
                    {$t("pages.admin.comm.banners.history.actions.view")}
                </span>
                <Chevron direction="right" class="size-4" />
            </button>
        </TableBodyCell>
    {/snippet}
</DataTable>

<Modal
    open={isModalOpen}
    onclose={closeModal}
    size="lg"
    class="flex w-full max-w-224.5 flex-col gap-6 rounded-3xl bg-white p-6 shadow-lg"
    closeBtnClass="absolute top-4 right-4 text-secondary cursor-pointer hover:scale-110 transition-transform duration-200 hover:bg-transparent"
    headerClass="md:p-0 p-0 border-b-0"
    bodyClass="md:p-0 p-0 border-b-0"
>
    {#snippet header()}
        {#if selectedRow}
            <div class="flex flex-col justify-start gap-4">
                <Title level={2} variant="subsection">
                    {$t("pages.admin.comm.banners.history.modal.title", {
                        date: formatDate(selectedRow.dateCreated, $locale),
                    })}
                </Title>
                <p class="text-content text-base font-normal">
                    {$t("pages.admin.comm.banners.history.modal.description")}
                </p>
            </div>
        {/if}
    {/snippet}
    {#if selectedRow}
        <HomeBanner
            title={selectedRow.title}
            description={selectedRow.content}
            ctaText={selectedRow.ctaText}
            ctaLink={selectedRow.ctaLink}
            closeAriaLabel={$t("pages.home.banner.closeAriaLabel")}
        />
    {/if}
</Modal>
