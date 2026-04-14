<script lang="ts">
    import { t } from "../i18n/store";
    import { itemCount } from "../stores/cart";
    import BagIcon from "../svgs/BagIcon.svelte";
</script>

<a
    href="/checkout"
    class="group relative inline-flex cursor-pointer items-center"
    aria-label={$t("domain.header.goToCheckout")}
>
    <BagIcon />

    {#if $itemCount > 0}
        <span
            class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
        >
            {$itemCount}
        </span>
    {/if}
</a>
