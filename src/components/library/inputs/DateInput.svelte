<script lang="ts">
    import { Datepicker } from "flowbite-svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { locale, t } from "../../../i18n/store";
    import Calendar from "../../icons/Calendar.svelte";
    import Close from "../../icons/navigation/Close.svelte";

    let {
        value = $bindable(new Date()),
        id = undefined,
        name = undefined,
        required = false,
        disabled = false,
        min = undefined,
        max = undefined,
        class: className = "",
        labelText = undefined,
        helperText = undefined,
        error = undefined,
        onBlur = undefined,
        onInput = undefined,
        onApply = undefined,
    }: {
        value?: Date;
        id?: string;
        name?: string;
        required?: boolean;
        disabled?: boolean;
        min?: Date | string;
        max?: Date | string;
        class?: ClassNameValue;
        labelText?: string;
        helperText?: string;
        error?: string;
        onBlur?: () => void;
        onInput?: (date: string) => void;
        onApply?: (date: Date) => void;
    } = $props();

    const generatedId = $props.id();
    const finalId = $derived(id ?? generatedId);

    const minDate = $derived(min ? new Date(min) : undefined);
    const maxDate = $derived(max ? new Date(max) : undefined);

    const valueString = $derived(dateToString(value));

    let open = $state(false);
    let container: HTMLDivElement;

    const displayValue = $derived(
        value && !isNaN(value.getTime()) ? value.toLocaleDateString($locale) : "",
    );

    function dateToString(date: Date): string {
        if (!date || isNaN(date.getTime())) {
            return "";
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function isOutOfRange(date: Date): boolean {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    }

    let lastValid = value;

    function handleSelect(selected: Date) {
        if (isOutOfRange(selected)) {
            value = lastValid;
            return;
        }
        lastValid = selected;
        onInput?.(dateToString(selected));
    }

    function toggle() {
        if (disabled) return;
        open = !open;
    }

    function apply() {
        onApply?.(value);
        onBlur?.();
        open = false;
    }

    function calendarMonth(root: HTMLElement): { year: number; month: number } | null {
        const text = root.querySelector('[aria-live="polite"]')?.textContent?.toLowerCase();
        const year = text?.match(/\d{4}/)?.[0];
        if (!text || !year) return null;
        for (let month = 0; month < 12; month++) {
            const name = new Intl.DateTimeFormat($locale, { month: "long" })
                .format(new Date(Number(year), month, 1))
                .toLowerCase();
            if (text.includes(name)) return { year: Number(year), month };
        }
        return null;
    }

    function daysForMonth(year: number, month: number): Date[] {
        const days: Date[] = [];
        const lead = new Date(year, month, 0).getDay();
        for (let i = 0; i < lead; i++) days.unshift(new Date(year, month, -i));
        const lastDate = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
        const remaining = 7 - (days.length % 7);
        if (remaining < 7)
            for (let i = 1; i <= remaining; i++) days.push(new Date(year, month + 1, i));
        return days;
    }

    function applyLimits() {
        if (!minDate && !maxDate) return;
        const root = container?.querySelector("#datepicker-dropdown") as HTMLElement | null;
        if (!root) return;
        const current = calendarMonth(root);
        if (!current) return;
        const days = daysForMonth(current.year, current.month);
        root.querySelectorAll<HTMLButtonElement>(".day").forEach((button, i) => {
            const out = days[i] ? isOutOfRange(days[i]) : false;
            button.disabled = out;
            button.classList.toggle("day-disabled", out);
        });
    }

    $effect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (container && !container.contains(event.target as Node)) open = false;
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    });

    $effect(() => {
        if (!open || (!minDate && !maxDate)) return;
        const root = container?.querySelector("#datepicker-dropdown");
        if (!root) return;
        applyLimits();
        const observer = new MutationObserver(() => applyLimits());
        observer.observe(root, { childList: true, subtree: true });
        return () => observer.disconnect();
    });

    $effect(() => {
        if (!open) return;
        const root = container?.querySelector("#datepicker-dropdown") as HTMLElement | null;
        const label = root?.querySelector('[aria-live="polite"]') as HTMLElement | null;
        if (!root || !label) return;
        const format = () => {
            const current = calendarMonth(root);
            if (!current) return;
            const month = new Intl.DateTimeFormat($locale, { month: "long" }).format(
                new Date(current.year, current.month, 1),
            );
            const desired = `${month.charAt(0).toUpperCase()}${month.slice(1)} ${current.year}`;
            const node = label.firstChild;
            if (node && node.nodeType === Node.TEXT_NODE) {
                if (node.nodeValue !== desired) node.nodeValue = desired;
            } else {
                label.textContent = desired;
            }
        };
        format();
        const observer = new MutationObserver(format);
        observer.observe(label, { childList: true, characterData: true, subtree: true });
        return () => observer.disconnect();
    });
</script>

<div bind:this={container} class={twMerge("relative", disabled && "opacity-40", className)}>
    {#if labelText}
        <label
            for={finalId}
            class="text-secondary absolute top-0 left-4 -translate-y-1/2 transform bg-white px-1 text-sm font-medium transition-all"
        >
            {labelText}
        </label>
    {/if}

    <button
        type="button"
        id={finalId}
        {disabled}
        onclick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={error ? `${finalId}-error` : helperText ? `helper-${finalId}` : undefined}
        class={twMerge(
            "border-secondary text-secondary flex w-full items-center justify-between rounded-md border bg-white p-4 text-base focus:outline-none",
            disabled && "cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
        )}
    >
        <span class={displayValue ? "" : "text-gray-400"}>{displayValue}</span>
        <Calendar class="text-secondary size-5" />
    </button>

    <input type="hidden" {name} {required} value={valueString} />

    {#if open}
        <div
            class="datepicker border-grey absolute left-0 z-20 mt-2 w-88 rounded-4xl border bg-white p-6 shadow-lg"
            role="dialog"
            aria-label={labelText}
        >
            <div class="flex items-center justify-between">
                <span class="text-content text-lg">
                    {labelText}
                </span>
                <button
                    type="button"
                    onclick={() => (open = false)}
                    aria-label={$t("common.dateInput.close")}
                >
                    <Close class="size-5 text-black" />
                </button>
            </div>

            <Datepicker
                inline
                bind:value
                {required}
                locale={$locale}
                firstDayOfWeek={0}
                color="primary"
                onselect={(v) => handleSelect(v as Date)}
                class="mt-4 block w-full rounded-none bg-transparent p-0 shadow-none"
            />

            <button
                type="button"
                onclick={apply}
                class="bg-primary text-secondary mt-6 h-14 w-full rounded-3xl text-lg font-bold"
            >
                {$t("common.dateInput.apply")}
            </button>
        </div>
    {/if}

    {#if helperText && !error}
        <span id={`helper-${finalId}`} class="text-content mt-1 ml-4 block text-xs">
            {helperText}
        </span>
    {/if}
    {#if error}
        <p id={`${finalId}-error`} class="mt-1 ml-4 text-xs text-red-600" role="alert">
            {error}
        </p>
    {/if}
</div>

<style>
    .datepicker :global(div:has(> #datepicker-dropdown)) {
        display: block;
        width: 100%;
    }

    .datepicker :global(#datepicker-dropdown) {
        display: block;
        width: 100%;
    }

    .datepicker :global(#datepicker-dropdown [role="dialog"]),
    .datepicker :global(#datepicker-dropdown > div:has([aria-live="polite"])) {
        width: 100%;
    }

    .datepicker :global(#datepicker-dropdown [aria-live="polite"]) {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-black);
        background: transparent;
        padding: 0;
    }

    .datepicker :global(#datepicker-dropdown [aria-label="Previous month"]),
    .datepicker :global(#datepicker-dropdown [aria-label="Next month"]) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        padding: 0;
        border: 1px solid var(--color-secondary);
        border-radius: 9999px;
        color: var(--color-secondary);
        background: transparent;
    }

    .datepicker :global(#datepicker-dropdown [role="columnheader"]) {
        color: var(--color-content);
        font-size: 1rem;
        font-weight: 400;
        text-transform: capitalize;
    }

    .datepicker :global(#datepicker-dropdown [role="grid"]) {
        width: 100%;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 0.25rem;
    }

    .datepicker :global(#datepicker-dropdown .day) {
        width: 100%;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1;
        height: auto;
        line-height: 1;
        border-radius: 0.5rem;
        background: var(--color-grey);
        color: var(--color-secondary);
        font-size: 1.125rem;
        cursor: pointer;
        transition:
            background-color 0.15s ease,
            color 0.15s ease;
    }

    .datepicker :global(#datepicker-dropdown .day:hover) {
        background: color-mix(in srgb, var(--color-secondary) 15%, transparent);
        color: var(--color-secondary);
    }

    .datepicker :global(#datepicker-dropdown .day.text-gray-400) {
        background: transparent;
        color: color-mix(in srgb, var(--color-content) 50%, transparent);
    }

    .datepicker :global(#datepicker-dropdown .day.text-gray-400:hover) {
        background: color-mix(in srgb, var(--color-content) 10%, transparent);
    }

    .datepicker :global(#datepicker-dropdown .day:disabled),
    .datepicker :global(#datepicker-dropdown .day.day-disabled) {
        background: transparent;
        color: color-mix(in srgb, var(--color-content) 30%, transparent);
        cursor: not-allowed;
        pointer-events: none;
    }

    .datepicker :global(#datepicker-dropdown .day[aria-selected="true"]) {
        background: var(--color-secondary);
        color: var(--color-white);
    }

    .datepicker :global(#datepicker-dropdown .day[aria-selected="true"]:hover) {
        background: color-mix(in srgb, var(--color-secondary) 85%, black);
        color: var(--color-white);
    }
</style>
