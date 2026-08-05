<script lang="ts">
    import { t } from "../../i18n/store";
    import {
        ALL_PUBLIC_STATUSES,
        expandPublicStatuses,
        parsePublicStatuses,
        type ProjectPublicStatus,
    } from "../../utils/projectStatus";
    import DropdownMenu from "../library/dropdown/DropdownMenu.svelte";

    import type { DropdownOption } from "../library/dropdown/dropdown.types";

    let {
        statuses = [],
        onStatusesChange,
    }: {
        /** Current API `status[]` filter values. */
        statuses?: string[];
        /** Receives the expanded API `status[]` the store expects; empty means default (all). */
        onStatusesChange: (statuses: string[]) => void;
    } = $props();

    let selectedPublicStatuses = $derived(parsePublicStatuses(statuses));

    let options = $derived(
        ALL_PUBLIC_STATUSES.map((publicStatus) => ({
            id: publicStatus,
            label: $t(`domain.project.status.${publicStatus}`),
            selected: selectedPublicStatuses.includes(publicStatus),
        })),
    );

    let selected = $derived(options.filter((option) => option.selected));

    function handleChange(option: DropdownOption) {
        const id = option.id as ProjectPublicStatus;
        const next = option.selected
            ? [...selectedPublicStatuses, id]
            : selectedPublicStatuses.filter((publicStatus) => publicStatus !== id);
        // Default selection (all) is reported as empty so it stays out of the URL.
        onStatusesChange(
            next.length && next.length < ALL_PUBLIC_STATUSES.length
                ? expandPublicStatuses(next)
                : [],
        );
    }
</script>

<DropdownMenu
    {options}
    {selected}
    class="border"
    variant="multiselect"
    label={$t("domain.project.status.all")}
    isOpen={false}
    onChange={handleChange}
/>
