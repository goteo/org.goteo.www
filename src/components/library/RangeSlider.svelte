<script lang="ts">
    import RangeSlider from "svelte-range-slider-pips";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        min?: number;
        max?: number;
        values?: number[];
    }

    let {
        class: classes = "",
        min = 0,
        max = 50000,
        values = $bindable([17000, 34000]),
    }: Props = $props();

    const formatCurrency = (value: number) => {
        return `${value.toLocaleString("es-ES")}€`;
    };
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
        formatter={formatCurrency}
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
