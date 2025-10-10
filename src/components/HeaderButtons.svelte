<script lang="ts">
    import SearchIcon from "../svgs/SearchIcon.svelte";
    import Button from "./library/Button.svelte";
    import { t } from "../i18n/store";

    function openSearch() {
        window.location.href = "/search";
    }

    function goToCreateProject() {
        window.location.href = "/create/project";
    }
</script>

<div class="flex gap-2">
    <Button onclick={openSearch} kind="secondary" size="sm">
        {#snippet children()}
            <SearchIcon width="16" height="16" />
            {$t("header.search")}
        {/snippet}
    </Button>
    <Button onclick={goToCreateProject} kind="primary" size="sm">
        {#snippet children()}
            {$t("header.createProject")}
        {/snippet}
    </Button>
</div>
