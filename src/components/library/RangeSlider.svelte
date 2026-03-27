<script lang="ts">
    import RangeSlider from "svelte-range-slider-pips";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { formatCurrency } from "../../utils/currencies";

    interface Props {
        class?: ClassNameValue;
        min?: number;
        max?: number;
        values?: number[];
        currency?: string;
    }

    let {
        class: classes = "",
        min = 0,
        max = 4294967295,
        values = $bindable([0, 4294967295]),
        currency = undefined,
    }: Props = $props();
</script>

<div class={twMerge("slider-custom-theme", classes)}>
    <RangeSlider
        bind:values
        {min}
        {max}
        range={true}
        float={true}
        pips={true}
        first="label"
        last="label"
        rest={false}
        formatter={(value: number) => formatCurrency(value, currency)}
    />
</div>

<style>
    :global(.slider-custom-theme .rangeSlider) {
        --range-slider: var(--color-grey);
        --range-range-inactive: var(--color-grey);
        --range-range: var(--color-primary);
        --range-handle: var(--color-primary);
        --range-handle-focus: var(--color-primary);
        --range-handle-inactive: var(--color-primary);
        --range-float: var(--color-secondary);
        --range-float-text: var(--color-white);
        --range-pip-text: var(--color-content);
    }
</style>
