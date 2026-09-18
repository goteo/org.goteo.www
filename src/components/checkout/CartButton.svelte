<script lang="ts">
    import { cartCount } from "../../stores/checkoutsStore";
    import Bag from "../icons/commerce/Bag.svelte";
</script>

<a href="/checkout">
    <Bag items={$cartCount > 0 ? $cartCount : undefined} />
</a>
