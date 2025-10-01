<script lang="ts">
    interface Props {
        hasProjects: boolean;
    }

    let { hasProjects }: Props = $props();
</script>

{#if hasProjects}
    <slot />
{:else}
    <div class="mx-auto mt-10 w-full max-w-[898px] px-4 text-center">
        <p class="text-secondary text-base">No hay proyectos impulsados aún.</p>
    </div>
{/if}
