<!--
Filter Dropdown Component
Reusable dropdown for filter options matching Figma design
Supports: Periodo de tiempo, Estado de la campaña, Ubicación
-->
<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { t } from "../../i18n/store";
    import ChevronDown from "../../svgs/ChevronDown.svelte";

    interface DropdownOption {
        value: string;
        label: string;
        translationKey?: string;
    }

    interface Props extends HTMLButtonAttributes {
        options: DropdownOption[];
        placeholder?: string;
        selectedValue?: string;
        onSelect?: (value: string) => void;
        label?: string;
    }

    let {
        options = [],
        placeholder = "",
        selectedValue = "",
        onSelect,
        label = "",
        class: className = "",
        ...props
    }: Props = $props();

    let isOpen = $state(false);
    let selectedOption = $state<DropdownOption | null>(
        options.find((opt) => opt.value === selectedValue) || null,
    );

    // Keep local state in sync with prop changes (important for SSR hydration)
    $effect(() => {
        selectedOption = options.find((opt) => opt.value === selectedValue) || null;
    });

    // Generate unique ID for accessibility
    const dropdownId = Math.random().toString(36).substring(2, 15);

    function toggleDropdown() {
        isOpen = !isOpen;
    }

    function selectOption(option: DropdownOption) {
        selectedOption = option;
        isOpen = false;
        onSelect?.(option.value);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleDropdown();
        } else if (event.key === "Escape") {
            isOpen = false;
        }
    }

    // Get display text for selected option or placeholder
    function getDisplayText() {
        if (selectedOption) {
            return selectedOption.translationKey
                ? $t(selectedOption.translationKey)
                : selectedOption.label;
        }
        return placeholder || $t("filters.selectOption");
    }
</script>

<div class="relative w-full">
    {#if label}
        <label for="dropdown-{dropdownId}" class="mb-2 block text-sm font-medium text-[#462949]">
            {label}
        </label>
    {/if}

    <button
        id="dropdown-{dropdownId}"
        type="button"
        onclick={toggleDropdown}
        onkeydown={handleKeydown}
        class="flex w-full items-center justify-between rounded-[8px] border border-[#462949] bg-[#fbfbfb] px-4 py-4 font-['Karla'] text-base text-[#3d3d3d] focus:border-[#59e9d3] focus:ring-2 focus:ring-[#59e9d3] focus:outline-none {className}"
        class:opacity-48={!selectedOption}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label || placeholder}
        {...props}
    >
        <span class="truncate">
            {getDisplayText()}
        </span>
        <ChevronDown rotate={isOpen} />
    </button>

    {#if isOpen}
        <div
            class="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-[8px] border border-[#462949] bg-white shadow-lg"
            data-testid={`${props["data-testid"] || "filter"}-dropdown`}
        >
            <div class="py-1" role="listbox">
                {#each options as option}
                    <button
                        type="button"
                        class="w-full px-4 py-3 text-left font-['Karla'] text-[#3d3d3d] hover:bg-[#e6e5f7] focus:bg-[#e6e5f7] focus:outline-none"
                        class:bg-[#e6e5f7]={selectedOption?.value === option.value}
                        onclick={() => selectOption(option)}
                        role="option"
                        aria-selected={selectedOption?.value === option.value}
                        data-testid={`${props["data-testid"] || "filter"}-option-${option.value}`}
                    >
                        {option.translationKey ? $t(option.translationKey) : option.label}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>

<!-- Click outside to close dropdown -->
<svelte:window
    onclick={(e) => {
        const target = e.target as Element;
        const dropdown =
            target?.closest?.('[role="listbox"]') ||
            target?.closest?.('button[aria-haspopup="listbox"]');
        if (!dropdown && isOpen) {
            isOpen = false;
        }
    }}
/>
