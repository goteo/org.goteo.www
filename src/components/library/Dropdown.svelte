<script lang="ts">
    import { clickOutside } from "flowbite-svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";
    import ChevronDown from "../../svgs/ChevronDown.svelte";

    interface Option {
        value: string | number;
        text: string;
        disabled?: boolean;
    }

    interface Props {
        options: Option[];
        selection?: Option[];
        open?: boolean;
        onSelect?: (selection: Option[]) => void;
        class?: ClassNameValue;
    }

    let {
        options,
        selection = [],
        open = $bindable(false),
        onSelect,
        class: classes = "",
    }: Props = $props();

    function handleSelect(option: Option) {
        const index = selection.findIndex((o) => o.value === option.value);

        if (!index) {
            selection = [...options, option];
        } else {
            selection = options.filter((o) => o.value !== option.value);
        }

        onSelect?.(selection);
    }

    function toggleDropdown() {
        open = !open;

        console.log("toggle", open);
    }

    function handleOutside() {
        if (open) {
            open = false;
        }
    }
</script>

<div class="relative w-full" use:clickOutside={handleOutside}>
    <button
        type="button"
        class="flex w-full items-center gap-2 rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-100"
        onclick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={open}
    >
        <ChevronDown rotate={open} />
    </button>

    {#if open}
        <div
            role="listbox"
            class={twMerge(
                "border-grey divide-grey absolute top-full right-0 left-0 z-50 mt-1 overflow-y-auto rounded-[8px] border shadow-lg",
                classes,
            )}
        >
            {#each options as option, index}
                <button
                    type="button"
                    class="hover:bg-variant1 focus:bg-variant1 w-full bg-white p-4 text-left text-black hover:cursor-pointer focus:outline-none"
                    class:border={index + 1 !== options.length}
                    onclick={(e) => handleSelect(option)}
                >
                    {option.text}
                </button>
            {/each}
        </div>
    {/if}
</div>
