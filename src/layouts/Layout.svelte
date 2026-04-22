<script lang="ts">
    import Footer from "./Footer.svelte";
    import Header from "./Header.svelte";

    const { title, description, class: className, children } = $props();
</script>

<Header />
<main class={`flex w-full max-w-screen flex-1 flex-col${className ? ` ${className}` : ""}`}>
    {@render children()}
</main>
<Footer />
