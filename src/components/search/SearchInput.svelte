<script lang="ts">
    import { untrack } from "svelte";

    import { t } from "../../i18n/store";
    import Search from "../library/inputs/Search.svelte";

    interface Props {
        value?: string;
        class?: string;
        "data-testid"?: string;
        onSearch?: (query: string) => void;
        onEnter?: () => void;
        onClear?: () => void;
        placeholder?: string;
    }

    let {
        value = "",
        class: className = "",
        "data-testid": dataTestId,
        onSearch,
        onEnter,
        onClear,
        placeholder = "",
    }: Props = $props();

    // Seeds the initial render; the effect below keeps it in sync afterwards.
    let searchQuery = $state(untrack(() => value));

    $effect(() => {
        searchQuery = value;
    });

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        searchQuery = target.value;
        onSearch?.(searchQuery);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            onEnter?.() || onSearch?.(searchQuery);
        }
    }

    function clearSearch() {
        searchQuery = "";
        onSearch?.("");
        onClear?.();
    }
</script>

<Search
    bind:value={searchQuery}
    label={$t("pages.search.input.label")}
    placeholder={placeholder || $t("pages.search.input.placeholder")}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onsubmit={() => onEnter?.() || onSearch?.(searchQuery)}
    onclear={clearSearch}
    data-testid={dataTestId}
    class=" {className}"
/>
