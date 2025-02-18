<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Clock } from "lucide-svelte";

  import type { PageProps } from "./$types";

  import { Button } from "$lib/components/ui/button";
  import CampaignProgress from "$lib/components/CampaignProgress/CampaignProgress.svelte";
  import LocaleSwitcher from "$lib/components/LocaleSwitcher/LocaleSwitcher.svelte";
  import Player from "$lib/components/Player";
  import RewardCard from "$lib/components/RewardCard";
  import * as Tabs from "$lib/components/ui/tabs";

  let { data }: PageProps = $props();
  let { locales, campaign, video, rewards } = data;
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
      <LocaleSwitcher {locales} />
      <div class="flex items-center gap-2 text-2xl text-primary-foreground font-medium">
        <Clock size={32} />
        <span>Quedan 16d 23h 57m</span>
      </div>
    </div>
  </div>

  <div class="grid grid-flow-col gap-8">
    <Player {...video} />
    <CampaignProgress {...campaign} />
  </div>
</section>

<section>
  <div class="flex justify-between items-center mb-8">
    <h2 class="text-2xl font-bold">Recompensas más populares</h2>
    <Button variant="link">Ver todas</Button>
  </div>

  <div class="grid md:grid-cols-3 gap-6">
    {#each rewards.slice(0, 3) as reward}
      <RewardCard size="sm" {...reward} />
    {/each}
  </div>
</section>

<Tabs.Root value="project" class="">
  <Tabs.List>
    <Tabs.Trigger value="project">Información de campaña</Tabs.Trigger>
    <Tabs.Trigger value="budget">Necesidades</Tabs.Trigger>
    <Tabs.Trigger value="rewards">Recompensas</Tabs.Trigger>
    <Tabs.Trigger value="updates">Actualizaciones</Tabs.Trigger>
    <Tabs.Trigger value="community">Comunidad</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="project"></Tabs.Content>
  <Tabs.Content value="budget">Change your password here.</Tabs.Content>
  <Tabs.Content value="rewards">
    <section class="bg-secondary p-8">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-4xl font-bold text-primary-foreground">Selecciona tu recompensa</h2>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        {#each rewards as reward}
          <RewardCard size="lg" {...reward} />
        {/each}
      </div>
    </section>
  </Tabs.Content>
  <Tabs.Content value="updates">Change your password here.</Tabs.Content>
  <Tabs.Content value="community">Change your password here.</Tabs.Content>
</Tabs.Root>
