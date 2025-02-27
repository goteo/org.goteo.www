<script lang="ts">
  import "@fontsource-variable/karla";
  import "../app.css";

  import { locale } from "svelte-i18n";

  import { page } from "$app/state";
  import Header from "$lib/components/Header";

  $: {
    const currentLocale = page.data.locale;
    if (currentLocale) {
      locale.set(currentLocale);
    }
  }

  console.debug("/+layout", page.data);
</script>

<Header />
<slot />
