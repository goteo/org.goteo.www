<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Header from "./Header.svelte";

  const { Story } = defineMeta({
    component: Header,
  });
</script>

<Story name="Base" />
