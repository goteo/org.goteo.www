<script lang="ts">
    import { _ } from "svelte-i18n";
    import LocaleSwitcher from "$lib/components/LocaleSwitcher/LocaleSwitcher.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    $: loading = !data.locales || data.locales.length === 0;
</script>

<div class="p-4">
    <LocaleSwitcher locales={data.locales} {loading} />
    <h1 class="mt-4 text-3xl font-bold underline">{$_("greeting")}</h1>
    <p class="mt-2">{$_("farewell")}</p>
    <p class="mt-2">Current locale: {data.locale}</p>

    <hr />
    <ul>
        <li><a href="/projects/252">/projects/252</a></li>
        <li><a href="/projects/246">/projects/246</a></li>
        <li><a href="/projects/234">/projects/234</a></li>
        <li><a href="/projects/231">/projects/231</a></li>
    </ul>
</div>
