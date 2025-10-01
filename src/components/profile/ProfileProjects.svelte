<script lang="ts">
    import { t } from "../../i18n/store";
    import type { Snippet } from "svelte";

    interface Props {
        hasProjects: boolean;
        children?: Snippet;
    }

    let { hasProjects, children }: Props = $props();
</script>

{#if hasProjects}
    {#if children}
        {@render children()}
    {/if}
{:else}
    <div class="mx-auto mt-10 w-full max-w-[898px] px-4 text-center">
        <p class="text-secondary text-base">{$t("profile.noProjects")}</p>
    </div>
{/if}
