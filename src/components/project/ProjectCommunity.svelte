<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import type { Project, ProjectSupport } from "../../openapi/client/index";
    import { apiProjectSupportsGetCollection, apiUsersIdGet } from "../../openapi/client/index";
    import { extractId } from "../../utils/extractId";
    import Loader from "../../svgs/Loader.svelte";
    import { Modal } from "flowbite-svelte";

    const { project } = $props<{ project: Project }>();

    let projectsSupportItems = $state<
        (ProjectSupport & {
            displayName: string;
            matchfunding: boolean;
        })[]
    >([]);

    let selectedProjectSupport:
        | (ProjectSupport & {
              displayName: string;
              matchfunding: boolean;
          })
        | null = $state(null);

    let isLoaded = $state(false);
    let openModal = $state(false);

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
            query: { project: project.id },
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
                        <button
                            class="flex cursor-pointer overflow-hidden rounded-4xl bg-white transition-shadow duration-200 ease-in-out hover:shadow-lg"
                            onclick={() => {
                                selectedProjectSupport = item;
                                openModal = true;
                            }}
                        >
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
                        </button>
                    {/each}
                </div>
            {/if}

            {#if groupedItems.default?.length}
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {#each groupedItems.default as item (item.id)}
                        <button
                            class="flex cursor-pointer flex-col gap-4 rounded-4xl bg-white p-4 px-6 py-4 transition-shadow duration-200 ease-in-out hover:shadow-lg"
                            onclick={() => {
                                selectedProjectSupport = item;
                                openModal = true;
                            }}
                        >
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
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>

<Modal
    bind:open={openModal}
    closeBtnClass="top-7 end-7 bg-transparent text-[#462949] hover:bg-transparent hover:text-[#462949]  rounded-4xl hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-[#462949] dark:hover:text-[#462949] dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 w-full max-w-[475px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    headerClass="py-2"
>
    {#if selectedProjectSupport}
        <div class="flex cursor-pointer flex-col gap-4 bg-white p-4 px-6 py-4">
            <div class="flex flex-row items-center justify-between gap-4">
                <div>
                    <div class="flex h-16 w-16 items-center justify-center rounded-lg">😀</div>
                </div>
                <div class="flex flex-col items-end">
                    <div class="text-secondary font-bold">
                        {$t("project.tabs.community.contribution")}
                    </div>
                    <p class="text-secondary text-2xl font-bold">
                        {formatCurrency(
                            selectedProjectSupport.money?.amount ?? 0,
                            selectedProjectSupport.money?.currency ?? "undefined",
                        )}
                    </p>
                </div>
            </div>
            <div class="text-secondary text-2xl font-bold">
                {selectedProjectSupport.displayName}
            </div>
            <!-- TODO :  Replace with actual description -->
            <div class="line-clamp-2 text-sm text-[#575757]">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate suscipit nemo
                eius ab error itaque nostrum neque earum dolor molestiae obcaecati ipsum aliquam,
                odit, rem natus perferendis at ea in.
            </div>
        </div>
    {/if}
</Modal>
