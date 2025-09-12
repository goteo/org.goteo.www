<script lang="ts">
    import { categories } from "../../utils/categories";
    import SearchIcon from "../../svgs/SearchIcon.svelte";
    import { t } from "../../i18n/store";

    let showCategoryMenu = $state(false);

    function toggleCategoryMenu() {
        console.log("Button clicked! Current state:", showCategoryMenu);
        showCategoryMenu = !showCategoryMenu;
        console.log("New state:", showCategoryMenu);
    }

    function closeCategoryMenu() {
        showCategoryMenu = false;
    }
</script>

<nav>
    <!-- Mobile Layout -->
    <div class="flex w-full max-w-screen items-center gap-4 px-4 py-4 md:hidden">
        <!-- Search Bar -->
        <div class="relative flex-1">
            <input
                type="search"
                placeholder={$t("navigation.search.placeholder")}
                class="placeholder:text-tertiary w-full rounded-full border-none bg-[#E6E5F7] p-3 pl-12 text-sm placeholder:font-bold focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <div class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-gray-500">
                <SearchIcon />
            </div>
        </div>

        <!-- Categories Button (Mobile Only) -->
        <div class="relative">
            <button
                class="text-tertiary rounded-full border border-black bg-white px-6 py-3 text-sm font-bold whitespace-nowrap transition-colors hover:bg-gray-50"
                onclick={toggleCategoryMenu}
            >
                {$t("navigation.categories")}
            </button>

            <!-- Categories Dropdown Menu -->
            {#if showCategoryMenu}
                <div
                    class="absolute top-full right-0 z-50 mt-2 max-h-64 w-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                    <div class="p-2">
                        {#each categories as category}
                            <button
                                class="text-tertiary w-full rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
                                onclick={closeCategoryMenu}
                            >
                                {$t(category.translationKey)}
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Desktop Layout -->
    <div class="hidden justify-between gap-6 overflow-x-auto px-10 py-6 md:flex">
        <div class="relative">
            <input
                type="search"
                placeholder={$t("navigation.search.placeholder")}
                class="placeholder:text-tertiary w-full rounded-full border-none bg-[#E6E5F7] p-3 pl-12 placeholder:font-bold focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <div class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-500">
                <SearchIcon />
            </div>
        </div>
        <div class="relative min-w-52"></div>

        <!-- Horizontal Categories (Desktop Only) -->
        {#each categories as category}
            <button class="text-tertiary font-bold">{$t(category.translationKey)}</button>
        {/each}
    </div>
</nav>

<!-- Overlay to close menu when clicking outside -->
{#if showCategoryMenu}
    <div
        class="fixed inset-0 z-40"
        role="button"
        tabindex="-1"
        onclick={closeCategoryMenu}
        onkeydown={(e) => e.key === "Escape" && closeCategoryMenu()}
    ></div>
{/if}
