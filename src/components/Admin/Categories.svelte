<script lang="ts">
    import Category from "../library/Category.svelte";

    let categories = $state([]);
</script>

<div>
    {#each categories as category}
        <Category>a</Category>
    {/each}
</div>