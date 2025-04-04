<script lang="ts">
    import type { Project } from "../../openapi/client/index";
    import Tags from "../Tags.svelte";
    import { getTerritoryTag } from "../../utils/getTerritoryTag";
    import Countdown from "../Countdown.svelte";
    import Card from "./Card.svelte";
    import Player from "../Player/Player.svelte";
    import Rewards from "../Rewards.svelte";
    import { t } from "../../i18n/store";

    export let data: Project;
    let poster = { src: data.video?.thumbnail || "", alt: "Miniatura del video" };

    const getOwner = () => {
        return "My Org Example";
    };

    const tags = { categoryTag: data.category, territoryTag: getTerritoryTag(data.territory) };
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
                    {data.title} <span>{getOwner()}</span>
                </h1>
            </div>

            <p class=" text-[#575757]">{data.description}</p>
        </div>

        <div class="flex min-w-[300px]">
            <Countdown />
        </div>
    </div>
    <div class="flex items-stretch justify-between gap-6">
        <div class="h-full w-[70%]">
            <Player
                src={data.video?.src || ""}
                title={data.title || ""}
                thumbnails={data.video?.thumbnail || ""}
                {poster}
            />
        </div>
        <div class="h-full w-[30%]">
            <Card {data} />
        </div>
    </div>

    <Tags {tags} />

    <div>Recompensas más populares</div>
    <Rewards {data} />
</section>
