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

        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: "todo",
        },
    },
};

export default preview;
