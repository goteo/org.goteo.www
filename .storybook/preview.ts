import type { Preview } from "@storybook/svelte-vite";
// @ts-expect-error no CSS type declarations
import "../src/styles/global.css";

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
