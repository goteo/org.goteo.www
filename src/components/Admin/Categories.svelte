<script lang="ts">
    import { onMount } from "svelte";
    import Category from "../library/Category.svelte";
    import { formatCurrency } from "../../utils/currencies";
    import { locale } from "../../i18n/store";

    let categories: { title: string; value: string }[] = $state([]);

    onMount(async () => {
        // Fetch categories from an API or state management
        categories = [
            { title: "—:", value: "42" },
            { title: "—:", value: "27" },
            { title: "—:", value: "15000000" },
            { title: "—:", value: "8" },
        ];
    });
</script>

<div class="flex flex-wrap gap-[8px]">
    {#each categories as category}
        <Category
            class="text-secondary hover:inset-ring-secondary hover:bg-white hover:inset-ring-1"
        >
            {category.title}
            {formatCurrency(Number(category.value), $locale)}
        </Category>
    {/each}
</div>
