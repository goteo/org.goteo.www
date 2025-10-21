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

<div class="relative h-[56px] w-[207px] md:w-[207px]">
    <select
        id="period-select"
        class="h-full w-full cursor-pointer rounded-lg border border-[#462949] bg-white pr-12 pl-4 font-['Karla'] text-[16px] leading-[24px] text-[#3d3d3d] focus:border-transparent focus:ring-2 focus:ring-[#462949] focus:outline-none"
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
        class="pointer-events-none absolute -top-[4.75px] left-[11.5px] bg-white px-1 font-['Karla'] text-[12px] leading-[16px] font-medium text-[#3d3d3d]"
    >
        {$t("me.period.label")}
    </label>

    <!-- Dropdown icon -->
    <div class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
        <ChevronDown />
    </div>
</div>
