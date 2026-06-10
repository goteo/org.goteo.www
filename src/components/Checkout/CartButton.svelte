<script lang="ts">
    import { cartCount } from "../../stores/cart";
    import Bag from "../icons/Bag.svelte";
</script>

<a href="/checkout">
    <Bag items={$cartCount > 1 ? $cartCount : undefined} />
</a>
