<script lang="ts">
  import { isLoading } from "svelte-i18n";
  import "../app.css";
</script>

{#if $isLoading}
  <div class="loading">Loading...</div>
{:else}
  <slot />
{/if}

<style>
  .loading {
    display: grid;
    place-items: center;
    height: 100vh;
  }
</style>
