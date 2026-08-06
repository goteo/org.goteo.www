<script lang="ts">
    import { clickOutside } from "flowbite-svelte";

    import { t } from "../../../i18n/store";
    import Close from "../../icons/navigation/Close.svelte";
    import TerritoryFilter from "../../search/TerritoryFilter.svelte";
    import DropdownMenu from "../dropdown/DropdownMenu.svelte";
    import DateInput from "../inputs/DateInput.svelte";
    import Select from "../inputs/Select.svelte";
    import TextInput from "../inputs/TextInput.svelte";

    import type {
        FilterSubject,
        FilterOperator,
        FilterOption,
    } from "../../../utils/filterComposer";
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
    let showStaticDropdown = $state(false);
    let showSuggestSearch = $state(false);
    let showTerritoryDropdown = $state(false);

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

        const subject = subjects.find((s) => s.key === subjectKey);
        if (!subject) {
            dropdownOptions = [];
            dropdownSelected = [];
            territoryInit = { countries: [], subLvl1: [], subLvl2: [] };
            return;
        }

        if (subject.customReferent) {
            territoryInit = parseTerritoryRef(referent as string);
            showTerritoryDropdown = true;
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

    async function handleSuggest(q: string) {
        if (!currentSubject?.suggest) return;
        if (!q) {
            dropdownOptions = [...dropdownSelected];
            return;
        }
        const results: FilterOption[] = await currentSubject.suggest(q);
        dropdownOptions = results.map((r) => ({
            id: r.value,
            label: r.label,
            selected: dropdownSelected.some((s) => s.id === r.value),
        }));
    }

    function handleSuggestChange(option: DropdownOption) {
        if (operator === "equals" && !currentSubject?.allowsMultipleEquals) {
            if (option.selected) {
                dropdownSelected = [option];
                referent = option.id;
                showSuggestSearch = false;
            } else {
                dropdownSelected = [];
                referent = "";
                showSuggestSearch = true;
            }
        } else {
            const current = Array.isArray(referent) ? referent : [];
            const updated = option.selected
                ? [...current, option.id]
                : current.filter((id) => id !== option.id);
            referent = updated;
            if (updated.length === 0) {
                showSuggestSearch = true;
            }
        }
    }

    function handleClearSuggestTag() {
        dropdownSelected = [];
        referent = "";
        showSuggestSearch = true;
    }

    function handleRemoveTag(item: DropdownOption) {
        dropdownSelected = dropdownSelected.filter((s) => s.id !== item.id);
        referent = (referent as string[]).filter((id) => id !== item.id);
        if (dropdownSelected.length === 0) {
            showStaticDropdown = true;
            showSuggestSearch = true;
        }
    }

    function subjectLabel(key: string): string {
        return $t(`pages.admin.filter.composer.subject.${key}`);
    }

    function operatorLabel(op: FilterOperator): string {
        return $t(`pages.admin.filter.composer.operator.${op}`);
    }

    function handleTerritoryChange(t: {
        countries: string[];
        subLvl1: string[];
        subLvl2: string[];
    }) {
        referent = JSON.stringify(t);
        const hasSelection = t.countries.length > 0 || t.subLvl1.length > 0 || t.subLvl2.length > 0;
        if (hasSelection) {
            showTerritoryDropdown = false;
        }
    }

    function getTerritoryCodes(raw: string): string[] {
        try {
            const t = JSON.parse(raw);
            return [...(t.countries || []), ...(t.subLvl1 || []), ...(t.subLvl2 || [])];
        } catch {
            return [];
        }
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
        <Select
            bind:value={subjectKey}
            labelText={$t("pages.admin.filter.composer.subjectPlaceholder")}
        >
            <option value="">{$t("pages.admin.filter.composer.subjectPlaceholder")}</option>
            {#each subjects as subject}
                <option value={subject.key}>{subjectLabel(subject.key)}</option>
            {/each}
        </Select>
    </div>

    <div class="flex-1">
        <Select
            bind:value={operator}
            disabled={!subjectKey}
            labelText={$t("pages.admin.filter.composer.operatorPlaceholder")}
        >
            <option value="">{$t("pages.admin.filter.composer.operatorPlaceholder")}</option>
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
                            {item.label}
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
                        label={$t("pages.admin.filter.composer.referentPlaceholder")}
                        bind:isOpen={showStaticDropdown}
                    />
                </div>
            {/if}
        {:else if currentSubject?.options && operator === "equals" && subjectKey}
            <Select
                bind:value={referent as string}
                disabled={!operator}
                labelText={$t("pages.admin.filter.composer.referentPlaceholder")}
            >
                <option value="">{$t("pages.admin.filter.composer.referentPlaceholder")}</option>
                {#each currentSubject.options as opt}
                    <option value={opt.value}>{$t(opt.label)}</option>
                {/each}
            </Select>
        {:else if currentSubject?.suggest && subjectKey && operator === "equals" && !currentSubject.allowsMultipleEquals}
            {#if referent && !Array.isArray(referent) && !showSuggestSearch}
                <div
                    class="border-secondary flex items-center justify-between rounded-lg border bg-white p-4"
                >
                    <button
                        type="button"
                        class="text-secondary cursor-pointer text-sm hover:underline"
                        onclick={handleClearSuggestTag}
                    >
                        {dropdownSelected[0]?.label ?? referent}
                    </button>
                    <button
                        type="button"
                        onclick={handleClearSuggestTag}
                        class="text-tertiary hover:text-tertiary/80 cursor-pointer"
                        aria-label={$t("pages.admin.filter.composer.removeFilter")}
                    >
                        <Close width="16" height="16" />
                    </button>
                </div>
            {:else}
                <DropdownMenu
                    searchClasses="border-secondary"
                    variant="multiselect"
                    options={dropdownOptions}
                    bind:selected={dropdownSelected}
                    hasSearch
                    onSearch={handleSuggest}
                    onChange={handleSuggestChange}
                />
            {/if}
        {:else if currentSubject?.suggest && subjectKey && operator && (operator !== "equals" || currentSubject.allowsMultipleEquals)}
            {#if !showSuggestSearch && dropdownSelected.length > 0}
                <div
                    class="border-secondary flex min-h-14 cursor-pointer flex-wrap items-center gap-2 rounded-lg border bg-white p-3"
                    onclick={() => {
                        setTimeout(() => (showSuggestSearch = true));
                    }}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => e.key === "Enter" && (showSuggestSearch = true)}
                >
                    {#each dropdownSelected as item}
                        <span
                            class="bg-tertiary/10 border-secondary inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm"
                        >
                            {item.label}
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
                <div use:clickOutside={() => (showSuggestSearch = false)}>
                    <DropdownMenu
                        searchClasses="border-secondary"
                        variant="multiselect"
                        options={dropdownOptions}
                        bind:selected={dropdownSelected}
                        hasSearch
                        onSearch={handleSuggest}
                        onChange={handleSuggestChange}
                        bind:isOpen={showSuggestSearch}
                    />
                </div>
            {/if}
        {:else if currentSubject?.customReferent && subjectKey && operator}
            {#if !showTerritoryDropdown}
                {@const codes = getTerritoryCodes(referent as string)}
                {#if codes.length > 0}
                    <div
                        class="border-secondary flex min-h-14 cursor-pointer flex-wrap items-center gap-2 rounded-lg border bg-white p-3"
                        onclick={() => {
                            setTimeout(() => (showTerritoryDropdown = true));
                        }}
                        role="button"
                        tabindex="0"
                        onkeydown={(e) => e.key === "Enter" && (showTerritoryDropdown = true)}
                    >
                        {#each codes as code}
                            <span
                                class="bg-tertiary/10 border-secondary inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm"
                            >
                                {code}
                            </span>
                        {/each}
                    </div>
                {:else}
                    <TerritoryFilter
                        selectedTerritory={territoryInit}
                        onTerritoryChange={handleTerritoryChange}
                    />
                {/if}
            {:else}
                <TerritoryFilter
                    selectedTerritory={territoryInit}
                    onTerritoryChange={handleTerritoryChange}
                />
            {/if}
        {:else if currentSubject?.type === "date"}
            <DateInput
                value={typeof referent === "string" && referent ? new Date(referent) : new Date()}
                disabled={!subjectKey || !operator}
                onInput={(date) => (referent = date)}
                hasValue={!!(typeof referent === "string" && referent)}
                labelText={$t("pages.admin.filter.composer.referentPlaceholder")}
            />
        {:else if currentSubject?.type === "number"}
            <TextInput
                bind:value={referent as number}
                disabled={!subjectKey || !operator}
                type="number"
                labelText={$t("pages.admin.filter.composer.referentPlaceholder")}
            />
        {:else}
            <TextInput
                bind:value={referent as string}
                disabled={!subjectKey || !operator}
                labelText={$t("pages.admin.filter.composer.referentPlaceholder")}
            />
        {/if}
    </div>

    <button
        type="button"
        onclick={onremove}
        class="mb-0.5 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white"
        aria-label={$t("pages.admin.filter.composer.removeFilter")}
    >
        <Close />
    </button>
</div>
