<script>
    import { formatCurrency } from "../../utils/currencies";
    import MinusIcon from "../../svgs/MinusIcon.svelte";
    import PlusIcon from "../../svgs/PlusIcon.svelte";
    import TrashIcon from "../../svgs/TrashIcon.svelte";
    export let item;
    export let onIncrement;
    export let onDecrement;
    export let onRemove;
</script>

{#if item.amount > 0}
    <div class="flex w-full flex-col gap-4">
        <div class=" flex items-center justify-between rounded-2xl bg-white p-4 shadow-md">
            <div class="flex items-center gap-6">
                <div
                    class="flex h-[160px] w-[160px] items-center justify-center overflow-hidden rounded-3xl bg-orange-200"
                >
                    {#if item.image}
                        <img
                            src={item.image}
                            alt={item.title}
                            class="h-[160px] w-[160px] object-cover"
                        />
                    {:else}
                        <span class="text-2xl">🙂</span>
                    {/if}
                </div>
                <div class="flex flex-col gap-4">
                    <p class="text-tertiary text-[32px] font-bold">
                        {formatCurrency(item.amount, "EUR", { showSymbol: true })}
                    </p>
                    <p class="text-tertiary font-bold">{item.title}</p>
                    <p class="text-[#575757]">100 personas ya han donado</p>
                </div>
            </div>
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-4">
                    <button on:click={() => onDecrement(item)} class="text-xl text-purple-800">
                        <MinusIcon />
                    </button>
                    <span class="text-tertiary text-2xl font-bold">{item.quantity}</span>
                    <button on:click={() => onIncrement(item)} class="text-xl text-purple-800">
                        <PlusIcon />
                    </button>
                </div>

                <button on:click={() => onRemove(item)} class="text-xl text-purple-800">
                    <TrashIcon />
                </button>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <input
                type="checkbox"
                id="donation-checkbox"
                class="focus:bg-primary h-6 w-6 rounded border-gray-300 text-blue-600"
            />
            <label for="donation-checkbox" class=" text-[#575757]">
                Enviar esta recompensa a una dirección distinta a la mia.
            </label>
        </div>
    </div>
{/if}
