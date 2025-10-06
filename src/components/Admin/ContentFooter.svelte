<script lang="ts">
    import { t } from "../../i18n/store";
    import AnnotationIcon from "../../svgs/AnnotationIcon.svelte";
    import { apiVersionsIdGet } from "../../../src/openapi/client/index.ts";

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

<section class="flex flex-row items-center justify-between">
    <div>
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
    <div class="flex flex-row items-center gap-4">
        <p class="text-secondary font-bold">
            {$t("contributions.grid.content-footer.downloadDetails")}
        </p>
        <span
            class="text-secondary bg-purple-tint flex flex-row items-center gap-2 rounded-2xl px-4 py-2 font-bold"
        >
            <AnnotationIcon />
            {$t("contributions.grid.content-footer.annotations", {
                annotations: 0,
            })}
        </span>
    </div>
</section>
