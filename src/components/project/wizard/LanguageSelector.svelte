<!--
    Language Selector Component

    Allows users to select one primary language and optionally add secondary languages.

    Features:
    - Primary language dropdown (required)
    - Add secondary languages with "Añadir outro" button
    - Remove secondary languages
    - Excludes already-selected languages from dropdowns
    - Validation on blur

    Design System:
    - Uses Select component from library
    - Error states with red border and message
-->
<script lang="ts">
    import { t } from "../../../i18n/store";
    import Select from "../../library/Select.svelte";
    import {
        validationErrors,
        touchedFields,
        markFieldAsTouched,
    } from "../../../stores/wizard-state";

    interface LanguageOption {
        code: string;
        name: string;
    }

    interface LanguageSelectorProps {
        languages: string[];
        onChange: (languages: string[]) => void;
    }

    let { languages = [], onChange }: LanguageSelectorProps = $props();

    // Available languages - using translations
    const availableLanguages = $derived<LanguageOption[]>([
        { code: "es", name: $t("wizard.configuration.languages.options.es") },
        { code: "en", name: $t("wizard.configuration.languages.options.en") },
        { code: "ca", name: $t("wizard.configuration.languages.options.ca") },
        { code: "fr", name: $t("wizard.configuration.languages.options.fr") },
        { code: "de", name: $t("wizard.configuration.languages.options.de") },
        { code: "it", name: $t("wizard.configuration.languages.options.it") },
        { code: "pt", name: $t("wizard.configuration.languages.options.pt") },
    ]);

    // Local state for language selection
    let primaryLanguage = $state(languages[0] || "");
    let secondaryLanguages = $state<string[]>(languages.slice(1));

    // Reactive validation errors
    const errors = $derived($validationErrors);
    const touched = $derived($touchedFields);
    const showError = $derived(touched.has("languages") && errors.languages);

    /**
     * Handle primary language change
     */
    function handlePrimaryChange(value: string) {
        primaryLanguage = value;
        updateLanguages();
    }

    /**
     * Handle secondary language change
     */
    function handleSecondaryChange(index: number, value: string) {
        secondaryLanguages[index] = value;
        updateLanguages();
    }

    /**
     * Add a new secondary language slot
     */
    function addSecondaryLanguage() {
        secondaryLanguages = [...secondaryLanguages, ""];
    }

    /**
     * Remove a secondary language
     */
    function removeSecondaryLanguage(index: number) {
        secondaryLanguages = secondaryLanguages.filter((_, i) => i !== index);
        updateLanguages();
    }

    /**
     * Update parent component with all languages
     */
    function updateLanguages() {
        const allLanguages = [
            primaryLanguage,
            ...secondaryLanguages.filter((lang) => lang !== ""),
        ].filter(Boolean);

        onChange(allLanguages);
    }

    /**
     * Handle blur event for validation
     */
    function handleBlur() {
        markFieldAsTouched("languages");
    }

    /**
     * Get available languages for a dropdown, excluding already-selected ones
     */
    function getAvailableForDropdown(currentValue: string): LanguageOption[] {
        const selectedLanguages = [primaryLanguage, ...secondaryLanguages];
        return availableLanguages.filter(
            (lang) => !selectedLanguages.includes(lang.code) || lang.code === currentValue,
        );
    }
</script>

<div class="space-y-4">
    <!-- Primary Language -->
    <Select
        bind:value={primaryLanguage}
        name="primary-language"
        labelText={$t("wizard.configuration.languages.primaryLabel")}
        required={true}
        error={showError ? errors.languages : undefined}
        onBlur={handleBlur}
        onChange={handlePrimaryChange}
    >
        <option value="">{$t("wizard.configuration.languages.selectPlaceholder")}</option>
        {#each getAvailableForDropdown(primaryLanguage) as lang}
            <option value={lang.code}>{lang.name}</option>
        {/each}
    </Select>

    <!-- Secondary Languages -->
    {#each secondaryLanguages as secondary, index}
        <div class="flex gap-2">
            <div class="flex-1">
                <Select
                    bind:value={secondaryLanguages[index]}
                    name="secondary-language-{index}"
                    labelText={$t("wizard.configuration.languages.secondaryLabel", {
                        index: index + 1,
                    })}
                    onChange={(value) => handleSecondaryChange(index, value)}
                >
                    <option value=""
                        >{$t("wizard.configuration.languages.selectPlaceholder")}</option
                    >
                    {#each getAvailableForDropdown(secondary) as lang}
                        <option value={lang.code}>{lang.name}</option>
                    {/each}
                </Select>
            </div>
            <div class="flex items-end pb-2">
                <button
                    type="button"
                    onclick={() => removeSecondaryLanguage(index)}
                    data-testid="language-remove-btn-{index}"
                    class="hover:bg-light-muted text-secondary hover:text-tertiary rounded-lg p-2 transition-colors"
                    aria-label={$t("wizard.configuration.languages.removeButton")}
                >
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    {/each}

    <!-- Add Secondary Language Button -->
    <button
        type="button"
        onclick={addSecondaryLanguage}
        data-testid="language-add-btn"
        class="text-secondary hover:text-tertiary flex items-center gap-1 text-sm font-medium transition-colors"
    >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v8m-4-4h8" />
        </svg>
        {$t("wizard.configuration.languages.addButton")}
    </button>
</div>
