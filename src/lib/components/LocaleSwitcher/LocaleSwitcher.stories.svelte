<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LocaleSwitcher from "./LocaleSwitcher.svelte";

  const { Story } = defineMeta({
    component: LocaleSwitcher,
  });
</script>

<Story name="Base" />
