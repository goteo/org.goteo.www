<script lang="ts">
    import {
        apiProjectRewardsGetCollection,
        type Project,
        type ProjectReward,
    } from "../../openapi/client";
    import TopReward from "../TopReward.svelte";

    let {
        lang = $bindable(),
        project,
    }: {
        lang: string;
        project: Project;
    } = $props();

    let rewards: ProjectReward[] = $state([]);

    $effect(() => {
        apiProjectRewardsGetCollection({
            query: { project: project.id!.toString(), itemsPerPage: 3 },
            headers: { "Accept-Language": lang },
        }).then((data) => {
            rewards = data.data!;
        });
    });
</script>

<ul class="flex flex-col gap-6 lg:flex-row">
    {#each rewards as reward}
        <TopReward {reward} {project} />
    {/each}
</ul>
