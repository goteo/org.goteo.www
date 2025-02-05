<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LocaleSwitcher from "./LocaleSwitcher.svelte";

  const { Story } = defineMeta({
    component: LocaleSwitcher,
  });

  // Mock fetch for storybook
  global.fetch = async () => ({
    json: async () => ({
      locales: [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'ca', label: 'Català' }
      ]
    })
  });
</script>

<Story name="Base" />
