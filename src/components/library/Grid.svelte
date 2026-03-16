<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let { class: classes = "", children } = $props<{
        class?: ClassNameValue;
        children: any;
    }>();
</script>

<div class={twMerge("grid grid-cols-2 gap-6 lg:grid-cols-3", classes)}>
    {@render children()}
</div>
