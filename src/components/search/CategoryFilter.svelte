<!--
Category Filter Component
Interactive category selection using existing categories from utils/categories.ts
Implements active/inactive pill states matching Figma design
-->
<script lang="ts">
    import { t } from "../../i18n/store";
    import { categories } from "../../utils/categories";

    interface Props {
        selectedCategories?: string[];
        onCategoryChange?: (categories: string[]) => void;
        showLabel?: boolean;
        "data-testid"?: string;
    }

    let { selectedCategories = [], onCategoryChange, showLabel = true }: Props = $props();

    let selectedCats = $state([...selectedCategories]);

    // Keep local state in sync with prop changes (important for SSR hydration)
    $effect(() => {
        selectedCats = [...selectedCategories];
    });

    function toggleCategory(categoryId: string) {
        const index = selectedCats.indexOf(categoryId);

        if (index === -1) {
            // Add category
            selectedCats = [...selectedCats, categoryId];
        } else {
            // Remove category
            selectedCats = selectedCats.filter((id) => id !== categoryId);
        }

        onCategoryChange?.(selectedCats);
    }

    function handleKeydown(event: KeyboardEvent, categoryId: string) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleCategory(categoryId);
        }
    }
</script>

<div class="w-full">
    {#if showLabel}
        <h3 class="mb-6 font-['Karla'] text-base font-bold text-[#3d3d3d]">
            {$t("search.categoryLabel")}
        </h3>
    {/if}

    <div class="flex flex-wrap gap-4">
        {#each categories as category}
            {@const isSelected = selectedCats.includes(category.id)}
            <button
                type="button"
                class="inline-flex items-center rounded-full px-4 py-2 font-['Karla'] text-base font-bold transition-all duration-200 focus:ring-2 focus:ring-[#59e9d3] focus:ring-offset-2 focus:outline-none"
                class:bg-[#462949]={isSelected}
                class:text-[#59e9d3]={isSelected}
                class:border-[#462949]={!isSelected}
                class:border={!isSelected}
                class:text-[#462949]={!isSelected}
                class:bg-[#fbfbfb]={!isSelected}
                class:hover:bg-[#e6e5f7]={!isSelected}
                onclick={() => toggleCategory(category.id)}
                onkeydown={(e) => handleKeydown(e, category.id)}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? $t("search.deselectCategory") : $t("search.selectCategory")} ${$t(category.translationKey)}`}
                data-testid={`category-${category.id}`}
            >
                {$t(category.translationKey)}
            </button>
        {/each}
    </div>

    {#if selectedCats.length > 0}
        <div class="mt-4 text-sm text-[#3d3d3d] opacity-70">
            {$t("search.selectedCategories", { count: selectedCats.length })}
        </div>
    {/if}
</div>
