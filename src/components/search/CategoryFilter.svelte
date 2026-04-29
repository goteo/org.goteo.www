<!--
Category Filter Component
Interactive category selection using existing categories from utils/categories.ts
Implements active/inactive pill states matching Figma design
-->
<script lang="ts">
    
    import { t } from "../../i18n/store";
    import { apiCategoriesGetCollection } from "../../openapi/client";
    import Category from "../library/Category.svelte";
    

   interface Props {
        selectedCategories?: string[];
        onCategoryChange?: (categories: string[]) => void;
        showLabel?: boolean;
        "data-testid"?: string;
    }

    let { 
        selectedCategories = [], 
        onCategoryChange, 
        showLabel = true, 
        "data-testid": testId 
    }: Props = $props();

    const categoriesPromise = apiCategoriesGetCollection();

      function toggleCategory(categoryId: string) {
        const idStr = String(categoryId);
        const newSelection = selectedCategories.includes(idStr)
            ? selectedCategories.filter((id) => id !== idStr)
            : [...selectedCategories, idStr];

        onCategoryChange?.(newSelection);
    }    
</script>

<div class="w-full" data-testid={testId}>
    {#if showLabel}
        <h3 class="mb-6 font-['Karla'] text-base font-bold text-Black">
            {$t("search.categoryLabel")}
        </h3>
    {/if}

    {#await categoriesPromise}
        <div class="flex flex-wrap gap-2">
            {#each Array(6) as _}
                <div class="h-10 w-24 animate-pulse rounded-full bg-gray-100"></div>
            {/each}
        </div>
    {:then { data, error }}
        {#if error}
        <p class="text-sm text-red-500">{$t("common.error.loading_categories")}</p>
    {:else if data && data.length > 0}
            <div class="flex flex-wrap gap-2">
                {#each data as category}
                    {@const isSelected = selectedCategories.includes(String(category.id))}
                    
                    <Category 
                        type={isSelected ? "active" : "default"} 
                        onclick={() => toggleCategory(String(category.id))}
                    >
                        {$t("categories." + category.id)}
                    </Category>
                {/each}
            </div>
        {:else}
            <p class="text-sm text-gray-400 italic">
                {$t("domain.search.categories.without")}
            </p>
        {/if}
    {/await}
</div>
