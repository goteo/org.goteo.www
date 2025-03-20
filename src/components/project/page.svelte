<script lang="ts">
    import type { Project } from "../../openapi/client/index";
    import Countdown from "../Countdown.svelte";
    import ProgressChart from "./ProgressChart.svelte";
    import Player from "../Player/Player.svelte";
    import { t } from "../../i18n/store";

    export let data: Project;
    let poster = { src: data.video?.thumbnail || "", alt: "Miniatura del video" };

    const getOwner = () => {
        return "My Org Example";
    };
</script>

<section class="wrapper">
    <div>
        <div>
            <h3>{$t("project.owner")} {getOwner()}</h3>
            <h1>{data.title} {getOwner()}</h1>
            <p>{data.description}</p>
        </div>
        <div>
            <Countdown />
        </div>

        <div>
            <div>
                <Player
                    src={data.video?.src || ""}
                    title={data.title || ""}
                    thumbnails={data.video?.thumbnail || ""}
                    {poster}
                />
            </div>
            <div>card</div>
        </div>
        <div><ProgressChart /></div>

        <div>tags</div>

        <div>Recompensas más populares</div>
    </div>
</section>
