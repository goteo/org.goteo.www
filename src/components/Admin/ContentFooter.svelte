<script>
    import { t } from "../../i18n/store";
    import AnnotationIcon from "../../svgs/AnnotationIcon.svelte";
</script>

<section class="flex flex-row items-center justify-between">
    <div>
        <p>{$t("contributions.grid.content-footer.lastEdited")}</p>
    </div>
    <div class="flex flex-row items-center gap-4">
        <p class="text-tertiary font-bold">
            {$t("contributions.grid.content-footer.downloadDetails")}
        </p>
        <span
            class="text-tertiary flex flex-row items-center gap-2 rounded-2xl bg-[#E6E5F7] px-4 py-2 font-bold"
        >
            <AnnotationIcon />
            {$t("contributions.grid.content-footer.annotations", {
                annotations: 0,
            })}</span
        >
    </div>
</section>
