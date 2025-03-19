<script>
    import Countdown from "../Countdown.svelte";
    import ProgressChart from "./ProgressChart.svelte";
    export let data;
</script>

<section class="wrapper">
    <div>
        <div>
            <h3>{data.subtitle}</h3>
            <h1>{data.title}</h1>
            <p>{data.description}</p>
        </div>
        <div>
            <Countdown />
        </div>

        <div>
            <div>
                <iframe
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/GyTWubZyegQ"
                    title="YouTube video player"
                    frameborder="0"
                    allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                >
                </iframe>
            </div>

            <div>card</div>
        </div>
        <div><ProgressChart /></div>

        <div>tags</div>

        <div>Recompensas más populares</div>
    </div>
</section>
