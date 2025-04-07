<script lang="ts">
    import type { Project } from "../../openapi/client/index";
    import Tags from "../Tags.svelte";
    import { getTerritoryTag } from "../../utils/getTerritoryTag";
    import Countdown from "../Countdown.svelte";
    import Card from "./Card.svelte";
    import Player from "../Player/Player.svelte";
    import Rewards from "../Rewards.svelte";
    import { t } from "../../i18n/store";

    export let project: Project;
    let poster = { src: project.video?.thumbnail || "", alt: "Miniatura del video" };

    const getOwner = () => {
        return "My Org Example";
    };

    const tags = {
        categoryTag: project.category,
        territoryTag: getTerritoryTag(project.territory),
    };
</script>

<section class="wrapper">
    <div class=" my-10 flex flex-row justify-between gap-5">
        <div class="flex flex-col gap-2.5">
            <div class="flex flex-col gap-2">
                <h3 class="text-2xl/[32px] font-bold text-[#575757]">
                    {$t("project.owner")}
                    <span class="text-tertiary text-2xl font-bold underline"> {getOwner()}</span>
                </h3>
                <h1 class="text-[40px]/[48px] font-bold text-[#575757]">
                    {project.title} <span>{getOwner()}</span>
                </h1>
            </div>

            <p class=" text-[#575757]">{project.description}</p>
        </div>

        <div class="flex min-w-[300px]">
            <Countdown />
        </div>
    </div>
    <div class="flex items-stretch justify-between gap-6">
        <div class="h-full w-[70%]">
            <Player
                src={project.video?.src || ""}
                title={project.title || ""}
                thumbnails={project.video?.thumbnail || ""}
                {poster}
            />
        </div>
        <div class="h-full w-[30%]">
            <Card {project} />
        </div>
    </div>

    <Tags {tags} />

    <div>Recompensas más populares</div>
    <Rewards {project} />
</section>
