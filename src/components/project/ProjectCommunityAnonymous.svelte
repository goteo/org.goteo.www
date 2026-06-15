<script lang="ts">
    import { t } from "../../i18n/store";
    import { apiProjectSupportsmoneyTotalGetCollection, type Project } from "../../openapi/client";
    import { formatCurrency } from "../../utils/currencies";

    let {
        project,
        currency,
    }: {
        project: Project;
        currency: string;
    } = $props();

    const projectId = $derived(String(project.id!));

    let money = $state(0);
    let length = $state(0);

    $effect(() => {
        apiProjectSupportsmoneyTotalGetCollection({
            query: { project: projectId, anonymous: true },
        }).then(({ data: totalMoney }) => {
            money = totalMoney?.amount ?? 0;
            length = totalMoney?.length ?? 0;
        });
    });
</script>

<div
    class="flex h-full cursor-pointer flex-col overflow-hidden rounded-4xl bg-white transition-shadow duration-200 ease-in-out hover:shadow-lg md:flex-row"
>
    <div class="flex h-32 w-full items-center justify-center overflow-hidden md:h-full md:w-1/3">
        <img
            src="/imgs/card-comunidad.png"
            alt="Community donation"
            class="h-full w-full object-cover"
        />
    </div>
    <div class="flex w-full flex-col justify-between gap-4 p-6 md:w-2/3">
        <div class="flex justify-end">
            <div class="flex flex-col items-end font-bold text-black">
                <span class="text-sm">
                    {length}
                    {$t("pages.project.view.tabs.community.anonymous.length")}
                </span>
                <span class="text-2xl">{formatCurrency(money, currency)}</span>
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <div class="text-2xl font-bold text-black">
                {$t("pages.project.view.tabs.community.anonymous.title")}
            </div>
            <p class="text-content line-clamp-2 text-sm">
                {$t("pages.project.view.tabs.community.anonymous.description")}
            </p>
        </div>
    </div>
</div>
