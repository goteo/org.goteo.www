<!--
Category Filter Component
Interactive category selection using existing categories from utils/categories.ts
Implements active/inactive pill states matching Figma design
-->
<script lang="ts">
    import { onMount } from "svelte";

    import { t } from "../../i18n/store";
    import {
        apiCategoriesGetCollection,
        type Category as OpenAPICategory,
    } from "../../openapi/client";

    interface Category extends OpenAPICategory {
        id: string;
        name: string;
    }

    interface Props {
        selectedCategories?: string[];
        onCategoryChange?: (categories: string[]) => void;
        "data-testid"?: string;
    }

    let { selectedCategories = [], onCategoryChange, "data-testid": testId }: Props = $props();

    let categories = $state<Category[]>([]);
    let isLoading = $state(true);

    onMount(async () => {
        try {
            const response = await apiCategoriesGetCollection();

            const responseData = response as any;
            const rawData = responseData.data || responseData["hydra:member"] || responseData;

            if (Array.isArray(rawData)) {
                categories = rawData.map((cat: any) => ({
                    ...cat,
                    id: String(cat.id),
                    name: cat.name || cat.title || "Category",
                }));
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            isLoading = false;
        }
    });

    function toggleCategory(categoryId: string) {
        const newSelection = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId];

        if (onCategoryChange) {
            onCategoryChange(newSelection);
        }
    }
</script>

<div class="flex flex-col gap-4" data-testid={testId}>
    <h3 class="text-sm font-bold tracking-wider text-gray-500 uppercase">
        {$t("search.categoryLabel")}
    </h3>

    {#if isLoading}
        <div class="flex flex-wrap gap-2">
            {#each Array(6) as _}
                <div class="h-10 w-24 animate-pulse rounded-full bg-gray-100"></div>
            {/each}
        </div>
    {:else if categories.length > 0}
        <div class="flex flex-wrap gap-2">
            {#each categories as category}
                {@const isSelected = selectedCategories.includes(category.id)}
                <button
                    type="button"
                    onclick={() => toggleCategory(category.id)}
                    class="rounded-full border px-4 py-2 text-sm font-medium transition-all {isSelected
                        ? 'border-purple-800 bg-purple-800 text-white shadow-sm'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-purple-400 hover:text-purple-600'}"
                >
                    {category.name}
                </button>
            {/each}
        </div>
    {:else}
        <p class="text-sm text-gray-400 italic">
            {$t("domain.search.categories.without")}
        </p>
    {/if}
</div>
