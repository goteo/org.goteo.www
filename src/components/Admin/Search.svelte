<script lang="ts">
    import {
        apiProjectsGetCollection,
        apiTipjarsGetCollection,
        apiUsersGetCollection,
    } from "../../openapi/client";
    import SearchIcon from "../../svgs/SearchIcon.svelte";
    import CloseIcon from "../../svgs/CloseIcon.svelte";
    import { highlightMatch } from "../../utils/highlights";
    import { t } from "../../i18n/store";
    import type { ProjectJsonld, TipjarJsonld, UserJsonld } from "../../openapi/client/index";

    type ResultItem =
        | { type: "project"; data: ProjectJsonld }
        | { type: "tipjar"; data: TipjarJsonld }
        | { type: "user"; data: UserJsonld };

    type CollectionResponse<T> = {
        totalItems: number;
        member: T[];
    };

    let { onSelectTarget } = $props();

    let query = $state("");
    let results = $state<ResultItem[]>([]);
    let totalItems = $state(0);
    let searched = $state(false);

    let debounceTimeout: ReturnType<typeof setTimeout>;

    async function fetchResults(text: string) {
        const trimmed = text.trim();
        if (trimmed.length < 4) {
            results = [];
            totalItems = 0;
            searched = false;
            return;
        }

        searched = true;

        const [{ data: projectDataRaw }, { data: tipjarDataRaw }, { data: userDataRaw }] =
            await Promise.all([
                apiProjectsGetCollection({
                    query: { title: trimmed },
                    headers: { Accept: "application/ld+json" },
                }),
                apiTipjarsGetCollection({
                    query: { name: trimmed },
                    headers: { Accept: "application/ld+json" },
                }),
                apiUsersGetCollection({
                    query: { query: trimmed },
                    headers: { Accept: "application/ld+json" },
                }),
            ]);

        const projectData = projectDataRaw as unknown as CollectionResponse<ProjectJsonld>;
        const tipjarData = tipjarDataRaw as unknown as CollectionResponse<TipjarJsonld>;
        const userData = userDataRaw as unknown as CollectionResponse<UserJsonld>;

        const projectItems = projectData.member;
        const tipjarItems = tipjarData.member;
        const userItems = userData.member;

        totalItems = projectData.totalItems + tipjarData.totalItems + userData.totalItems;

        results = [
            ...projectItems.map((p): ResultItem => ({ type: "project", data: p })),
            ...tipjarItems.map((t): ResultItem => ({ type: "tipjar", data: t })),
            ...userItems.map((u): ResultItem => ({ type: "user", data: u })),
        ];
    }

    function handleInput(text: string) {
        clearTimeout(debounceTimeout);

        if (!text.trim()) {
            results = [];
            totalItems = 0;
            onSelectTarget("");
            searched = false;
            return;
        }

        debounceTimeout = setTimeout(() => {
            fetchResults(text);
        }, 300);
    }
</script>

<section class="relative w-full">
    <div class="search-form flex flex-row items-center gap-4">
        <div class="relative flex w-full">
            <input
                type="text"
                id="search"
                bind:value={query}
                oninput={(e) =>
                    handleInput(e.target instanceof HTMLInputElement ? e.target.value : "")}
                placeholder={$t("contributions.filters.search.placeholder")}
                class="border-tertiary w-full rounded-3xl border p-4"
                minlength="4"
            />
            {#if query}
                <button
                    type="button"
                    class="absolute top-1/2 right-3 h-6 w-6 -translate-y-1/2 rounded-full hover:bg-gray-300"
                    onclick={() => {
                        query = "";
                        results = [];
                        totalItems = 0;
                        searched = false;
                    }}
                >
                    <CloseIcon />
                </button>
            {:else}
                <div class="absolute top-1/2 right-3 h-8 w-8 -translate-y-1/2">
                    <SearchIcon width="32" height="32" />
                </div>
            {/if}
        </div>
    </div>

    {#if searched}
        <div class="absolute top-full z-10 my-8 w-full space-y-4 rounded-lg bg-gray-200 p-4">
            <p class="text-sm text-gray-500">
                {@html $t(
                    "contributions.filters.search.resultsFound",
                    {
                        totalItems: totalItems,
                        query: `<span class="font-bold">${query}</span>`,
                    },
                    { allowHTML: true },
                )}
            </p>

            {#if results.length > 0}
                {#if results.some((r) => r.type === "project")}
                    <div>
                        <h3 class="mb-2 text-sm font-bold text-gray-700 uppercase">
                            {$t("contributions.filters.search.labels.projects")}
                        </h3>
                        <div class="flex flex-col gap-2">
                            {#each results.filter((r) => r.type === "project") as item}
                                <button
                                    type="button"
                                    class="w-full cursor-pointer rounded-lg border bg-white p-4 text-left shadow transition hover:shadow-md"
                                    onclick={() => {
                                        onSelectTarget(item.data.accounting);
                                        query = "";
                                        results = [];
                                        totalItems = 0;
                                        searched = false;
                                    }}
                                >
                                    <div class="text-lg font-semibold text-gray-800">
                                        {@html highlightMatch(item.data.title, query)}
                                    </div>
                                    {#if item.data.subtitle}
                                        <div class="mt-1 line-clamp-2 text-sm text-gray-600">
                                            {item.data.subtitle}
                                        </div>
                                    {:else if item.data.description}
                                        <div class="mt-1 line-clamp-2 text-sm text-gray-600">
                                            {item.data.description}
                                        </div>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if results.some((r) => r.type === "tipjar")}
                    <div>
                        <h3 class="mt-6 mb-2 text-sm font-bold text-gray-700 uppercase">
                            {$t("contributions.filters.search.labels.tipjars")}
                        </h3>
                        <div class="flex flex-col gap-2">
                            {#each results.filter((r) => r.type === "tipjar") as item}
                                <button
                                    type="button"
                                    class="w-full cursor-pointer rounded-lg border bg-white p-4 text-left shadow transition hover:shadow-md"
                                    onclick={() => {
                                        onSelectTarget(item.data.accounting);
                                        query = "";
                                        results = [];
                                        totalItems = 0;
                                        searched = false;
                                    }}
                                >
                                    <div class="text-lg font-semibold text-gray-800">
                                        {@html highlightMatch(
                                            item.data.name ?? "Sin nombre",
                                            query,
                                        )}
                                    </div>
                                    <div class="mt-1 text-sm text-gray-500 italic">
                                        {$t("contributions.filters.search.labels.tipjar-id")}: {item
                                            .data.id}
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if results.some((r) => r.type === "user")}
                    <div>
                        <h3 class="mt-6 mb-2 text-sm font-bold text-gray-700 uppercase">
                            {$t("contributions.filters.search.labels.users")}
                        </h3>
                        <div class="flex flex-col gap-2">
                            {#each results.filter((r) => r.type === "user") as item}
                                <button
                                    type="button"
                                    class="w-full cursor-pointer rounded-lg border bg-white p-4 text-left shadow transition hover:shadow-md"
                                    onclick={() => {
                                        onSelectTarget(item.data.accounting);
                                        query = "";
                                        results = [];
                                        totalItems = 0;
                                        searched = false;
                                    }}
                                >
                                    <div class="text-lg font-semibold text-gray-800">
                                        {@html highlightMatch(
                                            item.data.displayName ?? item.data.handle ?? "-",
                                            query,
                                        )}
                                    </div>
                                    <div class="mt-1 line-clamp-2 text-sm text-gray-500 italic">
                                        @{item.data.handle}
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
            {:else}
                <p class="text-sm text-gray-400">{$t("contributions.filters.search.noResults")}</p>
            {/if}
        </div>
    {/if}
</section>
