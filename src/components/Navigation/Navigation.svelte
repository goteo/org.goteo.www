<script lang="ts">
    import { Button } from "bits-ui";
    import { categories } from "../../utils/categories";
    import SearchIcon from "../../svgs/SearchIcon.svelte";
    import { t } from "../../i18n/store";
</script>

<nav class="wrapper">
    <div class="mx-auto flex justify-between gap-6 overflow-x-auto px-10 py-6">
        <div class="relative">
            <input
                type="search"
                placeholder="Busca tu campaña"
                class="placeholder:text-tertiary w-full rounded-lg bg-[#E6E5F7] p-2 pl-10 placeholder:font-bold focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <SearchIcon />
        </div>
        <div class="relative min-w-52"></div>

        <!-- TODO: Change buttons to a slider -->
        {#each categories as category}
            <Button.Root class="text-tertiary font-bold">{$t(category.translationKey)}</Button.Root>
        {/each}
    </div>
</nav>
