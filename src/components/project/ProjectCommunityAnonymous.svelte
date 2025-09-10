<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import { apiProjectSupportsmoneyTotalGetCollection, type Project } from "../../openapi/client";

    export let project: Project;

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
    class="flex cursor-pointer overflow-hidden rounded-4xl bg-white transition-shadow duration-200 ease-in-out hover:shadow-lg"
>
    <div class="flex w-1/3 items-center justify-center bg-blue-500">😀</div>
    <div class="flex w-2/3 flex-col gap-4 p-6">
        <div class="text-secondary flex flex-col items-end gap-2 font-bold">
            <span>{$t("project.tabs.community.matchfunding.contribution")}</span>
            <div class="flex flex-col items-end text-2xl">
                <div class="flex items-center gap-2 text-sm">
                    <span>
                        {length}
                        {$t("project.tabs.community.anonymous.length")}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-bold">
                        {formatCurrency(money)}
                    </span>
                </div>
            </div>
        </div>
        <div class="text-secondary line-clamp-2 text-2xl font-bold">
            {$t("project.tabs.community.anonymous.title")}
        </div>
        <p class="line-clamp-2 text-sm text-[#575757]">
            {$t("project.tabs.community.anonymous.description")}
        </p>
    </div>
</div>
