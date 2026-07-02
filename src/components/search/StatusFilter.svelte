<script lang="ts">
    import { t } from "../../i18n/store";
    import { ALL_PUBLIC_STATES, type PublicProjectState } from "../../utils/projectStatus";
    import DropdownMenu from "../library/dropdown/DropdownMenu.svelte";

    import type { DropdownOption } from "../library/dropdown/dropdown.types";

    let {
        selectedStates = ALL_PUBLIC_STATES,
        onStatesChange,
    }: {
        selectedStates?: PublicProjectState[];
        onStatesChange: (states: PublicProjectState[]) => void;
    } = $props();

    let options = $derived(
        ALL_PUBLIC_STATES.map((state) => ({
            id: state,
            label: $t(`domain.project.status.${state}`),
            selected: selectedStates.includes(state),
        })),
    );

    let selected = $derived(options.filter((option) => option.selected));

    let chevronLabel = $derived(
        selected.length && selected.length < ALL_PUBLIC_STATES.length
            ? selected.map((option) => option.label).join(", ")
            : $t("domain.project.status.all"),
    );

    function handleChange(option: DropdownOption) {
        const id = option.id as PublicProjectState;
        const next = option.selected
            ? [...selectedStates, id]
            : selectedStates.filter((state) => state !== id);
        onStatesChange(next);
    }
</script>

<DropdownMenu
    {options}
    {selected}
    class="border"
    variant="multiselect"
    {chevronLabel}
    isOpen={false}
    onChange={handleChange}
/>
