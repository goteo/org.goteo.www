<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Clock } from "lucide-svelte";

  import type { PageProps } from "./$types";

  import { Button } from "$lib/components/ui/button";
  import CampaignProgress from "$lib/components/CampaignProgress/CampaignProgress.svelte";
  import LocaleSwitcher from "$lib/components/LocaleSwitcher/LocaleSwitcher.svelte";
  import Player from "$lib/components/Player";

  let { data }: PageProps = $props();
  let { project } = data;
</script>

<section class="flex flex-col gap-8">
  <div class="grid grid-flow-col gap-8">
    <div class="space-y-4">
      <p class="text-gray-600 text-2xl">Campaña de crowfunding impulsada por Climática</p>
      <h1 class="text-5xl font-bold">Apoya la cooperativa de información Climática</h1>
      <p class="text-gray-600 max-w-3xl">
        Si crees que los medios deben informar sobre la crisis climática señalando a los culpables en lugar de lavar su
        imagen, apoya a Climática
      </p>
    </div>
    <div class="flex flex-col items-end justify-between">
      <LocaleSwitcher locales={project.locales} />
      <div class="flex items-center gap-2 text-2xl text-primary-foreground font-medium">
        <Clock size={32} />
        <span>Quedan 16d 23h 57m</span>
      </div>
    </div>
  </div>

  <div class="grid grid-flow-col gap-8">
    <Player
      src="https://files.vidstack.io/sprite-fight/720p.mp4"
      title="Sprite Fight"
      thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
      poster={{
        src: "https://files.vidstack.io/sprite-fight/poster.webp",
        alt: "Girl walks into campfire with gnomes surrounding her friend ready for their next meal!",
      }}
    />
    <CampaignProgress {...project} />
  </div>
</section>

<section>
  <div class="flex justify-between items-center mb-8">
    <h2 class="text-2xl font-bold">Recompensas más populares</h2>
    <Button variant="link">Ver todas</Button>
  </div>

  <div class="grid md:grid-cols-3 gap-6"></div>
</section>
