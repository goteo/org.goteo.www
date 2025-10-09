<script lang="ts">
    import SearchIcon from "../svgs/SearchIcon.svelte";
    import Button from "./library/Button.svelte";

    function openSearch() {
        window.location.href = "/search";
    }

    function goToCreateProject() {
        window.location.href = "/create/project";
    }
</script>

<div class="flex gap-2">
    <Button onclick={openSearch} kind="secondary" size="sm" class="gap-2">
        {#snippet children()}
            <SearchIcon width="16" height="16" />
            Buscar
        {/snippet}
    </Button>
    <Button onclick={goToCreateProject} kind="primary" size="sm" class="gap-2">
        {#snippet children()}
            Crea tu proyecto
        {/snippet}
    </Button>
</div>
