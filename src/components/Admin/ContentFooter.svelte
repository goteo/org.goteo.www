<script lang="ts">
    import { apiVersionsIdGet } from "../../../src/openapi/client/index.ts";
    import { t } from "../../i18n/store";
    import AnnotationIcon from "../icons/Comments.svelte";
    import Tag from "../library/Tag.svelte";

    const { id } = $props<{ id: string }>();

    let date = $state<string | null>(null);
    let time = $state<string | null>(null);

    async function getDate(id: string) {
        const { data } = await apiVersionsIdGet({ path: { id } });
        if (!data?.dateCreated) return;

        const d = new Date(data.dateCreated);
        const year = String(d.getFullYear()).slice(2);
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");

        date = `(${day}/${month}/${year})`;
        time = `${hour}:${minute}h`;
    }

    $effect(() => {
        if (id) getDate(id);
    });
</script>

<section
    class="flex flex-col gap-6 text-base leading-5 md:flex-row md:items-center md:justify-between"
>
    <div class="text-content min-h-5">
        {#if date && time}
            <p>
                {@html $t(
                    "contributions.grid.content-footer.lastEdited",
                    {
                        date: `<span class="font-bold">${date}</span>`,
                        time: `<span class="font-bold">${time}</span>`,
                    },
                    { allowHTML: true },
                )}
            </p>
        {/if}
    </div>
    <div class="flex flex-row flex-wrap items-center justify-start gap-8 md:justify-end">
        <button class="text-secondary cursor-pointer bg-transparent font-bold">
            {$t("contributions.grid.content-footer.downloadCertificates")}
        </button>
        <button class="text-secondary cursor-pointer bg-transparent font-bold">
            {$t("contributions.grid.content-footer.downloadPdf")}
        </button>
        <button
            class="text-secondary bg-variant1 flex min-h-10 cursor-pointer flex-row items-center gap-2 rounded-2xl px-4 py-2 font-bold"
        >
            <AnnotationIcon size={20} class="shrink-0" />
            {$t("contributions.grid.content-footer.annotations", {
                annotations: 0,
            })}
        </button>
    </div>
</section>
