<!--
Category Filter Component
Interactive category selection using existing categories from utils/categories.ts
Implements active/inactive pill states matching Figma design
-->
<script lang="ts">
    import { t } from "../../i18n/store";
    import { apiCategoriesGetCollection, type Category } from "../../openapi/client";
    import CategorySelect, { type Option } from "../library/CategorySelect.svelte";

    interface Props {
        selectedCategories?: string[];
        onCategoryChange?: (categories: string[]) => void;
        showLabel?: boolean;
        "data-testid"?: string;
    }

    let { selectedCategories = [], onCategoryChange, showLabel = true }: Props = $props();

    let categories = getAvailableCategories();
    let selected = $state(
        selectedCategories.map((s) => {
            return { id: s, text: $t("categories." + s) };
        }),
    );

    async function getAvailableCategories(): Promise<Category[]> {
        const { data } = await apiCategoriesGetCollection();

        if (!data) {
            return [];
        }

        return data;
    }

    function mapCategoryToOption(category: Category): Option {
        return {
            id: category.id!,
            text: $t("categories." + category.id!),
        };
    }
</script>

<div class="w-full">
    {#if showLabel}
        <h3 class="mb-6 font-['Karla'] text-base font-bold text-[#3d3d3d]">
            {$t("search.categoryLabel")}
        </h3>
    {/if}

    {#await categories then categories}
        <CategorySelect
            bind:selected
            selectedIds={selected.map((s) => s.id)}
            options={categories.map((c) => mapCategoryToOption(c))}
            onchange={(selected) => onCategoryChange?.(selected.map((o) => `${o.id}`))}
        />
    {/await}

    {#if selected.length > 0}
        <div class="mt-4 text-sm text-[#3d3d3d] opacity-70">
            {$t("search.selectedCategories", { count: selected.length })}
        </div>
    {/if}
</div>
