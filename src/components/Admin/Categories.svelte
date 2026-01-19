<script lang="ts">
    import Category from "../library/Category.svelte";
    import { formatCurrency } from "../../utils/currencies";
    import { locale } from "../../i18n/store";

    const { categories } = $props<{
        categories: { title: string; amount: number }[];
    }>();
</script>

<div class="flex flex-wrap gap-2">
    {#each categories as category}
        <Category
            class="text-secondary hover:inset-ring-secondary hover:bg-white hover:inset-ring-1"
        >
            {category.title}
            {formatCurrency(Number(category.amount), undefined, { locale: $locale })}
        </Category>
    {/each}
</div>
