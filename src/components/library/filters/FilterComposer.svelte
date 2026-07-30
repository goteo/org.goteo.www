<script lang="ts">
    import FilterComposerRow from "./FilterComposerRow.svelte";
    import { t } from "../../../i18n/store";
    import {
        getAllFilterSubjects,
        createFilterRow,
        type FilterRow as FilterRowType,
        type FilterOperator,
        type FilterResource,
    } from "../../../utils/filterComposer";
    import PlusIcon from "../../icons/actions/PlusIcon.svelte";
    import Button from "../buttons/Button.svelte";

    interface RowState {
        subjectKey: string;
        operator: FilterOperator | "";
        referent: string | number | Date | string[];
    }

    interface Props {
        resource?: FilterResource;
        onParamsChange?: (params: Record<string, string | string[]>) => void;
    }

    let { resource = undefined, onParamsChange }: Props = $props();

    let subjects = $derived(getAllFilterSubjects(resource));
    let rows = $state<RowState[]>([]);

    let params = $derived.by(() => {
        const result: Record<string, string | string[]> = {};

        for (const row of rows) {
            if (!row.subjectKey || !row.operator || !row.referent) continue;

            const subject = subjects.find((s) => s.key === row.subjectKey);
            if (!subject) continue;

            const filterRow: FilterRowType = createFilterRow(
                subject,
                row.operator as FilterOperator,
                row.referent,
            );

            const serialized = filterRow.serialize();
            for (const [key, value] of Object.entries(serialized)) {
                if (key.endsWith("[]") && Array.isArray(value) && result[key]) {
                    result[key] = [...(result[key] as string[]), ...value];
                } else {
                    result[key] = value;
                }
            }
        }

        return result;
    });

    $effect(() => {
        onParamsChange?.(params);
    });

    function addRow() {
        rows = [...rows, { subjectKey: "", operator: "", referent: "" }];
    }

    function removeRow(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }
</script>

<div class="flex flex-col gap-4">
    {#each rows as row, i}
        <FilterComposerRow
            bind:subjectKey={row.subjectKey}
            bind:operator={row.operator}
            bind:referent={row.referent}
            {subjects}
            onremove={() => removeRow(i)}
        />
    {/each}

    <div>
        <Button class="" kind="ghost" onclick={addRow}>
            <PlusIcon />
            {$t("pages.admin.filter.composer.addFilter")}
        </Button>
    </div>
</div>
