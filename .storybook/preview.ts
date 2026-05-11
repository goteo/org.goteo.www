import type { Preview } from "@storybook/svelte-vite";
// @ts-expect-error no CSS type declarations
import "../src/styles/global.css";
// @ts-expect-error no CSS type declarations
import "svelte-range-slider-pips/dist/range-slider-pips.css";

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
