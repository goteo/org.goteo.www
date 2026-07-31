<script lang="ts">
    import { t } from "../../i18n/store";
    import type { Gateway } from "../../openapi/client";
    import type { DropdownOption } from "../library/dropdown/dropdown.types";
    import DropdownMenu from "../library/dropdown/DropdownMenu.svelte";

    let {
        gateways,
        onChange,
    }: { gateways: Gateway[]; onChange?: (selected: Gateway[] | undefined) => void } = $props();

    let options = $derived(
        gateways.map((g) => ({
            id: g.id!,
            label: g.name!,
            selected: true,
        })),
    );

    let selected = $state<DropdownOption[]>([]);

    $effect(() => {
        selected = options.filter((o) => o.selected);
    });

    function handleChange() {
        const selection = gateways.filter((g) => selected.some((o) => o.id === g.id));

        // Filtering by all gateways is the same as not filtering by any gateway
        onChange?.(selection.length !== gateways.length ? selection : undefined);
    }
</script>

<DropdownMenu
    class="border-secondary border"
    variant="multiselect"
    label={$t("pages.admin.charges.filters.gateway.label")}
    onChange={handleChange}
    {options}
    bind:selected
/>
