import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

import type { StorybookConfig } from "@storybook/svelte-vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.stories.@(js|ts|svelte)"],
    addons: ["@storybook/addon-svelte-csf"],
    framework: "@storybook/svelte-vite",
    async viteFinal(config) {
        config.plugins = [tailwindcss(), svelte(), ...(config.plugins || [])];

        return config;
    },
};
export default config;
