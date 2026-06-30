<script lang="ts">
    import ProjectCommunitySponsorCard from "./ProjectCommunitySponsorCard.svelte";

    let { item, openModal = $bindable(), selectedProjectSupport = $bindable() } = $props();
</script>

<ProjectCommunitySponsorCard
    {item}
    onclick={() => {
        selectedProjectSupport = item;
        openModal = true;
    }}
/>
