<script lang="ts">
    import Select from "../inputs/Select.svelte";
    import TextInput from "../inputs/TextInput.svelte";
    import DateInput from "../inputs/DateInput.svelte";
    import DropdownMenu from "../dropdown/DropdownMenu.svelte";
    import { clickOutside } from "flowbite-svelte";
    import { t } from "../../../i18n/store";
    import type {
        FilterSubject,
        FilterOperator,
        FilterOption,
    } from "../../../utils/filterComposer";
    import type { DropdownOption } from "../dropdown/dropdown.types";
    import Close from "../../icons/navigation/Close.svelte";

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
    let showSuggestSearch = $state(true);
    let showStaticDropdown = $state(true);

    let previousSubjectKey = $state("");

    $effect(() => {
        if (subjectKey === previousSubjectKey) return;
        previousSubjectKey = subjectKey;
        operator = "";

        const subject = subjects.find((s) => s.key === subjectKey);
        if (!subject || !subject.options) {
            dropdownOptions = [];
            dropdownSelected = [];
            return;
        }
        dropdownOptions = subject.options.map((o) => ({
            id: o.value,
            label: o.label,
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
        if (operator === "equals") {
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
</script>

<div class="flex items-center gap-3">
    <div class="flex-1">
        <Select
            bind:value={subjectKey}
                labelText={$t("pages.admin.filter.composer.subjectPlaceholder")}
            >
                <option value="">{$t("pages.admin.filter.composer.subjectPlaceholder")}</option
            >
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
            <option value=""
                >{$t("pages.admin.filter.composer.operatorPlaceholder")}</option
            >
            {#each compatibleOperators as op}
                <option value={op}>{operatorLabel(op)}</option>
            {/each}
        </Select>
    </div>

    <div class="flex-1">
        {#if currentSubject?.options && operator === "equals" && subjectKey}
            <Select
                bind:value={referent as string}
                disabled={!operator}
                labelText={$t("pages.admin.filter.composer.referentPlaceholder")}
            >
                <option value=""
                    >{$t("pages.admin.filter.composer.referentPlaceholder")}</option
                >
                {#each currentSubject.options as opt}
                    <option value={opt.value}>{opt.label}</option>
                {/each}
            </Select>
        {:else if currentSubject?.options && operator === "is_any_of" && subjectKey}
            {#if !showStaticDropdown && dropdownSelected.length > 0}
                <div
                    class="border-secondary flex min-h-14 cursor-pointer flex-wrap items-center gap-2 rounded-lg border bg-white p-3"
                    onclick={() => (showStaticDropdown = true)}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => e.key === "Enter" && (showStaticDropdown = true)}
                >
                    {#each dropdownSelected as item}
                        <span class="bg-tertiary/10 border-secondary inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm">
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
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div use:clickOutside={() => (showStaticDropdown = false)}>
                    <DropdownMenu
                        searchClasses="border-secondary"
                        variant="multiselect"
                        options={dropdownOptions}
                        bind:selected={dropdownSelected}
                        onChange={handleStaticChange}
                        chevronLabel={$t("pages.admin.filter.composer.referentPlaceholder")}
                    />
                </div>
            {/if}
        {:else if currentSubject?.suggest && subjectKey && operator === "equals"}
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
        {:else if currentSubject?.suggest && subjectKey && operator}
            {#if !showSuggestSearch && dropdownSelected.length > 0}
                <div
                    class="border-secondary flex min-h-14 cursor-pointer flex-wrap items-center gap-2 rounded-lg border bg-white p-3"
                    onclick={() => (showSuggestSearch = true)}
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
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div use:clickOutside={() => (showSuggestSearch = false)}>
                    <DropdownMenu
                        searchClasses="border-secondary"
                        variant="multiselect"
                        options={dropdownOptions}
                        bind:selected={dropdownSelected}
                        hasSearch
                        onSearch={handleSuggest}
                        onChange={handleSuggestChange}
                    />
                </div>
            {/if}
        {:else if currentSubject?.type === "date"}
            <DateInput
                value={typeof referent === "string" && referent ? new Date(referent) : new Date()}
                disabled={!subjectKey || !operator}
                onInput={(date) => (referent = date)}
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
