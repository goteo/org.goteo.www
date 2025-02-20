<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Clock, MoveRight, MapPin, Bookmark, Heart } from "lucide-svelte";
  import { onMount } from "svelte";

  import type { PageProps } from "./$types";

  import * as Tabs from "$lib/components/ui/tabs";
  import { Button } from "$lib/components/ui/button";

  import LocaleSwitcher from "$lib/components/LocaleSwitcher";
  import CampaignProgress from "$lib/components/CampaignProgress";
  import Player from "$lib/components/Player";
  import RewardCard from "$lib/components/RewardCard";
  import ShareButton from "$lib/components/ShareButton";
  import ProjectBudget from "$lib/components/ProjectBudget";

  let { data }: PageProps = $props();
  let { locales, campaign, video, rewards, budgets, project } = data;

  let currentTab = $state("rewards");

  function handleTabChange(value: string | undefined) {
    if (value) {
      currentTab = value;
      window.location.hash = value;
    }
  }

  onMount(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      currentTab = hash;
    }

    // Add event listener for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (newHash) {
        currentTab = newHash;
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    // Clean up the event listener when component is destroyed
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  });

  const tabs = ["project", "budget", "rewards", "updates", "community"] as const;
</script>

<section class="flex flex-col gap-8">
  <div class="grid grid-flow-col gap-8">
    <div class="space-y-4">
      <p class="text-gray-600 text-2xl">{project.subtitle}</p>
      <h1 class="text-5xl font-bold">{project.title}</h1>
      <p class="text-gray-600 max-w-3xl">{project.description}</p>
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
  <div class="flex justify-between items-center">
    <div class="flex gap-4">
      <Button variant="outline" size="sm" class="border-black"
        ><Bookmark class="mr-2" /> Periodismo independiente</Button
      >
      <Button variant="outline" size="sm" class="border-black"><MapPin class="mr-2" /> {project.territory}</Button>
    </div>
    <div class="flex gap-4">
      <ShareButton />
      <Button variant="ghost" size="sm"><Heart class="mr-2 h-4" /> {$_("project.actions.remember")}</Button>
    </div>
  </div>
</section>

<section>
  <div class="flex justify-between items-center mb-8">
    <h2 class="text-2xl font-bold">Recompensas más populares</h2>
    <Button variant="secondary" size="lg" href="#rewards">
      <MoveRight class="mr-4 h-6 w-6" />
      {$_("project.actions.viewAll")}
    </Button>
  </div>

  <div class="grid md:grid-cols-3 gap-6">
    {#each rewards.slice(0, 3) as reward}
      <RewardCard size="sm" {...reward} />
    {/each}
  </div>
</section>

<Tabs.Root value={currentTab} onValueChange={handleTabChange}>
  <Tabs.List>
    {#each tabs as tab}
      <Tabs.Trigger value={tab}>{$_(`project.tabs.${tab}`)}</Tabs.Trigger>
    {/each}
  </Tabs.List>
  <Tabs.Content value="project">
    <section class="bg-secondary p-8 min-h-96">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-4xl font-bold text-primary-foreground">Información de campaña</h2>
      </div>
    </section>
  </Tabs.Content>
  <Tabs.Content value="budget">
    <section class="bg-secondary p-8 min-h-96">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-4xl font-bold text-primary-foreground">Necesidades</h2>
      </div>
      <div>
        {#each budgets as budget}
          <ProjectBudget {...budget} />
        {/each}
      </div>
    </section>
  </Tabs.Content>
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
  <Tabs.Content value="updates">
    <section class="bg-secondary p-8 min-h-96">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-4xl font-bold text-primary-foreground">Actualizaciones</h2>
      </div>
    </section>
  </Tabs.Content>
  <Tabs.Content value="community">
    <section class="bg-secondary p-8 min-h-96">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-4xl font-bold text-primary-foreground">Comunidad</h2>
      </div>
    </section>
  </Tabs.Content>
</Tabs.Root>
