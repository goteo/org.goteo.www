<script lang="ts">
  import type { PageData } from "./$types.js";
  import RegisterFrom from "./RegisterFrom.svelte";
  export let data: PageData;
</script>

<RegisterFrom data={data.form} />
