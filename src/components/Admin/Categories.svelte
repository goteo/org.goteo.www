<script lang="ts">
    import Category from "../library/Category.svelte";
    import { formatCurrency } from "../../utils/currencies";

    let categories = $state<
        {
            title: string;
            amount: string | number;
        }[]
    >();

    const { paymentMethodOptions } = $props<{
        paymentMethodOptions: [string, string][];
    }>();

    $effect(() => {
        categories = paymentMethodOptions
            .map((option: [string, string]) => {
                if (option[0] === "all") return null;
                else return [option[1]];
            })
            .filter((opt: string | null) => opt !== null)
            .map(([label]: [string]) => ({
                title: label,
                amount: 0,
            }));
    });
</script>

<div class="flex flex-wrap gap-2">
    {#each categories as category}
        <Category
            class="text-secondary hover:inset-ring-secondary hover:bg-white hover:inset-ring-1"
        >
            {category.title}
            {formatCurrency(Number(category.amount))}
        </Category>
    {/each}
</div>
