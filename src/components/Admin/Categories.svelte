<script lang="ts">
    import { onMount } from "svelte";
    import Category from "../library/Category.svelte";
    import { formatCurrency } from "../../utils/currencies";

    let categories: { title: string; value: string }[] = $state([]);

    onMount(async () => {
        // Fetch categories from an API or state management
        categories = [
            { title: "Technology:", value: "42" },
            { title: "Health:", value: "27" },
            { title: "Science:", value: "15000000" },
            { title: "Art:", value: "8" },
        ];
    });
</script>

<div class="flex flex-wrap gap-[8px]">
    {#each categories as category}
        <Category class="text-secondary hover:bg-white hover:inset-ring-1 hover:inset-ring-secondary">
            {category.title} {formatCurrency(Number(category.value), "USD")}
        </Category>
    {/each}
</div>
