<script lang="ts">
    import { t } from "../i18n/store";
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
        {$t("common.header.search")}
    </Button>
    <Button size="sm" kind="primary" onclick={goToCreateProject}>
        {$t("common.header.createProject")}
    </Button>
</div>
