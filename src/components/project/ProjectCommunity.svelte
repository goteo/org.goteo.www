<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { onMount } from "svelte";

    import ProjectCommunityAnonymous from "./ProjectCommunityAnonymous.svelte";
    import ProjectCommunityMatchfunding from "./ProjectCommunityMatchfunding.svelte";
    import ProjectCommunityMessage from "./ProjectCommunityMessage.svelte";
    import { t } from "../../i18n/store";
    import {
        apiProjectSupportsGetCollection,
        apiUsersIdOrHandleGet,
    } from "../../openapi/client/index";
    import Loader from "../../svgs/Loader.svelte";
    import { formatCurrency } from "../../utils/currencies";
    import { extractId } from "../../utils/extractId";
    import ActionableButton from "../library/ActionableButton.svelte";
    import Grid from "../library/Grid.svelte";

    import type { Accounting, Project, ProjectSupport } from "../../openapi/client/index";

    let {
        project,
        accounting,
    }: {
        project: Project;
        accounting: Accounting;
    } = $props();

    const projectId = $derived(project.id?.toString());
    const PAGE_SIZE = 30;

    type EnrichedSupport = ProjectSupport & {
        displayName: string;
        matchfunding: boolean;
    };

    let projectsSupportItems = $state<EnrichedSupport[]>([]);

    let selectedProjectSupport: EnrichedSupport | null = $state(null);

    let isLoaded = $state(false);
    let openModal = $state(false);
    let hasMore = $state(false);
    let currentPage = $state(1);

    const groupedItems = $derived.by(() =>
        projectsSupportItems.reduce(
            (groups, item) => {
                const type = item.matchfunding ? "matchfunding" : "default";
                (groups[type] ??= []).push(item);
                return groups;
            },
            {} as Record<string, typeof projectsSupportItems>,
        ),
    );

    async function fetchPage(page: number, size: number): Promise<ProjectSupport[]> {
        const { data } = await apiProjectSupportsGetCollection({
            query: { project: projectId, anonymous: false, page, itemsPerPage: size },
        });

        const items = (data as ProjectSupport[] | null) ?? [];
        hasMore = items.length >= size;
        return items;
    }

    async function enrichSupports(supports: ProjectSupport[]): Promise<EnrichedSupport[]> {
        return Promise.all(
            supports.map(async (support) => {
                const id = extractId(support?.origin!);
                const { data: user } = await apiUsersIdOrHandleGet({ path: { idOrHandle: id! } });
                return {
                    ...support,
                    displayName: user?.displayName!,
                    matchfunding: support.origin?.includes("match")!,
                };
            }),
        );
    }

    const matchfundingCount = $derived(groupedItems.matchfunding?.length ?? 0);
    const hasMatchfunding = $derived(matchfundingCount > 0);
    const isSingleMatchfunding = $derived(matchfundingCount === 1);

    const visibleDefaultItems = $derived(
        hasMatchfunding
            ? groupedItems.default
            : groupedItems.default?.slice(
                  0,
                  PAGE_SIZE - 2 + Math.max(0, (currentPage - 1) * PAGE_SIZE),
              ),
    );

    onMount(async () => {
        const supports = await fetchPage(1, PAGE_SIZE);
        projectsSupportItems = await enrichSupports(supports);
        isLoaded = true;
    });

    async function loadMore() {
        const nextPage = currentPage + 1;
        const supports = await fetchPage(nextPage, PAGE_SIZE);
        const enriched = await enrichSupports(supports);
        projectsSupportItems = [...projectsSupportItems, ...enriched];
        currentPage = nextPage;
    }
</script>

<div class="flex flex-col gap-10">
    {#if !isLoaded}
        <div class="flex items-center justify-center">
            <Loader />
        </div>
    {:else}
        <h2 class="text-secondary line-clamp-2 flex max-w-2xl text-4xl font-bold">
            {$t("pages.project.view.tabs.community.content.title")}
        </h2>
        <div class="flex flex-col gap-6">
            {#if hasMatchfunding}
                <Grid
                    class={`grid-cols-1 gap-6 ${isSingleMatchfunding ? "md:grid-cols-2 lg:grid-cols-2" : "md:grid-cols-3"}`}
                >
                    {#each groupedItems.matchfunding as item (item.id)}
                        <ProjectCommunityMatchfunding
                            {item}
                            bind:openModal
                            bind:selectedProjectSupport
                        />
                    {/each}
                    <ProjectCommunityAnonymous {project} currency={accounting.balance?.currency!} />
                </Grid>
            {/if}

            {#if groupedItems.default?.length}
                <Grid class="grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {#if !hasMatchfunding}
                        <div class="row-span-2 h-full">
                            <ProjectCommunityAnonymous
                                {project}
                                currency={accounting.balance?.currency!}
                            />
                        </div>
                    {/if}
                    {#each visibleDefaultItems as item (item.id)}
                        <ProjectCommunityMessage
                            {item}
                            bind:openModal
                            bind:selectedProjectSupport
                        />
                    {/each}
                </Grid>
            {/if}

            {#if hasMore}
                <div class="flex w-full justify-center">
                    <ActionableButton action={loadMore} autoreset={0} class="w-32">
                        {$t("pages.project.view.tabs.community.loadMore")}
                    </ActionableButton>
                </div>
            {/if}
        </div>
    {/if}
</div>

<Modal
    bind:open={openModal}
    closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary  rounded-4xl hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 w-full max-w-118.75 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
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
                        {$t("pages.project.view.tabs.community.contribution")}
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
