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
    class="flex cursor-pointer flex-col gap-4 rounded-4xl bg-white p-6 transition-shadow duration-200 ease-in-out hover:shadow-lg"
>
    <div class="flex flex-col items-start gap-4">
        <div class="flex h-56 w-full items-center justify-center rounded-lg bg-blue-500">😀</div>
        <div class="flex flex-col items-start text-left">
            <div class="text-secondary font-bold">
                {$t("project.tabs.community.matchfunding.contribution")}
            </div>
            <div class="flex flex-col items-start text-2xl">
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
    </div>
    <div class="text-secondary text-left text-2xl font-bold">
        {$t("project.tabs.community.anonymous.title")}
    </div>
    <p class="text-left text-sm text-[#575757]">
        {$t("project.tabs.community.anonymous.description")}
    </p>
</div>
