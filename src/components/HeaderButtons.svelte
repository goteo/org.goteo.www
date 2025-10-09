<script lang="ts">
    import SearchIcon from "../svgs/SearchIcon.svelte";

    function openSearch() {
        window.location.href = "/search";
    }

    function goToCreateProject() {
        window.location.href = "/create/project";
    }
</script>

<div class="flex gap-2">
    <button
        onclick={openSearch}
        class="bg-purple-tint flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2 transition-colors hover:bg-[#D0CFED]"
    >
        <SearchIcon width="16" height="16" />
        Buscar
    </button>
    <button
        onclick={goToCreateProject}
        class="bg-primary flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2 transition-colors hover:bg-[#38bfa7]"
    >
        Crea tu proyecto
    </button>
</div>
