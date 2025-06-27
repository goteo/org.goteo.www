<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import type { Project, ProjectSupport } from "../../openapi/client/index";
    import { apiProjectSupportsGetCollection, apiUsersIdGet } from "../../openapi/client/index";
    import { extractId } from "../../utils/extractId";
    import Loader from "../../svgs/Loader.svelte";

    const { project } = $props<{ project: Project }>();

    let projectsSupportItems = $state<
        (ProjectSupport & {
            displayName: string;
            matchfunding: boolean;
        })[]
    >([]);

    let isLoaded = $state(false);

    function getSupportType(item: (typeof projectsSupportItems)[number]) {
        switch (true) {
            case item.matchfunding:
                return "matchfunding";
            default:
                return "default";
        }
    }

    const groupedItems = $derived.by(() =>
        projectsSupportItems.reduce(
            (groups, item) => {
                const type = getSupportType(item);
                (groups[type] ??= []).push(item);
                return groups;
            },
            {} as Record<string, typeof projectsSupportItems>,
        ),
    );

    onMount(async () => {
        const { data } = await apiProjectSupportsGetCollection({
            query: { project: `/v4/project/${project.id}` },
        });

        const supportsWithOwners = await Promise.all(
            (data || []).map(async (support) => {
                const id = extractId(support?.owner ?? "");
                let displayName = $t("project.tabs.community.owner-anonymous");
                if (id && !support.anonymous) {
                    try {
                        const { data: user } = await apiUsersIdGet({ path: { id } });
                        displayName = user?.displayName ?? displayName;
                    } catch (e) {
                        console.error(`Error fetching user ${id}:`, e);
                    }
                }
                return {
                    ...support,
                    displayName,
                    // TODO : Replace with actual matchfunding logic
                    matchfunding: Math.random() < 0.5,
                };
            }),
        );
        projectsSupportItems = supportsWithOwners;
        isLoaded = true;
    });
</script>

<div class="flex flex-col gap-10">
    {#if !isLoaded}
        <div class="flex items-center justify-center">
            <Loader />
        </div>
    {:else}
        <h2 class="text-tertiary line-clamp-2 flex max-w-2xl text-[40px] leading-tight font-bold">
            {$t("project.tabs.community.content.title")}
        </h2>
        <div class="flex flex-col gap-6">
            {#if groupedItems.matchfunding?.length}
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {#each groupedItems.matchfunding as item (item.id)}
                        <div class="flex overflow-hidden rounded-4xl bg-white">
                            <div class="flex w-1/3 items-center justify-center bg-red-500">😀</div>
                            <div class="flex w-2/3 flex-col gap-4 p-6">
                                <div class="text-secondary flex flex-col items-end gap-2 font-bold">
                                    <span
                                        >{$t(
                                            "project.tabs.community.matchfunding.contribution",
                                        )}</span
                                    >
                                    <div class="flex flex-col items-end text-2xl">
                                        <div class="flex items-center gap-2">
                                            <span
                                                >{$t(
                                                    "project.tabs.community.matchfunding.aported",
                                                )}</span
                                            >
                                            <span>
                                                {formatCurrency(
                                                    item.money?.amount ?? 0,
                                                    item.money?.currency ?? "undefined",
                                                    { showSymbol: true, spaceBetween: true },
                                                )}
                                            </span>
                                        </div>
                                        <div class="flex items-center gap-2 text-[#5757577A]">
                                            <span
                                                >{$t(
                                                    "project.tabs.community.matchfunding.up_to",
                                                )}</span
                                            >
                                            <span class="font-bold">
                                                {formatCurrency(
                                                    item.money?.amount ?? 0,
                                                    item.money?.currency ?? "",
                                                    { showSymbol: true, spaceBetween: true },
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-secondary text-2xl font-bold">
                                    {item.displayName}
                                </div>
                                <!-- TODO :  Replace with actual description -->
                                <p class="line-clamp-2 text-sm text-[#575757]">
                                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                    Voluptate suscipit nemo eius ab error itaque nostrum neque earum
                                    dolor molestiae obcaecati ipsum aliquam, odit, rem natus
                                    perferendis at ea in.
                                </p>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}

            {#if groupedItems.default?.length}
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {#each groupedItems.default as item (item.id)}
                        <div class="flex flex-col gap-4 rounded-4xl bg-white px-6 py-4">
                            <div class="flex flex-row items-center justify-between gap-4">
                                <div class="flex h-16 w-16 items-center justify-center rounded-lg">
                                    😀
                                </div>
                                <div class="flex flex-col items-end">
                                    <div class="text-secondary font-bold">
                                        {$t("project.tabs.community.contribution")}
                                    </div>
                                    <p class="text-secondary text-2xl font-bold">
                                        {formatCurrency(
                                            item.money?.amount ?? 0,
                                            item.money?.currency ?? "",
                                            { showSymbol: true, spaceBetween: true },
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div class="text-secondary text-2xl font-bold">{item.displayName}</div>
                            <!-- TODO :  Replace with actual description -->
                            <div class="line-clamp-2 text-sm text-[#575757]">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate
                                suscipit nemo eius ab error itaque nostrum neque earum dolor
                                molestiae obcaecati ipsum aliquam, odit, rem natus perferendis at ea
                                in.
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>
