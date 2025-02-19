<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Clock } from "lucide-svelte";

  import type { PageProps } from "./$types";

  import { Button } from "$lib/components/ui/button";
  import CampaignProgress from "$lib/components/CampaignProgress/CampaignProgress.svelte";
  import LocaleSwitcher from "$lib/components/LocaleSwitcher/LocaleSwitcher.svelte";

  let { data }: PageProps = $props();
  let { project, extra } = data;
</script>

<section class="flex flex-col gap-8">
  <div class="grid grid-flow-col gap-8">
    <div class="space-y-4">
      <p class="text-gray-600 text-2xl">Campaña de crowfunding impulsada por Climática</p>
      <h1 class="text-5xl font-bold">{ project.title }</h1>
      <p class="text-gray-600 max-w-3xl">{project.subtitle}</p>
    </div>
    <div class="flex flex-col items-end justify-between">
      <LocaleSwitcher locales={extra.locales} />
      <div class="flex items-center gap-2 text-2xl text-primary-foreground font-medium">
        <Clock size={32} />
        <span>Quedan 16d 23h 57m</span>
      </div>
    </div>
  </div>

  <div class="grid grid-flow-col gap-8">
    <div class="bg-[#F3FF73] rounded-lg aspect-video relative">
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
          <div class="w-0 h-0 border-l-[20px] border-l-gray-800 border-y-[12px] border-y-transparent ml-1" ></div>
        </div>
      </div>
    </div>
    <CampaignProgress {...extra} />
  </div>
</section>

<section>
  <div class="flex justify-between items-center mb-8">
    <h2 class="text-2xl font-bold">Recompensas más populares</h2>
    <Button variant="link">Ver todas</Button>
  </div>

  <div class="grid md:grid-cols-3 gap-6"></div>
</section>
