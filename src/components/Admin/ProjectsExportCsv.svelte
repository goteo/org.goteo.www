<script lang="ts">
    import { t } from "../../i18n/store";
    import Download from "../icons/Download.svelte";
    import Button from "../library/Button.svelte";
</script>

<Button size="sm" kind="secondary" aria-label={$t("admin.projects.export.csv")}>
    <Download width="16" height="16" class="text-secondary" />
    <span class="text-secondary font-bold">
        {$t("admin.projects.export.csv")}
    </span>
</Button>
