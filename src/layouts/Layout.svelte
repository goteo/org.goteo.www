<script lang="ts">
    import "../styles/global.css";
    import Footer from "./Footer.svelte";
    import Header from "./Header.svelte";
    import Metatags from "./Metatags.svelte";

    const { title, description, class: className, children } = $props();
</script>

<svelte:head>
    <meta charset="UTF-8" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>{title}</title>
    <Metatags {title} {description} />
</svelte:head>

<Header />
<main class={`flex w-full max-w-screen flex-1 flex-col${className ? ` ${className}` : ""}`}>
    {@render children()}
</main>
<Footer />
