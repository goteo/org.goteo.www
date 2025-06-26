<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import type { Project, ProjectSupport } from "../../openapi/client/index";
    import { apiProjectSupportsGetCollection, apiUsersIdGet } from "../../openapi/client/index";
    import { extractId } from "../../utils/extractId";
    import { Modal } from "flowbite-svelte";

    const { project } = $props<{ project: Project }>();
    let projectsSupportItems: (ProjectSupport & {
        displayName: string;
        matchfunding: boolean;
    })[] = $state([]);

    let selectedProjectSupport:
        | (ProjectSupport & {
              displayName: string;
              matchfunding: boolean;
          })
        | null = $state(null);

    let openModal = $state(false);

    onMount(async () => {
        const { data } = await apiProjectSupportsGetCollection({
            query: {
                project: `/v4/project/${project.id}`,
            },
        });

        const supportsWithOwners = await Promise.all(
            (data || []).map(async (support) => {
                const id = extractId(support.owner ?? undefined);
                let displayName = $t("project.tabs.community.owner-anonymous");
                if (id && !support.anonymous) {
                    try {
                        const { data: user } = await apiUsersIdGet({ path: { id } });
                        displayName =
                            user?.displayName || $t("project.tabs.community.owner-anonymous");
                    } catch (e) {
                        console.error(`Error fetching user with ID ${id}:`, e);
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

        const sorted = [
            ...supportsWithOwners.filter((i) => i.matchfunding),
            ...supportsWithOwners.filter((i) => !i.matchfunding),
        ];

        projectsSupportItems = sorted;
    });
</script>

<div class="flex flex-col gap-6">
    {#if projectsSupportItems.some((item) => item.matchfunding)}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            {#each projectsSupportItems.filter((item) => item.matchfunding) as item}
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
                            <span>{$t("project.tabs.community.matchfunding.contribution")}</span>

                            <div class="flex flex-col items-end text-2xl">
                                <div class="flex items-center gap-2">
                                    <span>{$t("project.tabs.community.matchfunding.aported")}</span>
                                    <span>
                                        {formatCurrency(
                                            item.money?.amount ?? 0,
                                            item.money?.currency ?? "undefined",
                                            {
                                                showSymbol: true,
                                                spaceBetween: true,
                                            },
                                        )}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2 text-[#5757577A]">
                                    <span>{$t("project.tabs.community.matchfunding.up_to")}</span>
                                    <span class="font-bold">
                                        {formatCurrency(
                                            item.money?.amount ?? 0,
                                            item.money?.currency ?? "undefined",
                                            {
                                                showSymbol: true,
                                                spaceBetween: true,
                                            },
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="text-secondary text-2xl font-bold">{item.displayName}</div>

                        <p class="line-clamp-2 text-sm text-[#575757]">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate
                            suscipit nemo eius ab error itaque nostrum neque earum dolor molestiae
                            obcaecati ipsum aliquam, odit, rem natus perferendis at ea in.
                        </p>
                    </div>
                </button>
            {/each}
        </div>
    {/if}

    {#if projectsSupportItems.some((item) => !item.matchfunding)}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {#each projectsSupportItems.filter((item) => !item.matchfunding) as item}
                <button
                    class="flex cursor-pointer flex-col gap-4 rounded-4xl bg-white p-4 px-6 py-4 transition-shadow duration-200 ease-in-out hover:shadow-lg"
                    onclick={() => {
                        selectedProjectSupport = item;
                        openModal = true;
                    }}
                >
                    <div class="flex flex-row items-center justify-between gap-4">
                        <div>
                            <div class="flex h-16 w-16 items-center justify-center rounded-lg">
                                😀
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            <div class="text-secondary font-bold">
                                {$t("project.tabs.community.contribution")}
                            </div>
                            <p class="text-secondary text-2xl font-bold">
                                {formatCurrency(
                                    item.money?.amount ?? 0,
                                    item.money?.currency ?? "undefined",
                                    {
                                        showSymbol: true,
                                        spaceBetween: true,
                                    },
                                )}
                            </p>
                        </div>
                    </div>
                    <div class="text-secondary text-2xl font-bold">{item.displayName}</div>
                    <!-- TODO :  Replace with actual description -->
                    <div class="line-clamp-2 text-sm text-[#575757]">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate suscipit
                        nemo eius ab error itaque nostrum neque earum dolor molestiae obcaecati
                        ipsum aliquam, odit, rem natus perferendis at ea in.
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>

<Modal
    bind:open={openModal}
    closeBtnClass="top-7 end-7 bg-transparent text-[#462949] hover:bg-transparent hover:text-[#462949]  rounded-4xl hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-[#462949] dark:hover:text-[#462949] dark:hover:bg-transparent"
    class="!left-1/2 max-w-[475px] p-4 backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
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
                            {
                                showSymbol: true,
                                spaceBetween: true,
                            },
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
