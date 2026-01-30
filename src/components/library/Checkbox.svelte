<script lang="ts">
    let { id, label } = $props<{
        id?: string;
        label?: string;
    }>();
</script>

<input
    type="checkbox"
    {id}
    class="text-primary mt-1 size-5 shrink-0 border ring-0 border-secondary rounded-sm"
/>
<span class="text-sm text-gray-700">{label}</span>
