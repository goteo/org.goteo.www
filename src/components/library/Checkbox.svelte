<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let {
        id,
        label,
        checked = $bindable(false),
        class: classes,
    } = $props<{
        id?: string;
        label?: string;
        checked?: boolean;
        class?: ClassNameValue;
    }>();
</script>

<div class="flex items-center justify-center gap-2">
    <input
        type="checkbox"
        {id}
        bind:checked
        class={twMerge(
            "border-secondary text-primary ring-white size-5 shrink-0 rounded-sm border ring-0 accent-secondary outline-0",
            classes,
        )}
    />
    {#if label}
        <label for={id} class="text-content text-base font-normal">{label}</label>
    {/if}
</div>
