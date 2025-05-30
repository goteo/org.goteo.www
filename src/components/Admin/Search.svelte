<script>
    import SearchIcon from "../../svgs/SearchIcon.svelte";
    import { t } from "../../i18n/store";
</script>

<form class="search-form flex w-full flex-row items-center gap-4">
    <div class="relative flex w-full">
        <input
            type="text"
            id="search"
            placeholder={$t("contributions.filters.search.placeholder")}
            class="border-tertiary w-full rounded-3xl border p-4"
        />
        <div class="absolute top-1/2 right-3 h-8 w-8 -translate-y-1/2">
            <SearchIcon width="32" height="32" />
        </div>
    </div>
    <button type="submit" class=" rounded-3xl bg-[#E6E5F7] px-6 py-4">
        {$t("contributions.filters.search.btnLabel")}</button
    >
</form>
