<script lang="ts">
    import { t } from "../../i18n/store";
    import { apiCategoriesGetCollection } from "../../openapi/client";
    // local fallback for skeleton rendering to avoid importing missing module
    const categories: { id?: string; translationKey?: string }[] = [];
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
        "data-testid": testId,
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
        <h3 class="mb-6 font-['Karla'] text-base font-bold text-black">
            {$t("search.categoryLabel")}
        </h3>
    {/if}

    {#await categoriesPromise}
        <div class="flex flex-wrap gap-2">
            {#each categories as category}
                <Category skeleton>
                    {#if category.translationKey}
                        {$t(category.translationKey)}
                    {/if}
                </Category>
            {/each}
        </div>
    {:then response}
        {@const data = response?.data}
        {@const error = response?.error}

        {#if error}
            <p class="text-sm text-red-500">{$t("common.error.loading_categories")}</p>
        {:else if data && data.length > 0}
            <div class="flex flex-wrap gap-2">
                {#each data as category}
                    {@const categoryIdStr = String(category.id)}
                    {@const isSelected = selectedCategories.includes(categoryIdStr)}

                    <Category
                        type={isSelected ? "active" : "default"}
                        onclick={() => toggleCategory(categoryIdStr)}
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
