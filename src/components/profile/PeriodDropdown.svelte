<script lang="ts">
    import { t } from "../../i18n/store";
    import ChevronDown from "../../svgs/ChevronDown.svelte";

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
        class="border-secondary focus:ring-secondary bg-white h-full w-full cursor-pointer rounded-lg border pr-12 pl-4 text-base leading-normal text-black focus:border-transparent focus:ring-2 focus:outline-none"
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
        class="bg-white pointer-events-none absolute -top-[5px] left-3 px-1 text-xs leading-none font-medium text-black"
    >
        {$t("me.period.label")}
    </label>

    <!-- Dropdown icon -->
    <div class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
        <ChevronDown />
    </div>
</div>
