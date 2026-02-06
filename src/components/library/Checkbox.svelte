<script lang="ts">
    let { id, label, checked = $bindable(false) } = $props<{
        id?: string;
        label?: string;
        checked?: boolean;
    }>();
</script>

<input
    type="checkbox"
    {id}
    bind:checked
    class="text-primary border-secondary mt-1 size-5 shrink-0 rounded-sm border ring-0"
/>
{#if label}
    <label for={id} class="text-content text-base font-normal">{label}</label>
{/if}
