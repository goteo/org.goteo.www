<script lang="ts">
    import { t } from "../../i18n/store";

    interface Props {
        hasProjects: boolean;
    }

    let { hasProjects }: Props = $props();
</script>

{#if hasProjects}
    <slot />
{:else}
    <div class="mx-auto mt-10 w-full max-w-[898px] px-4 text-center">
        <p class="text-secondary text-base">{$t("profile.noProjects")}</p>
    </div>
{/if}
