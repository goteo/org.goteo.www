<script lang="ts">
    import Bag from "../components/icons/Bag.svelte";
    import { cartCount } from "../stores/cart";
</script>

<a href="/checkout">
    <Bag items={$cartCount > 1 ? $cartCount : undefined} />
</a>
