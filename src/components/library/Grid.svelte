<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let { class: classes = "gap-6 lg:grid-cols-3", children } = $props<{
        class?: ClassNameValue;
        children: any;
    }>();
</script>

<div class={twMerge("grid", classes)}>
    {@render children()}
</div>
