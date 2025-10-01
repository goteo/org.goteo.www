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
        class="flex justify-center items-center gap-2 px-4 py-2 rounded-2xl bg-purple-tint cursor-pointer hover:bg-[#D0CFED] transition-colors"
    >
        <SearchIcon width="16" height="16" />
        Buscar
    </button>
    <button
        onclick={goToCreateProject}
        class="flex justify-center items-center gap-2 px-4 py-2 rounded-2xl bg-primary cursor-pointer hover:bg-[#38bfa7] transition-colors"
    >
        Crea tu proyecto
    </button>
</div>
