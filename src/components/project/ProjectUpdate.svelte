<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import type { Project, ProjectUpdate } from "../../openapi/client/index";
    import { apiProjectUpdatesGetCollection } from "../../openapi/client/index";
    import Slider from "./Slider.svelte";

    const { project } = $props<{ project: Project }>();
    let projectsUpdates: ProjectUpdate[] = $state([]);

    onMount(async () => {
        const { data } = await apiProjectUpdatesGetCollection({
            query: { project: `/v4/projects/${project.id}` },
        });
        console.log("DATA:", data);
        projectsUpdates = data || [];
    });
</script>

<Slider slides={projectsUpdates} />
