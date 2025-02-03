<script lang="ts">
  import { _ } from "svelte-i18n";
  import LocaleSwitcher from "../components/LocaleSwitcher.svelte";
</script>

<h1 class="text-3xl font-bold underline">{$_("greeting")}</h1>
<p>{$_("farewell")}</p>
<LocaleSwitcher />

<style>
  @reference "tailwindcss/theme";
  :global(html) {
    background-color: theme(--color-gray-100);
  }
</style>
