<script lang="ts">
    import { onMount } from "svelte";
    import { _ } from "svelte-i18n";
    import { MoveRight, MapPin, Heart } from "lucide-svelte";
    import { marked } from "marked";

    import type { PageProps } from "./$types";

    import * as Tabs from "$lib/components/ui/tabs";
    import { Button } from "$lib/components/ui/button";

    import LocaleSwitcher from "$lib/components/LocaleSwitcher";
    import CampaignProgress from "$lib/components/CampaignProgress";
    import Player from "$lib/components/Player";
    import RewardCard from "$lib/components/RewardCard";
    import ShareButton from "$lib/components/ShareButton";
    import ProjectBudget from "$lib/components/ProjectBudget";
    import FundingChart from "$lib/components/FundingChart";
    import CategoryLabel from "$lib/components/CategoryLabel";
    import CountdownLabel from "$lib/components/CountdownLabel";

    import aboutIco from "./about.svg";
    import impactIco from "./impact.svg";
    import UpdateCard from "$lib/components/UpdateCard";

    let { data }: PageProps = $props();
    let { locales, campaign, video, rewards, budgets, project } = data;
    let [update, ...updates] = data.updates;

    let currentTab = $state("rewards");

    function handleTabChange(value: string | undefined) {
        if (value) {
            currentTab = value;
            window.location.hash = value;
        }
    }

    onMount(() => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            currentTab = hash;
        }

        // Add event listener for hash changes
        const handleHashChange = () => {
            const newHash = window.location.hash.slice(1);
            if (newHash) {
                currentTab = newHash;
            }
        };

        window.addEventListener("hashchange", handleHashChange);

        // Clean up the event listener when component is destroyed
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    });

    const tabs = ["rewards", "project", "budget", "updates", "community"] as const;

    // Group budgets by type
    const groupedBudgets = budgets.reduce(
        (acc, budget) => {
            if (!acc[budget.type]) {
                acc[budget.type] = [];
            }
            acc[budget.type].push(budget);
            return acc;
        },
        {} as Record<string, typeof budgets>,
    );

    function renderMarkdown(content: string) {
        return marked(content, { sanitize: true });
    }
</script>

<section class="flex flex-col gap-8">
    <div class="grid grid-flow-col gap-8">
        <div class="space-y-4">
            <p class="text-2xl text-gray-600">
                {$_("project.owner", { values: { owner: project.owner } })}
            </p>
            <h1 class="text-5xl font-bold">{project.title}</h1>
            <p class="line-clamp-2 max-w-3xl text-gray-600">{project.subtitle}</p>
        </div>
        <div class="flex flex-col items-end justify-between">
            <LocaleSwitcher {locales} />
            {#if project.status === "in_campaign" && project.deadline}
                <CountdownLabel deadline={project.deadline} />
            {/if}
        </div>
    </div>

    <div class="grid grid-flow-col gap-8">
        <Player {...video} />
        <CampaignProgress
            obtained={campaign.obtained.amount}
            optimum={campaign.optimum.amount.amount}
            minimum={campaign.minimum.amount.amount}
            currency={campaign.minimum.amount.currency}
            donations={campaign.donations}
            timeSeriesData={campaign.timeSeriesData}
        />
    </div>
    <div class="flex items-center justify-between">
        <div class="flex gap-4">
            <CategoryLabel label={project.category} />
            <Button variant="outline" size="sm" class="border-black"
                ><MapPin class="mr-2" /> {project.territory}</Button
            >
        </div>
        <div class="flex gap-4">
            <ShareButton />
            <Button variant="ghost" size="sm"
                ><Heart class="mr-2 h-4" /> {$_("project.actions.remember")}</Button
            >
        </div>
    </div>
</section>

<section>
    <div class="mb-8 flex items-center justify-between">
        <h2 class="text-2xl font-bold">{$_("reward.trending")}</h2>
        <Button variant="secondary" size="lg" href="#rewards">
            <MoveRight class="mr-4 h-6 w-6" />
            {$_("project.actions.viewAll")}
        </Button>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
        {#each rewards.slice(0, 3) as reward}
            <RewardCard size="sm" projectId={project.id} {...reward} />
        {/each}
    </div>
</section>

<section class="grid grid-cols-2 gap-8">
    <div class="flex flex-row gap-4">
        <img src={aboutIco} alt="About" class="h-16 w-16" />
        <p class="text-gray-500">
            {$_("project.about.description")}
            <a class="font-semibold" href="#">{$_("project.about.learnMore")}</a>
        </p>
    </div>
    <div class="flex flex-row gap-4">
        <img src={impactIco} alt="Impact" class="h-16 w-16" />
        <p class="text-gray-500">
            {$_("project.impact.description")}
            <a class="font-semibold" href="#">{$_("project.impact.learnMore")}</a>
        </p>
    </div>
</section>

<Tabs.Root value={currentTab} onValueChange={handleTabChange}>
    <Tabs.List>
        {#each tabs as tab}
            <Tabs.Trigger value={tab}>{$_(`project.tabs.${tab}`)}</Tabs.Trigger>
        {/each}
    </Tabs.List>
    <Tabs.Content value="rewards">
        <section class="bg-secondary p-8">
            <div class="mb-8 flex items-center justify-between">
                <h2 class="text-4xl font-bold text-primary-foreground">{$_("reward.headline")}</h2>
            </div>

            <div class="grid gap-6 md:grid-cols-3">
                {#each rewards as reward}
                    <RewardCard size="lg" projectId={project.id} {...reward} />
                {/each}
            </div>
        </section>
    </Tabs.Content>
    <Tabs.Content value="project">
        <section class="bg-secondary p-32">
            <div class="prose prose-lg m-auto max-w-4xl">
                {@html renderMarkdown(project.description)}
            </div>
        </section>
    </Tabs.Content>
    <Tabs.Content value="budget">
        <section class="flex flex-col gap-8 bg-secondary p-8">
            <div class="flex flex-row gap-4">
                <h2 class="basis-1/3 text-4xl font-bold text-primary-foreground">
                    {$_("budget.headline")}
                </h2>
                <FundingChart minimum={campaign.minimum} optimal={campaign.optimum} />
            </div>
            <div class="space-y-8">
                {#each Object.entries(groupedBudgets) as [type, budgetGroup]}
                    <div class="space-y-4">
                        <h3 class="text-2xl font-semibold text-primary-foreground">
                            {$_(`budget.${type}`)}
                        </h3>
                        <div class="flex flex-row gap-4 overflow-x-auto">
                            {#each budgetGroup as budget}
                                <ProjectBudget {...budget} />
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </section>
    </Tabs.Content>
    <Tabs.Content value="updates">
        <section class="min-h-96 bg-secondary p-8 py-16">
            <div class="mb-8 flex items-center justify-between">
                <h2 class="max-w-2xl text-4xl font-bold text-primary-foreground">
                    {$_("updates.heading")}
                </h2>
            </div>
            <div class="flex flex-row gap-4 overflow-x-auto">
                {#if update}
                    <div class="flex-none">
                        <UpdateCard {...update} />
                    </div>
                    {#if updates.length > 0}
                        <div class="flex w-auto flex-row gap-4">
                            {#each updates as update}
                                <UpdateCard {...update} />
                            {/each}
                        </div>
                    {:else}
                        <p class="border-l border-slate-950 pl-6 text-6xl">
                            {$_("updates.empty")}
                        </p>
                    {/if}
                {:else}
                    <p class="border-l border-slate-950 pl-6 text-6xl">
                        {$_("updates.empty")}
                    </p>
                {/if}
            </div>
        </section>
    </Tabs.Content>
    <Tabs.Content value="community">
        <section class="min-h-96 bg-secondary p-8">
            <div class="mb-8 flex items-center justify-between">
                <h2 class="text-4xl font-bold text-primary-foreground">Comunidad</h2>
            </div>
        </section>
    </Tabs.Content>
</Tabs.Root>
