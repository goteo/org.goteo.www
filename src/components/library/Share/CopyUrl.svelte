<script lang="ts">
    import { t } from "../../../i18n/store";
    import Tooltip from "../../Admin/Tooltip.svelte";
    import WebIcon from "../../icons/Web.svelte";

    interface Props {
        url?: string;
    }

    let { url = "" }: Props = $props();
</script>

<Tooltip
    text={$t("contributions.tootip.copied")}
    tooltipClass="bg-secondary -translate-x-[50%]"
    className="cursor-copy shrink-0 w-auto h-auto"
>
    <button
        class="flex h-23 w-23 items-center justify-center rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
        onclick={() => navigator.clipboard.writeText(url)}
    >
        <WebIcon />
    </button>
</Tooltip>
