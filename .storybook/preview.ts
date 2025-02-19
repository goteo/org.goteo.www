import type { Preview } from "@storybook/svelte";
import "../src/app.css";
import { addons } from "@storybook/preview-api";
import { STORY_RENDERED } from "@storybook/core-events";
import { init, register, getLocaleFromNavigator } from "svelte-i18n";

register("en", () => import("../src/lib/i18n/locales/en.json"));
register("es", () => import("../src/lib/i18n/locales/es.json"));

init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator(),
});

addons.getChannel().emit(STORY_RENDERED);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
