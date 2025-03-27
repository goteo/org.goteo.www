<script>
    export let item;
    export let onIncrement;
    export let onDecrement;
    export let onRemove;
</script>

{#if item.amount > 0}
    <div class="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-md">
        <div class="flex items-center gap-4">
            <div
                class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-orange-200"
            >
                {#if item.image}
                    <img src={item.image} alt={item.name} class="h-full w-full object-cover" />
                {:else}
                    <span class="text-2xl">🙂</span>
                {/if}
            </div>
            <div>
                <p class="text-lg font-semibold">{item.amount / 100}€</p>
                <p class="text-sm text-gray-700">{item.name}</p>
                <p class="text-xs text-gray-500">100 personas ya han donado</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <button on:click={() => onDecrement(item)} class="text-xl text-purple-800">−</button>
            <span>{item.quantity}</span>
            <button on:click={() => onIncrement(item)} class="text-xl text-purple-800">+</button>
            <button on:click={() => onRemove(item)} class="text-xl text-purple-800">🗑️</button>
        </div>
    </div>
{/if}
