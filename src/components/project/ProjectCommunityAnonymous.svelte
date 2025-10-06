<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import { apiProjectSupportsmoneyTotalGetCollection, type Project } from "../../openapi/client";

    export let project: Project;
    export let currency: string;

    const projectId = String(project.id!);

    let money = 0;
    let length: number = 0;

    onMount(async () => {
        const { data: totalMoney } = await apiProjectSupportsmoneyTotalGetCollection({
            query: { project: projectId, anonymous: true },
        });

        money = totalMoney?.amount!;
        length = totalMoney?.length!;
    });
</script>

<div
    class="flex cursor-pointer flex-col overflow-hidden rounded-4xl bg-white transition-shadow duration-200 ease-in-out hover:shadow-lg md:flex-row"
>
    <div class="flex h-32 w-full items-center justify-center overflow-hidden md:h-auto md:w-1/3">
        <img
            src="/imgs/card-comunidad.png"
            alt="Community donation"
            class="h-full w-full object-cover"
        />
    </div>
    <div class="flex w-full flex-col gap-4 p-6 md:w-2/3">
        <div class="flex flex-col items-start gap-2 font-bold text-black md:items-end">
            <span>{$t("project.tabs.community.matchfunding.contribution")}</span>
            <div class="flex flex-col items-start text-2xl md:items-end">
                <div class="flex items-center gap-2 text-sm">
                    <span>
                        {length}
                        {$t("project.tabs.community.anonymous.length")}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-bold">
                        {formatCurrency(money, currency)}
                    </span>
                </div>
            </div>
        </div>
        <div class="line-clamp-2 text-left text-2xl font-bold text-black md:text-right">
            {$t("project.tabs.community.anonymous.title")}
        </div>
        <p class="text-content line-clamp-2 text-left text-sm md:text-right">
            {$t("project.tabs.community.anonymous.description")}
        </p>
    </div>
</div>
