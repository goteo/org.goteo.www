<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { t } from "../../i18n/store";
    import Close from "../icons/Close.svelte";
    import SearchIcon from "../icons/Search.svelte";

    interface Props {
        class?: ClassNameValue;
        value?: string;
        placeholder?: string;
        name?: string;
        id?: string;
        label?: string;
        "data-testid"?: string;
        onsubmit?: (value: string) => void;
        oninput?: (e: Event) => void;
        onkeydown?: (e: KeyboardEvent) => void;
        onclear?: () => void;
    }

    let {
        class: classes = "",
        value = $bindable(""),
        placeholder = $t("domain.navigation.search.placeholder"),
        name = "search",
        id = "search",
        label = undefined,
        "data-testid": dataTestId,
        onsubmit,
        oninput,
        onkeydown,
        onclear,
    }: Props = $props();
</script>

<div
    class={twMerge(
        "relative flex h-14 w-full items-center justify-between rounded-3xl border border-black bg-white p-4",
        classes,
    )}
>
    {#if label !== undefined && value}
        <label for={id} class="absolute -top-3 left-3 bg-white px-1 text-sm text-black">
            {label}
        </label>
    {/if}

    <input
        type="text"
        {name}
        {id}
        {placeholder}
        bind:value
        {oninput}
        {onkeydown}
        data-testid={dataTestId}
        class="flex-1 border-none bg-white text-black outline-none focus:ring-0"
    />

    {#if value && onclear}
        <button type="button" onclick={onclear} class="text-secondary">
            <Close class="h-5 w-5" />
        </button>
    {:else}
        <button
            type="button"
            onclick={() => {
                if (onsubmit) onsubmit(value);
            }}
            class="text-secondary"
        >
            <SearchIcon class="h-6 w-6" />
        </button>
    {/if}
</div>
