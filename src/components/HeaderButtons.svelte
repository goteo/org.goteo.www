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
    <Button size="sm" kind="secondary" onclick={openSearch}>
        <SearchIcon width="16" height="16" />
        Buscar
    </Button>
    <Button size="sm" kind="primary" onclick={goToCreateProject}>Crea tu proyecto</Button>
</div>
