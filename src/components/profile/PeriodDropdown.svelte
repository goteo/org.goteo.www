<script lang="ts">
    import { t } from "../../i18n/store";
    import Chevron from "../icons/Chevron.svelte";

    interface Props {
        /**
         * Currently selected period (year as string)
         */
        selectedPeriod: string;

        /**
         * Callback when period changes
         */
        onChange?: (period: string) => void;
    }

    let { selectedPeriod = new Date().getFullYear().toString(), onChange }: Props = $props();

    // Generate year options (current year - 10 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    function handleChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        onChange?.(select.value);
    }
</script>

<div class="relative h-14 w-52">
    <select
        id="period-select"
        class="border-secondary focus:ring-secondary h-full w-full cursor-pointer rounded-lg border bg-white pr-12 pl-4 text-base leading-normal text-black focus:border-transparent focus:ring-2 focus:outline-none"
        style="appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: none;"
        value={selectedPeriod}
        onchange={handleChange}
        aria-label={$t("me.period.label")}
    >
        {#each years as year}
            <option value={year.toString()}>
                {$t("me.period.year", { year })}
            </option>
        {/each}
    </select>

    <label
        for="period-select"
        class="pointer-events-none absolute -top-1.25 left-3 bg-white px-1 text-xs leading-none font-medium text-black"
    >
        {$t("me.period.label")}
    </label>

    <!-- Dropdown icon -->
    <div class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
        <Chevron direction="down" width="16" height="16" />
    </div>
</div>
