<script lang="ts">
    import { onMount } from "svelte";
    import type { ProjectReward, Project } from "../../openapi/client/index";
    import { apiProjectRewardsGetCollection } from "../../openapi/client/index";
    import Rewards from "../Rewards.svelte";

    let { project } = $props<{ project: Project }>();
    let projectsRewards: ProjectReward[] = $state([]);

    onMount(async () => {
        try {
            const { data } = await apiProjectRewardsGetCollection({
                query: {
                    project: `/v4/projects/${project.id}`,
                    "order[money.amount]": "asc",
                },
            });
            projectsRewards = data || [];
        } catch (error) {
            console.error("Error fetching project rewards:", error);
        }
    });
</script>

<Rewards {project} rewards={projectsRewards} />
