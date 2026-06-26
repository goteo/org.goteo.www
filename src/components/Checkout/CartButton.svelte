<script lang="ts">
    import { cartCount } from "../../stores/cart";
    import Bag from "../icons/commerce/Bag.svelte";
</script>

<a href="/checkout">
    <Bag items={$cartCount > 1 ? $cartCount : undefined} />
</a>
