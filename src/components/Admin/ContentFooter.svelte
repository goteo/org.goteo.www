<script>
    import { t } from "../../i18n/store";
    import AnnotationIcon from "../../svgs/AnnotationIcon.svelte";
    export let date;
</script>

<section class="flex flex-row items-center justify-between">
    <div>
        <p>
            {@html $t(
                "contributions.grid.content-footer.lastEdited",
                {
                    date: date ? `<span class="font-bold">(${date.slice(0, 10)})</span>` : "-",
                    time: date ? `<span class="font-bold">${date.slice(11, 16)}h</span>` : "-",
                },
                { allowHTML: true },
            )}
        </p>
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
