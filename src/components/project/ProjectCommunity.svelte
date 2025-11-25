<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import type { Accounting, Project, ProjectSupport } from "../../openapi/client/index";
    import { apiProjectSupportsGetCollection, apiUsersIdGet } from "../../openapi/client/index";
    import { extractId } from "../../utils/extractId";
    import Loader from "../../svgs/Loader.svelte";
    import { Modal } from "flowbite-svelte";
    import ProjectCommunityMessage from "./ProjectCommunityMessage.svelte";
    import ProjectCommunityMatchfunding from "./ProjectCommunityMatchfunding.svelte";
    import ProjectCommunityAnonymous from "./ProjectCommunityAnonymous.svelte";

    let {
        project,
        accounting,
    }: {
        project: Project;
        accounting: Accounting;
    } = $props();

    const projectId = project.id!.toString();

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
        const { data: publicSupports } = await apiProjectSupportsGetCollection({
            query: { project: projectId, anonymous: false },
        });

        const supportsWithOwners = await Promise.all(
            (publicSupports || []).map(async (support) => {
                const id = extractId(support?.origin!);

                const { data: user } = await apiUsersIdGet({ path: { id: id! } });
                const displayName = user?.displayName!;

                return {
                    ...support,
                    displayName,
                    matchfunding: support.origin?.includes("match")!,
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
        <h2 class="text-secondary line-clamp-2 flex max-w-2xl text-4xl font-bold">
            {$t("project.tabs.community.content.title")}
        </h2>
        <div class="flex flex-col gap-6">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                {#each groupedItems.matchfunding as item (item.id)}
                    <ProjectCommunityMatchfunding
                        {item}
                        bind:openModal
                        bind:selectedProjectSupport
                    />
                {/each}
                <ProjectCommunityAnonymous {project} currency={accounting.balance?.currency!} />
            </div>

            {#if groupedItems.default?.length}
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {#each groupedItems.default as item (item.id)}
                        <ProjectCommunityMessage
                            {item}
                            bind:openModal
                            bind:selectedProjectSupport
                        />
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>

<Modal
    bind:open={openModal}
    closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary  rounded-4xl hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
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
                    <div class="font-bold text-black">
                        {$t("project.tabs.community.contribution")}
                    </div>
                    <p class="text-2xl font-bold text-black">
                        {formatCurrency(
                            selectedProjectSupport.money?.amount ?? 0,
                            selectedProjectSupport.money?.currency ?? "undefined",
                        )}
                    </p>
                </div>
            </div>
            <div class="text-2xl font-bold text-black">
                {selectedProjectSupport.displayName}
            </div>
            <div class="text-content text-sm">
                {selectedProjectSupport.message}
            </div>
        </div>
    {/if}
</Modal>
