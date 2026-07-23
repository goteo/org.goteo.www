<script lang="ts">
    import { t } from "../../i18n/store";
    import Download from "../icons/actions/Download.svelte";
    import Button from "../library/buttons/Button.svelte";
</script>

<Button size="sm" kind="secondary" aria-label={$t("pages.admin.projects.export.csv")}>
    <Download width="16" height="16" class="text-secondary" />
    <span class="text-secondary font-bold">
        {$t("pages.admin.projects.export.csv")}
    </span>
</Button>
