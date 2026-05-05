import type { StorybookConfig } from '@storybook/svelte-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|ts|svelte)"
  ],
  "addons": [
    "@storybook/addon-svelte-csf"
  ],
  "framework": "@storybook/svelte-vite",
  async viteFinal(config) {
    config.plugins = [
      svelte(),
      ...(config.plugins || []),
    ];

    return config;
  }
};
export default config;