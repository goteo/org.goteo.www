<script lang="ts">
    import { clickOutside } from "flowbite-svelte";

    import { t } from "../../../i18n/store";
    import Close from "../../icons/navigation/Close.svelte";
    import DropdownMenu from "../dropdown/DropdownMenu.svelte";
    import DateInput from "../inputs/DateInput.svelte";
    import ResourceSearch from "../inputs/ResourceSearch.svelte";
    import Select from "../inputs/Select.svelte";
    import TerritoryInput from "../inputs/TerritoryInput.svelte";
    import TextInput from "../inputs/TextInput.svelte";

    import type { FilterSubject, FilterOperator } from "../../../utils/filterComposer";
    import type { SearchResultItem } from "../../../utils/resourceSearch";
    import type { DropdownOption } from "../dropdown/dropdown.types";

    interface Props {
        subjects: FilterSubject[];
        subjectKey?: string;
        operator?: FilterOperator | "";
        referent?: string | number | Date | string[];
        onremove: () => void;
    }

    let {
        subjects,
        subjectKey = $bindable(""),
        operator = $bindable("" as FilterOperator | ""),
        referent = $bindable("" as string | number | Date | string[]),
        onremove,
    }: Props = $props();

    let compatibleOperators = $derived(
        subjects.find((s) => s.key === subjectKey)?.compatibleOperators ?? [],
    );

    let currentSubject = $derived(subjects.find((s) => s.key === subjectKey));

    let dropdownOptions = $state<DropdownOption[]>([]);
    let dropdownSelected = $state<DropdownOption[]>([]);
    let suggestSelected = $state<SearchResultItem[]>([]);
    let showStaticDropdown = $state(false);

    /** The suggest control is multi unless the subject only allows a single "equals". */
    const suggestIsMultiple = $derived(
        operator !== "equals" || !!currentSubject?.allowsMultipleEquals,
    );

    let previousSubjectKey = $state("");
    let territoryInit = $state<{
        countries: string[];
        subLvl1: string[];
        subLvl2: string[];
    }>({ countries: [], subLvl1: [], subLvl2: [] });

    $effect(() => {
        if (subjectKey === previousSubjectKey) return;
        previousSubjectKey = subjectKey;
        operator = "";
        referent = "";

        suggestSelected = [];

        const subject = subjects.find((s) => s.key === subjectKey);
        if (!subject) {
            dropdownOptions = [];
            dropdownSelected = [];
            territoryInit = { countries: [], subLvl1: [], subLvl2: [] };
            return;
        }

        if (subject.serialize) {
            territoryInit = parseTerritoryRef(referent as string);
            dropdownOptions = [];
            dropdownSelected = [];
            return;
        }

        if (!subject.options) {
            dropdownOptions = [];
            dropdownSelected = [];
            return;
        }
        dropdownOptions = subject.options.map((o) => ({
            id: o.value,
            label: $t(o.label),
            selected: false,
        }));
        dropdownSelected = [];
    });

    function handleStaticChange(option: DropdownOption) {
        const current = Array.isArray(referent) ? referent : [];
        const updated = option.selected
            ? [...current, option.id]
            : current.filter((id) => id !== option.id);
        referent = updated;
        if (updated.length === 0) {
            showStaticDropdown = true;
        }
    }

    function handleSuggestChange(items: SearchResultItem[]) {
        referent = suggestIsMultiple ? items.map((item) => item.value) : (items[0]?.value ?? "");
    }

    function handleRemoveTag(item: DropdownOption) {
        dropdownSelected = dropdownSelected.filter((s) => s.id !== item.id);
        referent = (referent as string[]).filter((id) => id !== item.id);
        if (dropdownSelected.length === 0) {
            showStaticDropdown = true;
        }
    }

    function subjectLabel(key: string): string {
        return $t(`domain.filterComposer.subject.${key}`);
    }

    function operatorLabel(op: FilterOperator): string {
        return $t(`domain.filterComposer.operator.${op}`);
    }

    function handleTerritoryChange(t: {
        countries: string[];
        subLvl1: string[];
        subLvl2: string[];
    }) {
        referent = JSON.stringify(t);
    }

    function parseTerritoryRef(raw: string): {
        countries: string[];
        subLvl1: string[];
        subLvl2: string[];
    } {
        try {
            const parsed = JSON.parse(raw);
            return {
                countries: parsed.countries || [],
                subLvl1: parsed.subLvl1 || [],
                subLvl2: parsed.subLvl2 || [],
            };
        } catch {
            return { countries: [], subLvl1: [], subLvl2: [] };
        }
    }
</script>

<div class="flex items-center gap-3">
    <div class="flex-1">
        <Select bind:value={subjectKey} labelText={$t("domain.filterComposer.subjectPlaceholder")}>
            <option value="">{$t("domain.filterComposer.subjectPlaceholder")}</option>
            {#each subjects as subject}
                <option value={subject.key}>{subjectLabel(subject.key)}</option>
            {/each}
        </Select>
    </div>

    <div class="flex-1">
        <Select
            bind:value={operator}
            disabled={!subjectKey}
            labelText={$t("domain.filterComposer.operatorPlaceholder")}
        >
            <option value="">{$t("domain.filterComposer.operatorPlaceholder")}</option>
            {#each compatibleOperators as op}
                <option value={op}>{operatorLabel(op)}</option>
            {/each}
        </Select>
    </div>

    <div class="flex-1">
        {#if currentSubject?.options && operator && subjectKey && (operator === "is_any_of" || (operator === "equals" && currentSubject.allowsMultipleEquals))}
            {#if !showStaticDropdown && dropdownSelected.length > 0}
                <div
                    class="border-secondary flex min-h-14 cursor-pointer flex-wrap items-center gap-2 rounded-lg border bg-white p-3"
                    onclick={() => {
                        setTimeout(() => (showStaticDropdown = true));
                    }}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => e.key === "Enter" && (showStaticDropdown = true)}
                >
                    {#each dropdownSelected as item}
                        <span
                            class="bg-tertiary/10 border-secondary inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm"
                        >
                            {@html item.label}
                            <button
                                type="button"
                                class="text-tertiary hover:text-tertiary/80 cursor-pointer"
                                onclick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTag(item);
                                }}
                            >
                                <Close width="12" height="12" />
                            </button>
                        </span>
                    {/each}
                </div>
            {:else}
                <div use:clickOutside={() => (showStaticDropdown = false)}>
                    <DropdownMenu
                        searchClasses="border-secondary"
                        variant="multiselect"
                        options={dropdownOptions}
                        bind:selected={dropdownSelected}
                        onChange={handleStaticChange}
                        label={$t("domain.filterComposer.referentPlaceholder")}
                        bind:isOpen={showStaticDropdown}
                    />
                </div>
            {/if}
        {:else if currentSubject?.options && operator === "equals" && subjectKey}
            <Select
                bind:value={referent as string}
                disabled={!operator}
                labelText={$t("domain.filterComposer.referentPlaceholder")}
            >
                <option value="">{$t("domain.filterComposer.referentPlaceholder")}</option>
                {#each currentSubject.options as opt}
                    <option value={opt.value}>{$t(opt.label)}</option>
                {/each}
            </Select>
        {:else if currentSubject?.suggest && subjectKey && operator}
            <ResourceSearch
                search={currentSubject.suggest}
                multiple={suggestIsMultiple}
                bind:selected={suggestSelected}
                label={$t("domain.filterComposer.referentPlaceholder")}
                placeholder={$t("domain.filterComposer.referentPlaceholder")}
                highlight={false}
                onChange={handleSuggestChange}
                onClear={() => (referent = suggestIsMultiple ? [] : "")}
            />
        {:else if currentSubject?.serialize && subjectKey && operator}
            <TerritoryInput
                multiple
                selectedTerritory={territoryInit}
                onTerritoryChange={handleTerritoryChange}
            />
        {:else if currentSubject?.type === "date"}
            <DateInput
                value={typeof referent === "string" && referent ? new Date(referent) : new Date()}
                disabled={!subjectKey || !operator}
                onInput={(date) => (referent = date)}
                hasValue={!!(typeof referent === "string" && referent)}
                labelText={$t("domain.filterComposer.referentPlaceholder")}
            />
        {:else if currentSubject?.type === "number"}
            <TextInput
                bind:value={referent as number}
                disabled={!subjectKey || !operator}
                type="number"
                labelText={$t("domain.filterComposer.referentPlaceholder")}
            />
        {:else}
            <TextInput
                bind:value={referent as string}
                disabled={!subjectKey || !operator}
                labelText={$t("domain.filterComposer.referentPlaceholder")}
            />
        {/if}
    </div>

    <button
        type="button"
        onclick={onremove}
        class="mb-0.5 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white"
        aria-label={$t("domain.filterComposer.removeFilter")}
    >
        <Close />
    </button>
</div>
