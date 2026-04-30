<script lang="ts">
    import Bag from "../components/icons/Bag.svelte";
    import { t } from "../i18n/store";
    import { itemCount } from "../stores/cart";

    const browser = typeof window !== "undefined";

    let count = 0;

    $: if (browser) {
        count = $itemCount;
    }

    function handleDirect() {
        if (!browser) return;
        window.location.href = `/checkout`;
    }
</script>

<button
    type="button"
    on:click={handleDirect}
    class="group relative inline-flex cursor-pointer items-center"
    aria-label={$t("header.btnCart")}
>
    <Bag items={count > 1 ? count : undefined} />
</button>
