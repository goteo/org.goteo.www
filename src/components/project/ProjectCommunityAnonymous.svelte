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
    class="border-grey flex h-58 cursor-pointer overflow-hidden rounded-4xl border bg-white shadow-sm transition-shadow duration-200 ease-in-out hover:shadow-lg md:flex-row"
>
    <div class="flex h-full w-full shrink-0 overflow-hidden md:h-auto md:w-2/5">
        <img
            src="/imgs/card-comunidad.png"
            alt="Community donation"
            class="h-full w-full object-cover"
        />
    </div>
    <div class="flex w-full flex-col justify-between p-6">
        <div class="flex flex-col items-end gap-1">
            <div class="text-base font-bold text-black">
                {length}
                {$t("pages.project.view.tabs.community.anonymous.length")}
            </div>
            <p class="text-2xl font-bold text-black">{formatCurrency(money, currency)}</p>
        </div>

        <div>
            <div class="text-2xl font-bold text-black">
                {$t("pages.project.view.tabs.community.anonymous.title")}
            </div>
            <p class="text-content line-clamp-2 text-sm">
                {$t("pages.project.view.tabs.community.anonymous.description")}
            </p>
        </div>
    </div>
</div>
