<script lang="ts">
    let { id, label } = $props<{
        id?: string;
        label?: string;
    }>();
</script>

<input
    type="checkbox"
    {id}
    class="text-primary border-secondary mt-1 size-5 shrink-0 rounded-sm border ring-0"
/>
{#if label}
    <span class="text-content text-base font-normal">{label}</span>
{/if}
